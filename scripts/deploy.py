#!/usr/bin/env python3
"""
Cross-platform deployment engine for Namecheap SFTP hosting.
Synchronizes local static website files using SHA-256 delta detection.
Works identically to deploy.ps1 on Linux, macOS, and Windows.
"""

import os
import sys
import json
import hashlib
import re
import tempfile
import subprocess
import argparse
from pathlib import Path

DEFAULT_EXCLUDES = [
    r"^\.git($|/|\\)",
    r"^\.github($|/|\\)",
    r"^\.agents($|/|\\)",
    r"^\.vscode($|/|\\)",
    r"^\.skills\.json$",
    r"^\.gitignore$",
    r"^deploy\.ps1$",
    r"^publish\.ps1$",
    r"^deploy\.sh$",
    r"^publish\.sh$",
    r"^article\.html$",
    r"^deploy-config.*\.json$",
    r"^\.deploy-manifest\.json$",
    r"^\.deploy-state\.json$",
    r"^DEPLOYMENT\.md$",
    r"^src($|/|\\)",
    r"^scripts($|/|\\)",
    r"\.docx$",
    r"\.md$",
    r"\.eps$",
    r"^\.env.*$",
    r"^\.venv($|/|\\)",
    r"^venv($|/|\\)",
    r"^node_modules($|/|\\)",
    r"Thumbs\.db$",
    r"\.DS_Store$",
    r"\.tmp$",
    r"\.bak$",
    r"\.log$",
    r"__pycache__",
]

# ANSI color codes
CYAN = "\033[96m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
GRAY = "\033[90m"
BOLD = "\033[1m"
RESET = "\033[0m"

def log_step(msg): print(f"{CYAN}[*] {msg}{RESET}")
def log_success(msg): print(f"{GREEN}[+] {msg}{RESET}")
def log_warning(msg): print(f"{YELLOW}[!] {msg}{RESET}")
def log_error(msg): print(f"{RED}[-] {msg}{RESET}")
def log_info(msg): print(f"{GRAY}    {msg}{RESET}")

def compute_sha256(filepath):
    hasher = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()

def main():
    parser = argparse.ArgumentParser(description="Smart Namecheap SFTP Deployment")
    parser.add_argument("--all", "-a", "--force", "-f", action="store_true", help="Force upload all files, ignoring manifest")
    parser.add_argument("--dry-run", "-n", "--what-if", action="store_true", help="Simulate without uploading")
    parser.add_argument("--delete", "-d", action="store_true", help="Delete remote files removed locally")
    parser.add_argument("--config", "-c", default="deploy-config.json", help="Path to config JSON (default: deploy-config.json)")
    parser.add_argument("--skip-connectivity-check", action="store_true", help="Skip remote host connectivity check")

    args = parser.parse_args()

    project_root = Path(__file__).resolve().parent.parent

    print()
    print(f"{CYAN}{'='*60}{RESET}")
    print(f"{BOLD} Namecheap SFTP Smart Deployment System (Linux/macOS/Windows){RESET}")
    print(f"{CYAN}{'='*60}{RESET}\n")

    log_step("Checking deployment configuration...")

    config_path = project_root / args.config
    if not config_path.is_file():
        log_error(f"Configuration file '{args.config}' not found.")
        print(f"{YELLOW}1. Copy 'deploy-config.example.json' to 'deploy-config.json'{RESET}")
        print(f"{YELLOW}2. Fill in your Namecheap SFTP credentials.{RESET}")
        sys.exit(1)

    try:
        with open(config_path, "r", encoding="utf-8-sig") as f:
            config = json.load(f)
        log_info(f"Loaded configuration from '{args.config}'.")
    except Exception as e:
        log_error(f"Failed to parse '{args.config}': {e}")
        sys.exit(1)

    host = config.get("host", "").strip()
    port = int(config.get("port", 21098))
    username = config.get("username", "").strip()
    auth_method = config.get("authMethod", "password").strip().lower()
    private_key_path = config.get("privateKeyPath", "").strip()
    remote_dir = config.get("remoteDirectory", "public_html").strip("/\\").replace("\\", "/")
    if not remote_dir:
        remote_dir = "public_html"
    local_dir_rel = config.get("localDirectory", ".")

    if not host or "XXX" in host:
        log_error(f"Invalid or placeholder 'host' configured ({host}).")
        sys.exit(1)

    if not username or username == "your_cpanel_username":
        log_error("Invalid or placeholder 'username' configured.")
        sys.exit(1)

    local_dir = (project_root / local_dir_rel).resolve()
    if not local_dir.is_dir():
        log_error(f"Local project directory does not exist: {local_dir}")
        sys.exit(1)

    resolved_key_path = None
    if auth_method == "key" and private_key_path:
        expanded_key = os.path.expanduser(private_key_path)
        k_path = Path(expanded_key)
        if not k_path.is_absolute():
            k_path = project_root / k_path
        if k_path.is_file():
            resolved_key_path = str(k_path.resolve())
            log_info(f"SSH Private Key: {resolved_key_path}")

    log_success("Configuration validated.")
    log_info(f"Target Server: {username}@{host}:{port}")
    log_info(f"Remote Target: {remote_dir}/")
    log_info(f"Local Source:  {local_dir}")

    # Build excludes regex list
    exclude_patterns = list(DEFAULT_EXCLUDES)
    custom_excludes = config.get("excludePatterns", [])
    if custom_excludes and isinstance(custom_excludes, list):
        for pat in custom_excludes:
            if pat and isinstance(pat, str):
                escaped = "^" + re.escape(pat).replace(r"\*", ".*").replace(r"\?", ".")
                exclude_patterns.append(escaped)

    compiled_excludes = [re.compile(p, re.IGNORECASE) for p in exclude_patterns]

    log_step("Scanning local project files...")
    eligible_files = []

    for root, dirs, files in os.walk(local_dir):
        # Determine relative path from local_dir
        rel_root = os.path.relpath(root, local_dir)
        if rel_root == ".":
            rel_root = ""

        # Filter dirs in-place to avoid unnecessary traversal
        filtered_dirs = []
        for d in dirs:
            dir_rel = f"{rel_root}/{d}".strip("/") if rel_root else d
            dir_rel_normalized = dir_rel.replace("\\", "/") + "/"
            if not any(pattern.search(dir_rel_normalized) or pattern.search(dir_rel) for pattern in compiled_excludes):
                filtered_dirs.append(d)
        dirs[:] = filtered_dirs

        for f in files:
            file_rel = f"{rel_root}/{f}".strip("/") if rel_root else f
            file_rel_norm = file_rel.replace("\\", "/")
            if any(pattern.search(file_rel_norm) for pattern in compiled_excludes):
                continue

            full_path = Path(root) / f
            eligible_files.append({
                "rel": file_rel_norm,
                "full": full_path,
                "size": full_path.stat().st_size
            })

    log_info(f"Discovered {len(eligible_files)} total deployable local files.")

    # Load existing manifest
    manifest_path = project_root / ".deploy-manifest.json"
    previous_manifest = {}
    if not args.all and manifest_path.is_file():
        try:
            with open(manifest_path, "r", encoding="utf-8-sig") as f:
                previous_manifest = json.load(f)
        except Exception:
            previous_manifest = {}

    log_step("Computing SHA256 checksums...")
    files_to_upload = []
    new_manifest = {}

    for item in eligible_files:
        rel = item["rel"]
        h = compute_sha256(item["full"])
        new_manifest[rel] = h
        if args.all or rel not in previous_manifest or previous_manifest.get(rel) != h:
            files_to_upload.append(item)

    files_to_delete = []
    if args.delete and previous_manifest:
        for prev_rel in previous_manifest:
            if prev_rel not in new_manifest:
                files_to_delete.append(prev_rel)

    log_info(f"Files to upload: {len(files_to_upload)}")
    if args.delete:
        log_info(f"Remote files to delete: {len(files_to_delete)}")

    if not files_to_upload and not files_to_delete:
        log_success("Website is completely up to date! Nothing to deploy.")
        sys.exit(0)

    if args.dry_run:
        print()
        log_warning("[DRY RUN] Simulating deployment plan:")
        for f in files_to_upload:
            print(f"  {GREEN}[+] Upload: {f['rel']}{RESET}")
        for d in files_to_delete:
            print(f"  {RED}[-] Delete: {d}{RESET}")
        sys.exit(0)

    # Build SFTP Batch Command File
    dirs_needed = set()
    for f in files_to_upload:
        parent = os.path.dirname(f["rel"])
        if parent:
            parts = parent.split("/")
            accum = ""
            for p in parts:
                accum = f"{accum}/{p}" if accum else p
                dirs_needed.add(accum)

    batch_lines = [
        f"-mkdir \"{remote_dir}\"",
        f"cd \"{remote_dir}\""
    ]

    # Sort directories by path depth / length so parent is created before child
    for d in sorted(dirs_needed, key=lambda x: (len(x.split("/")), len(x))):
        batch_lines.append(f"-mkdir \"{d}\"")

    for f in files_to_upload:
        batch_lines.append(f"put \"{f['full']}\" \"{f['rel']}\"")

    if args.delete:
        for d in files_to_delete:
            batch_lines.append(f"-rm \"{d}\"")

    batch_lines.append("bye\n")

    with tempfile.NamedTemporaryFile("w", delete=False, encoding="utf-8") as temp_file:
        temp_batch_path = temp_file.name
        temp_file.write("\n".join(batch_lines))

    sftp_cmd = [
        "sftp",
        "-P", str(port),
        "-o", "StrictHostKeyChecking=accept-new",
        "-o", "ServerAliveInterval=30"
    ]

    password = config.get("password") or os.environ.get("NAMECHEAP_SFTP_PASSWORD", "")
    import shutil
    use_sshpass = bool(auth_method == "password" and password and shutil.which("sshpass"))

    if auth_method == "key":
        if resolved_key_path:
            sftp_cmd.extend(["-i", resolved_key_path])
        else:
            log_warning("No explicit privateKeyPath resolved. Falling back to default SSH identities.")
    elif auth_method == "password":
        if use_sshpass:
            sftp_cmd = ["sshpass", "-p", password] + sftp_cmd
        else:
            # Batch mode (-b) in OpenSSH sftp internally defaults to BatchMode=yes,
            # which suppresses interactive password prompts and causes "Permission denied".
            # Supplying "-o BatchMode=no" explicitly ensures OpenSSH prompts the user in the terminal.
            sftp_cmd.extend(["-o", "BatchMode=no"])

    sftp_cmd.extend([
        "-b", temp_batch_path,
        f"{username}@{host}"
    ])

    log_step(f"Connecting to Namecheap SFTP ({host}:{port}) and syncing...")
    try:
        # Run interactively so password or SSH key prompt displays on terminal
        res = subprocess.run(sftp_cmd)
        exit_code = res.returncode
    finally:
        try:
            os.remove(temp_batch_path)
        except OSError:
            pass

    if exit_code == 0:
        # Save updated manifest
        try:
            with open(manifest_path, "w", encoding="utf-8") as f:
                json.dump(new_manifest, f, indent=4)
        except Exception as e:
            log_warning(f"Failed to update '{manifest_path.name}': {e}")
        log_success("Deployment completed successfully!")
    else:
        log_error(f"SFTP upload failed with exit code {exit_code}.")
        sys.exit(exit_code)

if __name__ == "__main__":
    main()
