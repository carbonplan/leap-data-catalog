# /// script
# requires-python = ">=3.11"
# dependencies = ["httpx", "pyyaml"]
# ///
"""One-off: old pangeo-forge web catalog JSON -> catalog/datasets.yaml.

- Drops stores on the retired Pangeo OSN (ncsa.osn.xsede.org) and feedstocks with no stores.
- Rewrites OSN https URLs to s3://bucket/key.
- Repoints gs://leap-persistent* stores to their leap-pangeo-pipeline copy when one exists
  (matched on the store basename); otherwise leaves the gs:// href with `todo: copy`.

Usage: uv run scripts/seed_datasets.py
"""

from __future__ import annotations

import re
from pathlib import Path
from urllib.parse import urlparse

import httpx
import yaml

SOURCE = (
    "https://raw.githubusercontent.com/leap-stc/data-management/main/"
    "catalog/output/consolidated-web-catalog.json"
)
OSN = "https://nyu1.osn.mghpcc.org"
PIPELINE = "leap-pangeo-pipeline"
OUT = Path(__file__).resolve().parents[1] / "catalog" / "datasets.yaml"


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def list_prefixes(prefix: str = "") -> set[str]:
    params = {"list-type": "2", "delimiter": "/", "prefix": prefix}
    xml = httpx.get(f"{OSN}/{PIPELINE}", params=params, timeout=30).text
    return set(re.findall(r"<Prefix>([^<]*)</Prefix>", xml)) - {prefix}


def osn_format(prefix: str) -> str | None:
    """'icechunk' | 'zarr' | None for a pipeline prefix like 'GPCP-daily/'."""
    children = list_prefixes(prefix)
    if f"{prefix}snapshots/" in children:
        return "icechunk"
    for name in ("zarr.json", ".zmetadata", ".zgroup"):
        if httpx.head(f"{OSN}/{PIPELINE}/{prefix}{name}", timeout=30).status_code == 200:
            return "zarr"
    return None


def resolve(url: str, pipeline_top: set[str]) -> tuple[str, str, bool]:
    """Return (href, format, todo_copy)."""
    url = url.rstrip("/")
    fmt = "netcdf" if url.endswith(".nc") else "csv" if url.endswith(".csv") else "zarr"
    if url.startswith(OSN):
        return "s3://" + url.removeprefix(OSN + "/"), fmt, False
    if url.startswith("gs://leap-persistent"):
        stem = Path(urlparse(url).path).name.removesuffix(".zarr")
        prefix = f"{stem}/"
        if prefix in pipeline_top and (osn_fmt := osn_format(prefix)):
            return f"s3://{PIPELINE}/{stem}", osn_fmt, False
        return url, fmt, True
    return url, fmt, False  # external: keep as-is


def main() -> None:
    feedstocks = httpx.get(SOURCE, timeout=60).raise_for_status().json()
    pipeline_top = list_prefixes()
    entries: list[dict] = []
    corrdiff_done = False

    for fs in feedstocks:
        stores = [s for s in fs.get("stores") or [] if "ncsa.osn.xsede.org" not in s.get("url", "")]
        for store in stores:
            url = store["url"]
            # CorrDiff ships 42 .nc files; collapse to one entry pointing at the folder.
            if "/hackathon-2026/corrdiff/" in url:
                if corrdiff_done:
                    continue
                corrdiff_done = True
                url = url.rsplit("/", 1)[0]
                store = {"id": "corrdiff-nyc"}
            href, fmt, todo = resolve(url, pipeline_top)
            if "corrdiff" in href:
                fmt = "netcdf"

            title = fs["title"]
            if len(stores) > 1 and store.get("id") != "corrdiff-nyc":
                title = f"{title} ({store.get('name') or store.get('id')})"
            prov = fs.get("provenance") or {}
            entry = {
                "id": slugify(title),
                "title": title,
                "description": (fs.get("description") or "").strip(),
                "license": prov.get("license"),
                "providers": [p["name"] for p in prov.get("providers") or [] if p.get("name")],
                "tags": fs.get("tags") or [],
                "href": href,
                "format": fmt,
            }
            if store.get("public") is False and not href.startswith("s3://leap-pangeo-"):
                entry["public"] = False
            if todo:
                entry["todo"] = "copy"
            entries.append({k: v for k, v in entry.items() if v not in (None, "", [])})

    ids = [e["id"] for e in entries]
    assert len(ids) == len(set(ids)), "duplicate ids"
    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(yaml.safe_dump(entries, sort_keys=False, allow_unicode=True, width=100))
    todo = sum("todo" in e for e in entries)
    print(f"wrote {len(entries)} entries ({todo} need copy) -> {OUT}")


if __name__ == "__main__":
    main()
