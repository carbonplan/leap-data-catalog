"""Run a command with OSN keys from an rclone remote exported as AWS_* env vars (never printed).

Usage: python scripts/with_osn.py [--remote leappipeline] uv run scripts/build_pyramids.py ...
"""

import configparser
import os
import sys
from pathlib import Path

args = sys.argv[1:]
remote = "leappipeline"
if args[:1] == ["--remote"]:
    remote, args = args[1], args[2:]
conf = configparser.ConfigParser()
conf.read(Path(os.environ.get("RCLONE_CONFIG", Path.home() / ".config/rclone/rclone.conf")))
if remote not in conf:
    sys.exit(f"no [{remote}] in rclone config; remotes: {conf.sections()}")
r = conf[remote]
os.environ |= {"AWS_ACCESS_KEY_ID": r["access_key_id"], "AWS_SECRET_ACCESS_KEY": r["secret_access_key"]}
os.execvp(args[0], args)
