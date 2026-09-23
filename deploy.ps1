<#
.SYNOPSIS
    Deploy website to Namecheap hosting via SFTP over SSH.
.DESCRIPTION
    Synchronizes local website files to Namecheap's public_html/ (or configured directory)
    using secure OpenSSH SFTP. Tracks file hashes in .deploy-manifest.json so only
    new or modified files are uploaded on subsequent runs.
.PARAMETER All
    Upload all website files, ignoring the cached deployment manifest.
.PARAMETER DryRun
    Simulates the deployment without uploading or modifying remote files.
.PARAMETER Delete
    Removes remote files that have been deleted locally.
.PARAMETER ConfigFile
    Path to configuration JSON file (Default: deploy-config.json).
.PARAMETER SkipConnectivityCheck
    Skips the initial remote connection test.
#>
[CmdletBinding()]
param (
    [Alias("Force")]
    [switch]$All,
    [Alias("WhatIf")]
    [switch]$DryRun,
    [switch]$Delete,
    [string]$ConfigFile = "deploy-config.json",
    [switch]$SkipConnectivityCheck
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-DeployStep { param([string]$Message) Write-Host "[*] $Message" -ForegroundColor Cyan }
function Write-DeploySuccess { param([string]$Message) Write-Host "[+] $Message" -ForegroundColor Green }
function Write-DeployWarning { param([string]$Message) Write-Host "[!] $Message" -ForegroundColor Yellow }
function Write-DeployError { param([string]$Message) Write-Host "[-] $Message" -ForegroundColor Red }
function Write-DeployInfo { param([string]$Message) Write-Host "    $Message" -ForegroundColor Gray }

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if ([string]::IsNullOrWhiteSpace($ScriptDir)) { $ScriptDir = (Get-Location).Path }

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " Namecheap SFTP Smart Deployment System" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-DeployStep "Checking deployment configuration..."

$Config = $null
$ConfigFilePath = Join-Path $ScriptDir $ConfigFile

if (Test-Path -LiteralPath $ConfigFilePath) {
    try {
        $ConfigRaw = Get-Content -LiteralPath $ConfigFilePath -Raw -Encoding UTF8
        $Config = $ConfigRaw | ConvertFrom-Json
        Write-DeployInfo "Loaded configuration from '$ConfigFile'."
    }
    catch {
        Write-DeployError "Failed to parse '$ConfigFile': $_"
        exit 1
    }
}
else {
    Write-DeployError "Configuration file '$ConfigFile' not found."
    Write-Host "1. Copy 'deploy-config.example.json' to 'deploy-config.json'" -ForegroundColor Yellow
    Write-Host "2. Fill in your Namecheap SFTP hostname, username, and authentication details." -ForegroundColor Yellow
    exit 1
}

function Get-ConfigProperty {
    param($Obj, [string]$PropName, $Default = $null)
    if ($null -ne $Obj -and $Obj.PSObject.Properties.Match($PropName).Count -gt 0) {
        $val = $Obj.$PropName
        if ($null -ne $val) { return $val }
    }
    return $Default
}

$HostName = [string](Get-ConfigProperty $Config "host" "")
$Port = [int](Get-ConfigProperty $Config "port" 21098)
$Username = [string](Get-ConfigProperty $Config "username" "")
$AuthMethod = [string](Get-ConfigProperty $Config "authMethod" "password")
$PrivateKeyPath = [string](Get-ConfigProperty $Config "privateKeyPath" "")
$RemoteDir = [string](Get-ConfigProperty $Config "remoteDirectory" "public_html")
$LocalDirRelative = [string](Get-ConfigProperty $Config "localDirectory" ".")

$RemoteDir = $RemoteDir.Trim("/\").Replace("\", "/")
if ([string]::IsNullOrWhiteSpace($RemoteDir)) { $RemoteDir = "public_html" }

if ([string]::IsNullOrWhiteSpace($HostName) -or $HostName -like "*XXX*") {
    Write-DeployError "Invalid or placeholder 'host' configured ($HostName)."
    exit 1
}

if ([string]::IsNullOrWhiteSpace($Username) -or $Username -eq "your_cpanel_username") {
    Write-DeployError "Invalid or placeholder 'username' configured."
    exit 1
}

$ResolvedLocalDir = if ([System.IO.Path]::IsPathRooted($LocalDirRelative)) { $LocalDirRelative } else { Join-Path $ScriptDir $LocalDirRelative }
if (-not (Test-Path -LiteralPath $ResolvedLocalDir)) {
    Write-DeployError "Local project directory does not exist: $ResolvedLocalDir"
    exit 1
}
$LocalDir = (Resolve-Path -LiteralPath $ResolvedLocalDir).Path

$ResolvedKeyPath = $null
if ($AuthMethod -eq "key" -and -not [string]::IsNullOrWhiteSpace($PrivateKeyPath)) {
    $ExpandedKeyPath = $PrivateKeyPath.Replace("~", $env:USERPROFILE).Replace("%USERPROFILE%", $env:USERPROFILE)
    if (-not [System.IO.Path]::IsPathRooted($ExpandedKeyPath)) { $ExpandedKeyPath = Join-Path $ScriptDir $ExpandedKeyPath }
    if (Test-Path -LiteralPath $ExpandedKeyPath) {
        $ResolvedKeyPath = (Resolve-Path -LiteralPath $ExpandedKeyPath).Path
        Write-DeployInfo "SSH Private Key: $ResolvedKeyPath"
    }
}

$SftpExe = Get-Command sftp.exe -ErrorAction SilentlyContinue
if (-not $SftpExe) {
    Write-DeployError "OpenSSH 'sftp.exe' was not found in PATH. Please enable OpenSSH Client in Windows."
    exit 1
}

Write-DeploySuccess "Configuration validated."
Write-DeployInfo "Target Server: $Username@$($HostName):$Port"
Write-DeployInfo "Remote Target: $RemoteDir/"
Write-DeployInfo "Local Source:  $LocalDir"

# Exclusions
$DefaultExcludes = @(
    "^\.git($|/|\\)", "^\.github($|/|\\)", "^\.agents($|/|\\)", "^\.vscode($|/|\\)",
    "^\.skills\.json$", "^\.gitignore$", "^deploy\.ps1$", "^publish\.ps1$",
    "^article\.html$", "^deploy-config.*\.json$", "^\.deploy-manifest\.json$", "^\.deploy-state\.json$",
    "^DEPLOYMENT\.md$", "^src($|/|\\)", "^scripts($|/|\\)",
    "\.docx$", "\.md$", "\.eps$",
    "^\.env.*$", "^\.venv($|/|\\)", "^venv($|/|\\)", "^node_modules($|/|\\)",
    "Thumbs\.db$", "\.DS_Store$", "\.tmp$", "\.bak$", "\.log$"
)
$Excludes = [System.Collections.Generic.List[string]]::new()
foreach ($item in $DefaultExcludes) { $Excludes.Add($item) }

$ConfigExcludes = Get-ConfigProperty $Config "excludePatterns" $null
if ($null -ne $ConfigExcludes) {
    foreach ($pat in $ConfigExcludes) {
        $cleanPat = [string]$pat
        if (-not [string]::IsNullOrWhiteSpace($cleanPat)) {
            $regex = "^" + [regex]::Escape($cleanPat).Replace("\*", ".*").Replace("\?", ".")
            $Excludes.Add($regex)
        }
    }
}

Write-DeployStep "Scanning local project files..."
$AllFiles = Get-ChildItem -LiteralPath $LocalDir -Recurse -File
$EligibleFiles = [System.Collections.Generic.List[PSCustomObject]]::new()

foreach ($file in $AllFiles) {
    $rel = $file.FullName.Substring($LocalDir.Length).TrimStart("\", "/").Replace("\", "/")
    $isExcluded = $false
    foreach ($pat in $Excludes) {
        if ($rel -match $pat) { $isExcluded = $true; break }
    }
    if (-not $isExcluded) {
        $EligibleFiles.Add([PSCustomObject]@{
            RelativePath = $rel
            FullPath = $file.FullName
            Size = $file.Length
            LastWriteTimeUtc = $file.LastWriteTimeUtc
        })
    }
}

Write-DeployInfo "Discovered $($EligibleFiles.Count) total deployable local files."

# Manifest Check
$ManifestPath = Join-Path $ScriptDir ".deploy-manifest.json"
$PreviousManifest = @{}
if ((-not $All) -and (Test-Path -LiteralPath $ManifestPath)) {
    try {
        $json = Get-Content -LiteralPath $ManifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
        foreach ($prop in $json.PSObject.Properties) {
            $PreviousManifest[$prop.Name] = [string]$prop.Value
        }
    } catch {}
}

Write-DeployStep "Computing SHA256 checksums..."
$FilesToUpload = [System.Collections.Generic.List[PSCustomObject]]::new()
$NewManifest = @{}
$Hasher = [System.Security.Cryptography.SHA256]::Create()

foreach ($item in $EligibleFiles) {
    $bytes = [System.IO.File]::ReadAllBytes($item.FullPath)
    $hash = -join ($Hasher.ComputeHash($bytes) | ForEach-Object { $_.ToString("x2") })
    $NewManifest[$item.RelativePath] = $hash
    if ($All -or (-not $PreviousManifest.ContainsKey($item.RelativePath)) -or ($PreviousManifest[$item.RelativePath] -ne $hash)) {
        $FilesToUpload.Add($item)
    }
}
$Hasher.Dispose()

$FilesToDelete = [System.Collections.Generic.List[string]]::new()
if ($Delete -and $PreviousManifest.Count -gt 0) {
    foreach ($prevRel in $PreviousManifest.Keys) {
        if (-not $NewManifest.ContainsKey($prevRel)) {
            $FilesToDelete.Add($prevRel)
        }
    }
}

Write-DeployInfo "Files to upload: $($FilesToUpload.Count)"
if ($Delete) { Write-DeployInfo "Remote files to delete: $($FilesToDelete.Count)" }

if ($FilesToUpload.Count -eq 0 -and $FilesToDelete.Count -eq 0) {
    Write-DeploySuccess "Website is completely up to date! Nothing to deploy."
    exit 0
}

if ($DryRun) {
    Write-Host ""
    Write-DeployWarning "[DRY RUN] Simulating deployment plan:"
    foreach ($f in $FilesToUpload) { Write-Host "  [+] Upload: $($f.RelativePath)" -ForegroundColor Green }
    foreach ($d in $FilesToDelete) { Write-Host "  [-] Delete: $d" -ForegroundColor Red }
    exit 0
}

# Build SFTP Batch Command File
$TempBatchFile = [System.IO.Path]::GetTempFileName()
$BatchLines = [System.Collections.Generic.List[string]]::new()
$BatchLines.Add("-mkdir `"$RemoteDir`"")
$BatchLines.Add("cd `"$RemoteDir`"")

# Collect directories to create
$DirsNeeded = [System.Collections.Generic.HashSet[string]]::new()
foreach ($f in $FilesToUpload) {
    $parent = [System.IO.Path]::GetDirectoryName($f.RelativePath).Replace("\", "/")
    if (-not [string]::IsNullOrWhiteSpace($parent)) {
        $parts = $parent.Split("/")
        $accum = ""
        foreach ($p in $parts) {
            $accum = if ($accum) { "$accum/$p" } else { $p }
            $null = $DirsNeeded.Add($accum)
        }
    }
}

foreach ($d in ($DirsNeeded | Sort-Object { $_.Length })) {
    $BatchLines.Add("-mkdir `"$d`"")
}

foreach ($f in $FilesToUpload) {
    $remoteFile = $f.RelativePath
    $localFileEscaped = $f.FullPath.Replace("\", "/")
    $BatchLines.Add("put `"$localFileEscaped`" `"$remoteFile`"")
}

if ($Delete) {
    foreach ($d in $FilesToDelete) {
        $BatchLines.Add("-rm `"$d`"")
    }
}

$BatchLines.Add("bye")
[System.IO.File]::WriteAllLines($TempBatchFile, $BatchLines, [System.Text.Encoding]::ASCII)

# Build SFTP invocation
$SftpArgs = [System.Collections.Generic.List[string]]::new()
$SftpArgs.Add("-P"); $SftpArgs.Add($Port.ToString())
$SftpArgs.Add("-o"); $SftpArgs.Add("StrictHostKeyChecking=accept-new")
$SftpArgs.Add("-o"); $SftpArgs.Add("ServerAliveInterval=30")
if ($AuthMethod -eq "key" -and $ResolvedKeyPath) {
    $SftpArgs.Add("-i"); $SftpArgs.Add($ResolvedKeyPath)
}
$SftpArgs.Add("-b"); $SftpArgs.Add($TempBatchFile)
$SftpArgs.Add("$Username@$HostName")

Write-DeployStep "Connecting to Namecheap SFTP ($($HostName):$Port) and syncing..."
$Process = Start-Process -FilePath "sftp.exe" -ArgumentList $SftpArgs -NoNewWindow -PassThru -Wait
Remove-Item -LiteralPath $TempBatchFile -Force -ErrorAction SilentlyContinue

if ($Process.ExitCode -eq 0) {
    # Save manifest
    $NewManifest | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $ManifestPath -Encoding UTF8
    Write-DeploySuccess "Deployment completed successfully!"
}
else {
    Write-DeployError "SFTP upload failed with exit code $($Process.ExitCode)."
    exit $Process.ExitCode
}
