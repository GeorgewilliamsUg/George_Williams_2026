<#
.SYNOPSIS
    Convenience workflow script to commit, push to GitHub, and deploy to Namecheap SFTP.
.PARAMETER Message
    Commit message. If omitted, you will be prompted interactively.
.PARAMETER All
    Forces full re-upload of all files.
.PARAMETER Delete
    Deletes remote files that were removed locally.
.PARAMETER DryRun
    Simulates Git and SFTP sync without modifying anything.
#>
[CmdletBinding()]
param (
    [Alias("m")]
    [string]$Message,
    [switch]$All,
    [switch]$Delete,
    [Alias("WhatIf")]
    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-PublishStep { param([string]$Msg) Write-Host "[*] $Msg" -ForegroundColor Cyan }
function Write-PublishSuccess { param([string]$Msg) Write-Host "[+] $Msg" -ForegroundColor Green }
function Write-PublishWarning { param([string]$Msg) Write-Host "[!] $Msg" -ForegroundColor Yellow }
function Write-PublishError { param([string]$Msg) Write-Host "[-] $Msg" -ForegroundColor Red }

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if ([string]::IsNullOrWhiteSpace($ScriptDir)) { $ScriptDir = (Get-Location).Path }

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " Namecheap All-in-One Publish Workflow" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check git status
Write-PublishStep "Checking git repository status..."
$GitInstalled = Get-Command git.exe -ErrorAction SilentlyContinue
$IsGitRepo = Test-Path -LiteralPath (Join-Path $ScriptDir ".git")

if ($GitInstalled -and $IsGitRepo) {
    $GitStatus = @(git status --porcelain)
    if ($GitStatus.Count -gt 0) {
        Write-Host "Pending changes:" -ForegroundColor Yellow
        git status -s
        Write-Host ""
        if ([string]::IsNullOrWhiteSpace($Message)) {
            $Message = Read-Host "Enter commit message (or press Enter to cancel)"
            if ([string]::IsNullOrWhiteSpace($Message)) {
                Write-PublishWarning "Publish cancelled by user."
                exit 0
            }
        }
        if (-not $DryRun) {
            Write-PublishStep "Staging and committing changes..."
            git add .
            git commit -m "$Message"
            
            Write-PublishStep "Pushing to GitHub..."
            git push origin main
            Write-PublishSuccess "Pushed to GitHub main successfully."
        }
        else {
            Write-PublishWarning "[DRY RUN] Would commit: '$Message' and push to main."
        }
    }
    else {
        Write-PublishSuccess "Git working directory is clean. No new commits needed."
    }
}
else {
    Write-PublishWarning "Git repository (.git) not detected or git not in PATH. Skipping git commit & push."
}

# Invoke deploy.ps1
Write-PublishStep "Invoking SFTP Deployment..."
$DeployParams = @{}
if ($All) { $DeployParams["All"] = $true }
if ($Delete) { $DeployParams["Delete"] = $true }
if ($DryRun) { $DeployParams["DryRun"] = $true }

& "$ScriptDir\deploy.ps1" @DeployParams
