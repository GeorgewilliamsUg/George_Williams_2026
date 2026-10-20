#!/usr/bin/env bash
# Namecheap SFTP Smart Deployment Script (Linux & macOS)
set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec python3 "$SCRIPT_DIR/scripts/deploy.py" "$@"
