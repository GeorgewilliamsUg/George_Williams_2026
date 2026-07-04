# Newsletter Security & Testing Verification Guide

## Overview

This document outlines the security measures implemented and how to verify each one works correctly. Run these tests before and after production deployment.

---

## Task 1: Project Structure & File Protection

### Implementation

✅ **`.env` file protected:**
- Location: `private/config/.env` (outside `public_html/`)
- `.htaccess` entry: `<Files ".env">` blocks web access
- Added to `.gitignore` to prevent version control commits

✅ **`/storage` directory protected:**
- Location: `storage/` (outside `public_html/`)
- `.htaccess` in directory root: `Deny from all`
- Contains: `subscribers_log.json`, `mail_log.txt`
- Files created with `chmod 0600` (read/write owner only)

✅ **Multi-layer protection:**
- Apache `.htaccess` blocks web requests
- File permissions prevent direct file access
- `.gitignore` prevents accidental commits to version control

### Verification Tests

```bash
# Test 1: Verify .env returns 403
curl -I https://yoursite.com/.env
# Expected: HTTP/1.1 403 Forbidden

# Test 2: Verify /storage returns 403
curl -I https://yoursite.com/storage/
# Expected: HTTP/1.1 403 Forbidden

# Test 3: Verify subscribers_log.json returns 403
curl -I https://yoursite.com/storage/subscribers_log.json
# Expected: HTTP/1.1 403 Forbidden

# Test 4: Check file permissions on server (via SSH)
ssh user@hostinger.com
ls -la storage/
# Expected: -rw------- (0600) for all files

# Test 5: Verify .gitignore includes storage
grep -E "^/storage" .gitignore
# Expected: /storage
```

---

## Task 2: Configuration Loader

### Implementation

File: `config-loader.php`

Features:
- Reads `.env` file line-by-line
- Trims whitespace, skips comments (#) and blank lines
- Returns config as array (not getenv())
- Validates ALL required keys at startup
- Validates URL format (must be https:// or http://)
- Validates email format using `filter_var()`
- Validates SMTP port is 1-65535
- Fails loudly to logs if any required key missing or empty

### Verification Tests

```php
// Test: Load config and check for errors
<?php
require_once 'config-loader.php';

try {
    $config = new ConfigLoader();
    echo "✓ Configuration loaded successfully\n";
    echo "Site: " . $config->get('NEWSLETTER_SITE_NAME') . "\n";
    echo "Admin: " . $config->get('NEWSLETTER_ADMIN_EMAIL') . "\n";
} catch (Exception $e) {
    echo "✗ Configuration error: " . $e->getMessage() . "\n";
    // Check logs: private/logs/php-errors.log
}
?>
```

### Invalid Configuration Tests

```bash
# Test: Missing NEWSLETTER_ADMIN_EMAIL
# .env: (delete or comment out the line)
curl -X POST https://yoursite.com/subscribe.php -d "email=test@example.com"
# Expected: HTTP 500, logs show "Missing required configuration keys"

# Test: Empty NEWSLETTER_SMTP_PASSWORD
# .env: NEWSLETTER_SMTP_PASSWORD=
curl -X POST https://yoursite.com/subscribe.php -d "email=test@example.com"
# Expected: HTTP 500, logs show "Empty required configuration values"

# Test: Invalid NEWSLETTER_SITE_URL
# .env: NEWSLETTER_SITE_URL=not-a-url
curl -X POST https://yoursite.com/subscribe.php -d "email=test@example.com"
# Expected: HTTP 500, logs show "Invalid URL format"
```

---

## Task 3: Frontend Subscription Form

### Implementation

File: `public/newsletter-form.html`

Features:
- Single email input field
- HTML5 `type="email"` with pattern validation
- Submit button disabled during submission
- Inline success/error message display
- No page reload
- `fetch()` POST to `subscribe.php`
- No sensitive config in frontend code

### Verification Tests

```javascript
// Test 1: Form submits successfully
// Browser: Open page, submit valid email
// Expected: Success message appears, no page reload

// Test 2: Invalid email rejected
// Browser: Submit "notanemail"
// Expected: HTML5 validation error OR custom error message

// Test 3: Button disabled during submission
// Browser: Submit and watch button
// Expected: Button shows "Subscribing..." and is disabled

// Test 4: Error message shown on failure
// Network: Intercept and fail the request
// Expected: Error message appears in red
```

---

## Task 4: Backend Endpoint - Input Handling

### Implementation

File: `public/subscribe.php`

Features:
- Accepts only POST requests (405 Method Not Allowed for others)
- Accepts only `application/x-www-form-urlencoded` (415 Unsupported Media Type for JSON)
- Enforces 254-character limit on email (before validation)
- Validates with `filter_var($email, FILTER_VALIDATE_EMAIL)`
- Sanitizes all header values: removes `\r`, `\n`, `\0` bytes
- Origin/Referer validation against `NEWSLETTER_SITE_URL`
- Returns only `{success: bool, message: string}` (no internal details)

### Verification Tests

```bash
# Test 1: GET request rejected
curl -I https://yoursite.com/subscribe.php
# Expected: HTTP 405 Method Not Allowed

# Test 2: PUT request rejected
curl -X PUT https://yoursite.com/subscribe.php
# Expected: HTTP 405 Method Not Allowed

# Test 3: DELETE request rejected
curl -X DELETE https://yoursite.com/subscribe.php
# Expected: HTTP 405 Method Not Allowed

# Test 4: JSON body rejected
curl -X POST https://yoursite.com/subscribe.php \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
# Expected: HTTP 415 Unsupported Media Type

# Test 5: Valid form-encoded request accepted
curl -X POST https://yoursite.com/subscribe.php \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=test@example.com"
# Expected: HTTP 200, JSON response with success or message

# Test 6: Email 254 chars accepted
EMAIL_254=$(python3 -c "print('a' * 243 + '@test.co')")  # 254 total
curl -X POST https://yoursite.com/subscribe.php \
  -d "email=$EMAIL_254"
# Expected: Processed (may be rejected by SMTP, but not input validation)

# Test 7: Email 255+ chars rejected
EMAIL_255=$(python3 -c "print('a' * 244 + '@test.co')")  # 255 total
curl -X POST https://yoursite.com/subscribe.php \
  -d "email=$EMAIL_255"
# Expected: HTTP 400, "Invalid email address"

# Test 8: Header injection in email
curl -X POST https://yoursite.com/subscribe.php \
  -d "email=test%40example.com%0AX-INJECTED:%20true"
# Expected: \r\n stripped from email, not processed as header

# Test 9: Null byte injection
curl -X POST https://yoursite.com/subscribe.php \
  -d "email=test%00@example.com"
# Expected: \0 byte removed, email rejected as invalid format

# Test 10: Cross-origin rejection
curl -X POST https://otherwebsite.com/proxy?to=yoursite.com/subscribe.php \
  -H "Origin: https://malicious.com" \
  -d "email=test@example.com"
# Expected: HTTP 403 Forbidden if Origin doesn't match NEWSLETTER_SITE_URL

# Test 11: Invalid Referer rejection
curl -X POST https://yoursite.com/subscribe.php \
  -H "Referer: https://phishing.com/your-form" \
  -d "email=test@example.com"
# Expected: HTTP 403 Forbidden (Referer host doesn't match)
```

---

## Task 5: Rate Limiting & Duplicate Prevention

### Implementation

File: `public/subscribe.php` - `check_rate_limit()`, `check_duplicate_email()`, `record_subscription()`

Features:
- **File-based** (no database): `storage/subscribers_log.json`
- **Line-based** append-only format: one JSON object per line
- **Proper file locking**: `flock($handle, LOCK_EX)` held for entire read-modify-write cycle
- **IP-based rate limit**: Max 3 per hour (configurable)
- **Email-based duplicate check**: Same email rejected within 24 hours (configurable)
- **Pruning on read**: Expires entries older than time window
- **Lock released before SMTP**: File lock not held during email send
- **Friendly messages**: Different message for rate limit vs duplicate

### Verification Tests

```bash
# Test 1: First 3 submissions from same IP allowed
IP="192.168.1.100"
for i in {1..3}; do
  curl -X POST https://yoursite.com/subscribe.php \
    -H "X-Forwarded-For: $IP" \
    -d "email=test$i@example.com"
  # Expected: success: true
  echo "Submission $i: OK"
done

# Test 2: 4th submission from same IP rate limited
curl -X POST https://yoursite.com/subscribe.php \
  -H "X-Forwarded-For: $IP" \
  -d "email=test4@example.com"
# Expected: success: false, message includes "Too many"

# Test 3: Different IP can still submit (rate limits are per-IP)
curl -X POST https://yoursite.com/subscribe.php \
  -H "X-Forwarded-For: 10.0.0.1" \
  -d "email=test5@example.com"
# Expected: success: true (different IP)

# Test 4: Same email from different IP rejected as duplicate
curl -X POST https://yoursite.com/subscribe.php \
  -H "X-Forwarded-For: 10.0.0.2" \
  -d "email=test@example.com"  # Same email as first test
# Expected: success: false, message about "already subscribed"

# Test 5: Duplicate message is friendly
# Check response message includes "already subscribed"

# Test 6: Rate limit expires after 1 hour
# Delete storage/subscribers_log.json or wait 1 hour
# Then resubmit from original IP with 4th email
# Expected: success: true (rate limit reset)

# Test 7: Duplicate expires after 24 hours
# Wait 24 hours or manually edit subscribers_log.json
# Resubmit same email address
# Expected: success: true (treated as new subscription)

# Test 8: File lock prevents race conditions
# Simulate 10 concurrent requests from same IP
for i in {1..10}; do
  curl -X POST https://yoursite.com/subscribe.php \
    -H "X-Forwarded-For: 192.168.1.200" \
    -d "email=race$i@example.com" &
done
wait
# Expected: Only 3 succeed, 7 rejected as rate limited
# (If >3 succeeded, lock wasn't held properly)
```

### Verify Log Format

```bash
# SSH to server
ssh user@hostinger.com

# Check subscribers log (append-only, line-based JSON)
cat storage/subscribers_log.json
# Expected output:
# {"email":"user1@example.com","ip":"192.168.1.1","timestamp":1688473200,"success":true}
# {"email":"user2@example.com","ip":"192.168.1.1","timestamp":1688473215,"success":true}
# {"email":"duplicate@example.com","ip":"192.168.1.2","timestamp":1688473220,"success":false}

# Verify append-only (no rewrites, safer from crashes)
# The file only ever grows, never gets rewritten
```

---

## Task 6: Email Sending - SMTP

### Implementation

File: `public/subscribe.php` - `send_via_phpmailer()`, `send_via_mail()`

Features:
- **PHPMailer preferred** if available (`vendor/autoload.php`)
- **Fallback to mail()** if PHPMailer not available
- **Never uses subscriber address as From**: Always use SMTP username
- **Reply-To set to sender**: Subscriber can reply but doesn't see config
- **Timeout on SMTP**: 10 seconds prevents hanging
- **File lock released before email send**: Won't hold lock during network call
- **Configuration from validated config array** (not getenv())
- **SMTP timeout prevents indefinite hangs**

### Verification Tests

```bash
# Test 1: PHPMailer used if available
# Check if vendor/autoload.php exists
ls vendor/autoload.php
# If exists: PHPMailer should be used
# Check logs: "PHPMailer" not in error logs = working

# Test 2: Fallback to mail() if PHPMailer unavailable
# Temporarily rename vendor/ directory
# Submit subscription
# Emails should still send (via mail() fallback)

# Test 3: SMTP timeout prevents hanging
# Update .env to point to unreachable SMTP: NEWSLETTER_SMTP_HOST=192.0.2.1
# Submit subscription
# Request should complete within 20 seconds (10s timeout + overhead)
# Not hang indefinitely

# Test 4: From address never leaks subscriber email
# Send email via web form
# Check email headers
# Expected: From: site-name <smtp-username>
# Not: From: subscriber@example.com

# Test 5: Reply-To allows replies
# Receive welcome email
# Click Reply
# Expected: Composes reply to SMTP username, not blank

# Test 6: File lock not held during SMTP
# Monitor process
# Submit subscription, watch memory usage
# Should not hold exclusive lock for full email send duration
```

---

## Task 7: Email Delivery

### Implementation

Files: `public/subscribe.php` - Welcome and Admin email functions

**Welcome Email:**
- HTML format with inline CSS
- Table-based layout (max-width: 600px)
- Greeting, subscription confirmation
- CTA link to `NEWSLETTER_SITE_URL`
- Closing signature
- Each send in own try/catch

**Admin Email:**
- Plain text format
- Includes subscriber email and timestamp
- Includes IP address
- Each send in own try/catch (independent)

**Logging:**
- Both attempts logged to `storage/mail_log.txt`
- Format: `[timestamp] SUCCESS|FAILED - EMAIL_TYPE to address`
- Even if one fails, other is still attempted

### Verification Tests

```bash
# Test 1: Welcome email is HTML
# Submit subscription, check received email
# Expected: HTML rendered, table-based layout
# Width: max 600px
# Contains: greeting, site name, CTA button to NEWSLETTER_SITE_URL

# Test 2: Admin email is plain text
# Check admin inbox
# Expected: Plain text email
# Contains: subscriber email, timestamp, IP

# Test 3: Both emails sent
# Check both subscriber and admin inboxes
# Expected: 2 emails (one HTML, one plain text)

# Test 4: Independent sends (one can fail while other succeeds)
# Temporarily set bad admin email: NEWSLETTER_ADMIN_EMAIL=invalid
# Submit subscription
# Expected:
#   - Welcome email ARRIVES to subscriber
#   - Admin email FAILS
#   - User sees "success" message anyway
#   - Log shows: SUCCESS for welcome, FAILED for admin

# Test 5: Delivery log created and populated
# Check: cat storage/mail_log.txt
# Expected:
# [2024-07-04 14:20:00 UTC] SUCCESS - WELCOME to user@example.com
# [2024-07-04 14:20:05 UTC] SUCCESS - ADMIN_NOTIFICATION to admin@example.com
# [2024-07-04 14:30:12 UTC] FAILED - WELCOME to bad@email.com | Error: ...

# Test 6: Mail log protected
# Try to access: https://yoursite.com/storage/mail_log.txt
# Expected: HTTP 403 Forbidden
```

---

## Task 8: Structured, Production-Safe Script

### Implementation

Overall design in `public/subscribe.php`

Features:
- Clear sequence: validate → rate limit → duplicate check → send emails → respond
- **All exceptions caught internally**: No stack traces to user
- **No internal details in responses**: Generic "error occurred" messages
- **Full details logged privately**: `private/logs/php-errors.log`
- **Rate limit lock released before email send**: File lock not held during SMTP
- **Independent email sends**: One can fail, other attempts anyway
- **Configuration validated at startup**: Fails immediately if .env is invalid
- **Origin/Referer validated before processing**: Prevents cross-site abuse
- **All user input sanitized**: Length, format, header injection

### Verification Tests

```bash
# Test 1: No internal error details leaked
# Cause an error (e.g., bad SMTP)
# Expected response: {"success": false, "message": "An error occurred. Please try again later."}
# NOT: Stack trace, SQL error, file paths, etc.

# Test 2: Errors logged internally
# Check: tail private/logs/php-errors.log
# Expected: Full error details, including stack trace if PHP error

# Test 3: Configuration error doesn't expose details
# Delete or corrupt .env
# Submit: curl -X POST https://yoursite.com/subscribe.php -d "email=test@example.com"
# Expected response: {"success": false, "message": "Service unavailable"}
# Not: "ConfigLoader: Missing NEWSLETTER_ADMIN_EMAIL"

# Test 4: Rate limit doesn't expose details
# Exceed rate limit
# Expected: {"success": false, "message": "Too many signup attempts. Please try again later."}
# Not: "IP 192.168.1.1 has 4 attempts, max is 3"

# Test 5: Complete flow works end-to-end
# Browser: Submit valid email with .env configured
# Expected: Success message, emails arrive, logged correctly
```

---

## Task 9: Testing Procedure

### Comprehensive Test Checklist

#### Validation Tests ✓
- [ ] Form submits and receives JSON response
- [ ] Invalid email format rejected
- [ ] Empty email rejected
- [ ] Oversized email (255+ chars) rejected
- [ ] Email with leading/trailing spaces trimmed

#### Security Tests ✓
- [ ] Header injection attempt (CRLF) neutralized
- [ ] Null byte injection neutralized
- [ ] Method validation (GET/PUT rejected)
- [ ] Content-Type validation (JSON rejected)
- [ ] Origin validation (cross-origin rejected)
- [ ] Referer validation (phishing domain rejected)
- [ ] URL validation (invalid URLs rejected)

#### Rate Limiting Tests ✓
- [ ] 3 submissions allowed per IP per hour
- [ ] 4th submission rejected
- [ ] Different IPs have separate limits
- [ ] Rate limit expires after 1 hour
- [ ] Rate limit message is generic (no IP details)

#### Duplicate Prevention Tests ✓
- [ ] 4th attempt rejected as rate limited
- [ ] Same email rejected within 24 hours
- [ ] Duplicate message is friendly ("already subscribed")
- [ ] Different message from rate limit
- [ ] Duplicate expires after 24 hours

#### Email Delivery Tests ✓
- [ ] Welcome email arrives to subscriber
- [ ] Admin email arrives to admin
- [ ] Welcome email is HTML with table layout
- [ ] Admin email is plain text
- [ ] Both emails have correct From/Reply-To
- [ ] No subscriber email visible in headers
- [ ] Emails independent (one fails, other sent)

#### File Protection Tests ✓
- [ ] `.env` returns 403 Forbidden
- [ ] `private/` returns 403 Forbidden
- [ ] `/storage/` returns 403 Forbidden
- [ ] `/storage/subscribers_log.json` returns 403
- [ ] File permissions are 0600

#### Error Handling Tests ✓
- [ ] No internal error details in responses
- [ ] All errors logged to `private/logs/php-errors.log`
- [ ] Generic messages returned to frontend
- [ ] Complete stack trace in logs (if error)
- [ ] Configuration errors fail loudly to logs

---

## How to Run Full Test Suite

### 1. Local Testing (Before Deployment)

```bash
# Test configuration loader
php config-loader.php

# Check syntax
php -l public/subscribe.php
php -l config-loader.php
```

### 2. Staging Testing (If Available)

```bash
# Deploy to staging environment
# Run all verification tests above
# Verify email arrives from staging SMTP
```

### 3. Production Testing (After Deployment)

```bash
# Test 1: Configuration loaded
curl -X POST https://yoursite.com/subscribe.php -d "email=test@example.com"
# Should get JSON response (success or error), not 500

# Test 2: Rate limiting
for i in {1..4}; do
  curl -X POST https://yoursite.com/subscribe.php -d "email=test$i@example.com"
done
# Last one should be rejected

# Test 3: File protection
curl -I https://yoursite.com/.env      # Should be 403
curl -I https://yoursite.com/storage/  # Should be 403

# Test 4: Check logs
ssh user@hostinger.com
tail private/logs/php-errors.log   # Should show signup attempts
cat storage/mail_log.txt           # Should show email sends
```

---

## Success Criteria

All of the following must be true:

✅ Valid emails accepted and processed
✅ Invalid emails rejected with generic message  
✅ Rate limiting works (3 per IP per hour)
✅ Duplicates rejected (24 hour window)
✅ Welcome email arrives (HTML)
✅ Admin email arrives (plain text)
✅ `.env` returns 403 Forbidden
✅ `/storage/` returns 403 Forbidden
✅ No internal error details exposed
✅ All errors logged to `php-errors.log`
✅ File permissions are 0600
✅ `.gitignore` includes `/.env` and `/storage`
✅ Configuration validated at startup
✅ Header injection attempts neutralized
✅ SMTP timeout prevents hangs
✅ File lock prevents race conditions
