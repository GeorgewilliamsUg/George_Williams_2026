# Production Deployment Guide — Namecheap SFTP

This project uses an optimized, zero-dependency deployment pipeline designed for Namecheap cPanel hosting over secure SFTP (SSH Port `21098`).

---

## 1. Architecture Overview

- **Native OpenSSH SFTP**: Relies entirely on Windows built-in `sftp.exe` — no third-party npm packages, Python runtimes, or external tools required.
- **Smart Delta Synchronization**: Calculates SHA256 checksums for local files and compares them against `.deploy-manifest.json`. Only new or modified files are uploaded, reducing deployment times from minutes to seconds.
- **Automated Remote Hierarchy**: Dynamically identifies nested directory structures and creates necessary remote directories via SFTP batch commands before transferring files.
- **Dual PowerShell Scripts**:
  - `deploy.ps1`: Core delta sync and SFTP transfer engine.
  - `publish.ps1`: Git staging, commit, GitHub push, and deployment coordinator.

---

## 2. Namecheap cPanel Requirements & Prerequisites

Before deploying, collect the following connection details from your Namecheap cPanel account:

| Requirement | Where to Find in cPanel | Expected Value / Format |
| :--- | :--- | :--- |
| **Server Hostname** | cPanel Home &rarr; Right Sidebar &rarr; *General Information* &rarr; *Server Name* or *Shared IP Address* | `premiumXXX.web-hosting.com` (recommended over domain name to avoid DNS propagation delays) |
| **cPanel Username** | cPanel Home &rarr; Right Sidebar &rarr; *Current User* | e.g. `your_cpanel_user` |
| **SFTP Port** | Namecheap custom SSH port | **`21098`** (Never use port 21 or 22) |
| **Remote Directory** | cPanel *File Manager* path | `public_html` (Primary domain)<br>`subdomain.domain.com` or `domain2.com` (Addon domain) |
| **SSH Access** | cPanel Home &rarr; *SSH Access* | Must be set to **Enabled** |
| **Windows OpenSSH** | Windows built-in feature | `sftp.exe` and `ssh.exe` available in PATH |

> [!IMPORTANT]
> Namecheap cPanel SSH runs exclusively on port **21098**. Standard port 22 is blocked.

---

## 3. Authentication Setup

You can authenticate using either **Password Auth** or **SSH Key Auth**:

### Option A: Password Authentication (Simplest)
- In `deploy-config.json`, keep `"authMethod": "password"`.
- When running `.\deploy.ps1`, OpenSSH will interactively prompt for your cPanel account password.
- No SSH key management required.

### Option B: SSH Key Authentication (Passwordless & Automated)
1. **Generate an Ed25519 SSH key pair** on Windows (PowerShell):
   ```powershell
   ssh-keygen -t ed25519 -C "george-deploy" -f "$env:USERPROFILE\.ssh\id_ed25519"
   ```
2. **Import Key in Namecheap cPanel**:
   - Log into Namecheap cPanel &rarr; **SSH Access** &rarr; **Manage SSH Keys**.
   - Click **Import Key**.
   - Set a name (e.g. `george-deploy`).
   - Open `$env:USERPROFILE\.ssh\id_ed25519.pub` in a text editor, copy the entire public key string, and paste it into the **Paste the public key into the following text box** area.
   - Leave private key and passphrase blank on cPanel. Click **Import**.
3. **Authorize Key in cPanel**:
   - Under **Public Keys**, find the imported key and click **Manage**.
   - Click **Authorize**.
4. **Configure `deploy-config.json`**:
   ```json
   "authMethod": "key",
   "privateKeyPath": "~/.ssh/id_ed25519"
   ```

---

## 4. Configuration Steps

1. Copy the example config file:
   ```powershell
   Copy-Item deploy-config.example.json deploy-config.json
   ```
2. Edit `deploy-config.json` with your credentials:
   ```json
   {
     "host": "premiumXXX.web-hosting.com",
     "port": 21098,
     "username": "your_cpanel_username",
     "authMethod": "password",
     "remoteDirectory": "public_html",
     "localDirectory": "."
   }
   ```
3. Verify that `deploy-config.json` is ignored by Git (already specified in `.gitignore`).

---

## 5. Usage Commands

All deployment tasks are executed via PowerShell from the project root:

### First-Time Full Deployment
Uploads all eligible files to the remote server and establishes the initial `.deploy-manifest.json` checksum cache:
```powershell
.\deploy.ps1 -All
```

### Daily Smart Incremental Deployment
Scans local files, calculates SHA256 hashes, and uploads only modified or newly created files:
```powershell
.\deploy.ps1
```

### Dry Run (Simulation)
Inspects local changes and prints which files would be uploaded or deleted without touching the remote server:
```powershell
.\deploy.ps1 -DryRun
```

### Delete Stale Remote Files
Removes remote files that were previously tracked in the manifest but have since been deleted locally:
```powershell
.\deploy.ps1 -Delete
```

### Combined Git Push + SFTP Deployment
Stages all git changes, commits with your message, pushes to `origin main`, and immediately runs `deploy.ps1`:
```powershell
.\publish.ps1 -Message "Add new article on faith and work"
```

---

## 6. Server Optimization & `.htaccess`

The included `.htaccess` file provides production server rules:

1. **Enforce HTTPS & Canonical Domain**: Automatically issues a 301 permanent redirect from HTTP to HTTPS, and canonicalizes `www` to non-`www`.
2. **Security Headers**:
   - `Strict-Transport-Security` (HSTS)
   - `X-Frame-Options: SAMEORIGIN` (prevents clickjacking)
   - `X-Content-Type-Options: nosniff` (blocks MIME-type confusion)
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: geolocation=(self), microphone=(), camera=()`
3. **GZIP / Deflate Compression**: Compresses HTML, CSS, JavaScript, JSON, XML, and SVG for optimal Core Web Vitals.
4. **Browser Cache Expiration (`mod_expires`)**:
   - Static assets (CSS, JS, Fonts, Images): Cached for 1 year.
   - HTML documents: Cached for 1 hour for fast propagation of editorial updates.

---

## 7. Troubleshooting & FAQ

### Issue: Connection times out on port 21098
- **Cause 1**: SSH Access is disabled in cPanel.
  - *Fix*: Go to cPanel &rarr; **SSH Access** and ensure SSH access is turned on.
- **Cause 2**: Corporate or local firewall blocks outbound port 21098.
  - *Fix*: Test connectivity in PowerShell:
    ```powershell
    Test-NetConnection -ComputerName premiumXXX.web-hosting.com -Port 21098
    ```
  - If `TcpTestSucceeded : False`, configure your router/firewall to allow outbound TCP port 21098.

### Issue: `Permission denied (publickey)`
- **Cause 1**: The SSH key was imported into cPanel but not authorized.
  - *Fix*: cPanel &rarr; **SSH Access** &rarr; **Manage SSH Keys** &rarr; click **Manage** next to your public key &rarr; click **Authorize**.
- **Cause 2**: Key path is invalid.
  - *Fix*: Ensure `"privateKeyPath"` in `deploy-config.json` points to the private key (without `.pub`), e.g., `~/.ssh/id_ed25519`.

### Issue: `OpenSSH 'sftp.exe' was not found in PATH`
- **Cause**: Windows OpenSSH Client feature is not installed.
  - *Fix*: Open Windows Settings &rarr; **Apps** &rarr; **Optional Features** &rarr; add **OpenSSH Client**, or run PowerShell as Administrator:
    ```powershell
    Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0
    ```

### Issue: Need to force a full re-upload
- Simply run:
  ```powershell
  .\deploy.ps1 -All
  ```
  or delete the local `.deploy-manifest.json` file.
