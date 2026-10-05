# /// script
# requires-python = ">=3.11"
# dependencies = ["basal @ git+https://github.com/norlandrhagen/basal", "icechunk", "httpx"]
# ///
"""One-off migration: leap-stc/data-management consolidated-web-catalog.json -> basal catalog.

Each (feedstock, store) pair in the old pangeo-forge catalog becomes a basal entry
(an icechunk branch). Old stores are plain Zarr on S3-compatible endpoints, so we
register them with `register_zarr`, converting https endpoint URLs to s3:// + an
obstore store_config. CSV-only stores are skipped (link out from the web app).

Usage:
    # write to a local catalog for testing
    uv run scripts/migrate_to_basal.py --local ./public_icechunk_catalog --dry-run
    uv run scripts/migrate_to_basal.py --local ./public_icechunk_catalog

    # write to S3 (writer needs credentials via env)
    uv run scripts/migrate_to_basal.py \
        --bucket carbonplan-share --prefix basal/leap_catalog --region us-west-2

This script is intended to live in basal/ or leap-stc/data-management; it depends on
basal + icechunk, not on the web app.
"""

from __future__ import annotations

import argparse
import re
from typing import Any
from urllib.parse import urlparse

import httpx
import icechunk
from basal import Catalog

DEFAULT_SOURCE = (
    "https://raw.githubusercontent.com/leap-stc/data-management/main/"
    "catalog/output/consolidated-web-catalog.json"
)


def slugify(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s or "dataset"


def sanitize_name(name: str) -> str:
    """basal forbids '__' and reserves 'main'."""
    s = slugify(name).replace("__", "-")
    return f"ds-{s}" if s == "main" else s


def repo_url_from_meta_yaml(meta_yaml_url: str | None) -> str | None:
    """https://github.com/org/repo/blob/.../meta.yaml -> https://github.com/org/repo"""
    if not meta_yaml_url:
        return None
    parts = urlparse(meta_yaml_url).path.strip("/").split("/")
    if len(parts) >= 2:
        return f"https://github.com/{parts[0]}/{parts[1]}"
    return None


def to_location(url: str) -> tuple[str | None, dict | None]:
    """Map an old store URL to a basal (location, store_config).

    Returns (None, None) for things we can't register as zarr (e.g. csv).
    """
    if url.endswith(".csv"):
        return None, None
    if url.startswith(("s3://", "gs://", "gcs://", "az://", "abfs://")):
        return url, None

    p = urlparse(url)
    host, path = p.netloc, p.path.lstrip("/")

    # Google Cloud Storage
    if host == "storage.googleapis.com":
        return f"gs://{path}", {"skip_signature": True}

    # AWS S3 virtual-hosted or path style
    if host.endswith(".amazonaws.com"):
        if host.startswith("s3.") or host.startswith("s3-"):
            bucket, _, key = path.partition("/")
        else:  # <bucket>.s3[.region].amazonaws.com
            bucket = host.split(".s3")[0]
            key = path
        return f"s3://{bucket}/{key}", {"skip_signature": True}

    # S3-compatible endpoint (e.g. OSN nyu1.osn.mghpcc.org): bucket is first path seg.
    bucket, _, key = path.partition("/")
    if not bucket:
        return None, None
    return (
        f"s3://{bucket}/{key}",
        {
            "endpoint": f"{p.scheme}://{host}",
            "skip_signature": True,
            "virtual_hosted_style_request": False,
            "region": "us-east-1",
        },
    )


def entry_metadata(feedstock: dict, store: dict) -> dict[str, Any]:
    prov = feedstock.get("provenance") or {}
    providers = prov.get("providers") or []
    maintainers = feedstock.get("maintainers") or []
    owner = (
        (providers[0].get("name") if providers else None)
        or (maintainers[0].get("name") if maintainers else None)
        or "LEAP"
    )
    meta: dict[str, Any] = {
        "title": feedstock.get("title") or store.get("name") or store.get("id"),
        "owner": owner,
    }
    if feedstock.get("description"):
        meta["description"] = feedstock["description"]
    if prov.get("license"):
        meta["license"] = prov["license"]
    if feedstock.get("tags"):
        meta["tags"] = feedstock["tags"]
    repo = repo_url_from_meta_yaml(feedstock.get("ncviewjs:meta_yaml_url"))
    if repo:
        meta["feedstock"] = repo
    if store.get("public") is not None:
        meta["public"] = bool(store["public"])
    return meta


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--source", default=DEFAULT_SOURCE, help="old catalog JSON URL")
    ap.add_argument("--local", help="write to a local icechunk catalog at this path")
    ap.add_argument("--bucket")
    ap.add_argument("--prefix")
    ap.add_argument("--region", default="us-west-2")
    ap.add_argument(
        "--no-inspect",
        action="store_true",
        help="skip opening stores to derive bbox/variables (faster, offline)",
    )
    ap.add_argument("--dry-run", action="store_true", help="print, don't write")
    args = ap.parse_args()

    feedstocks = httpx.get(args.source, timeout=60).raise_for_status().json()
    print(f"loaded {len(feedstocks)} feedstocks from {args.source}")

    catalog = None
    if not args.dry_run:
        if args.local:
            storage = icechunk.local_filesystem_storage(args.local)
        elif args.bucket and args.prefix:
            storage = icechunk.s3_storage(
                bucket=args.bucket,
                prefix=args.prefix,
                region=args.region,
                from_env=True,
            )
        else:
            ap.error("provide --local PATH or --bucket and --prefix (or use --dry-run)")
        catalog = Catalog.open_or_create(storage)

    used: set[str] = set()
    registered = skipped = 0

    for fs in feedstocks:
        stores = fs.get("stores") or []
        multi = len(stores) > 1
        for store in stores:
            url = store.get("url") or ""
            location, store_config = to_location(url)
            if not location:
                print(f"  skip (unregisterable): {store.get('id')} <- {url}")
                skipped += 1
                continue

            base = store.get("id") or slugify(fs.get("title", ""))
            name = sanitize_name(f"{slugify(fs.get('title',''))}-{base}" if multi else base)
            while name in used:
                name = f"{name}-x"
            used.add(name)

            meta = entry_metadata(fs, store)
            # Can't open private stores to derive schema; register metadata only.
            do_inspect = (not args.no_inspect) and store.get("public") is not False
            print(f"  register {name}: {location}{'' if do_inspect else ' (no inspect)'}")
            registered += 1
            if args.dry_run or catalog is None:
                continue
            try:
                catalog.register_zarr(
                    name,
                    location,
                    store_config=store_config,
                    inspect=do_inspect,
                    derive_extent=do_inspect,
                    **meta,
                )
            except Exception as err:  # keep going; report at end
                print(f"    FAILED {name}: {err}")
                registered -= 1
                skipped += 1

    print(f"\ndone: {registered} registered, {skipped} skipped")


if __name__ == "__main__":
    main()
