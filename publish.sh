#!/usr/bin/env bash
# Namecheap All-in-One Publish Workflow (Linux & macOS)
# Staging -> Git Commit -> GitHub Push -> SFTP Smart Deployment
set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Terminal styling
CYAN='\033[96m'
GREEN='\033[92m'
YELLOW='\033[93m'
RED='\033[91m'
BOLD='\033[1m'
RESET='\033[0m'

write_step() { echo -e "${CYAN}[*] $1${RESET}"; }
write_success() { echo -e "${GREEN}[+] $1${RESET}"; }
write_warning() { echo -e "${YELLOW}[!] $1${RESET}"; }
write_error() { echo -e "${RED}[-] $1${RESET}"; }

MESSAGE=""
ALL_FLAG=""
DELETE_FLAG=""
DRY_RUN_FLAG=""
EXTRA_ARGS=()

while [[ $# -gt 0 ]]; do
    case "$1" in
        -m|--message|-Message)
            MESSAGE="$2"
            shift 2
            ;;
        -a|--all|-All|-f|--force|-Force)
            ALL_FLAG="--all"
            shift
            ;;
        -d|--delete|-Delete)
            DELETE_FLAG="--delete"
            shift
            ;;
        -n|--dry-run|--what-if|-DryRun|-WhatIf)
            DRY_RUN_FLAG="--dry-run"
            shift
            ;;
        *)
            EXTRA_ARGS+=("$1")
            shift
            ;;
    esac
done

echo ""
echo -e "${CYAN}============================================================${RESET}"
echo -e "${BOLD} Namecheap All-in-One Publish Workflow (Linux/macOS)${RESET}"
echo -e "${CYAN}============================================================${RESET}"
echo ""

write_step "Checking git repository status..."
if [ -d "$SCRIPT_DIR/.git" ] && command -v git >/dev/null 2>&1; then
    GIT_STATUS=$(git status --porcelain)
    if [ -n "$GIT_STATUS" ]; then
        echo -e "${YELLOW}Pending changes:${RESET}"
        git status -s
        echo ""

        if [ -z "$MESSAGE" ]; then
            read -r -p "Enter commit message (or press Enter to cancel): " MESSAGE
            if [ -z "$MESSAGE" ]; then
                write_warning "Publish cancelled by user."
                exit 0
            fi
        fi

        if [ -z "$DRY_RUN_FLAG" ]; then
            write_step "Staging and committing changes..."
            git add .
            git commit -m "$MESSAGE"

            write_step "Pushing to GitHub..."
            git push origin main
            write_success "Pushed to GitHub main successfully."
        else
            write_warning "[DRY RUN] Would commit: '$MESSAGE' and push to main."
        fi
    else
        write_success "Git working directory is clean. No new commits needed."
    fi
else
    write_warning "Git repository (.git) not detected or git not in PATH. Skipping git commit & push."
fi

write_step "Invoking SFTP Deployment..."
DEPLOY_ARGS=()
[ -n "$ALL_FLAG" ] && DEPLOY_ARGS+=("$ALL_FLAG")
[ -n "$DELETE_FLAG" ] && DEPLOY_ARGS+=("$DELETE_FLAG")
[ -n "$DRY_RUN_FLAG" ] && DEPLOY_ARGS+=("$DRY_RUN_FLAG")
if [ ${#EXTRA_ARGS[@]} -gt 0 ]; then
    DEPLOY_ARGS+=("${EXTRA_ARGS[@]}")
fi

exec "$SCRIPT_DIR/deploy.sh" "${DEPLOY_ARGS[@]}"
