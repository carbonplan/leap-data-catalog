# /// script
# requires-python = ">=3.11"
# dependencies = ["obstore"]
# ///
"""Upload a built catalog.parquet to OSN.

Needs OSN write keys in AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY: GitHub environment secrets in CI, or
scripts/with_osn.py locally. Kept separate from build_catalog.py so the step holding the keys runs only this
script and its one locked dependency.

Usage:
    uv run python scripts/with_osn.py uv run --locked scripts/upload_catalog.py catalog.parquet
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

from obstore.store import S3Store

OSN = 'https://nyu1.osn.mghpcc.org'
BUCKET, KEY = 'leap-pangeo-pipeline', 'catalog/catalog.parquet'
SECRET_ENV = ('AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY')


def scrub(text: str) -> str:
    """Replace any key value in `text`; a backstop to GitHub's log masking (S3 errors can echo the key id)."""
    for name in SECRET_ENV:
        if value := os.environ.get(name):
            text = text.replace(value, '***')
    return text


def is_parquet(data: bytes) -> bool:
    return len(data) > 8 and data[:4] == data[-4:] == b'PAR1'


def main(path: Path) -> None:
    data = path.read_bytes()
    if not is_parquet(data):
        sys.exit(f"refusing to upload {path}: not a parquet file")
    try:
        store = S3Store(BUCKET, endpoint=OSN, region='us-east-1', virtual_hosted_style_request=False)
        store.put(KEY, data)
    except Exception as e:  # print a scrubbed message only, never the traceback
        sys.exit(scrub(f"upload failed: {type(e).__name__}: {e}"))
    print(f"uploaded {len(data)} bytes -> {OSN}/{BUCKET}/{KEY}")


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(Path(sys.argv[1]))
