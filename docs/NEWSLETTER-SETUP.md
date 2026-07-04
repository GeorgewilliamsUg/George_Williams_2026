# Newsletter Signup Feature - Setup Guide

## Overview

This newsletter signup feature allows visitors to subscribe to your newsletter with zero database dependency. It uses file-based rate limiting and sends emails via SMTP (PHPMailer preferred) or native PHP mail() function.

## Files Included

- `subscribe.php` - Main backend endpoint handling all signup logic
- `newsletter-form.html` - Reusable HTML/JavaScript form component
- `logs/` - Directory for rate limit data and error logs (protected from web access)
- `NEWSLETTER-SETUP.md` - This file

## Installation Steps

### 1. Create Directory Structure

Ensure these directories exist and have proper permissions:

```bash
# Create logs directory (should not be web accessible)
mkdir -p logs
chmod 700 logs
```

In your `.htaccess` (or web server config), deny access to the logs directory:

```apache
<FilesMatch "\.json|\.log">
    Deny from all
</FilesMatch>
```

### 2. Environment Variables Setup

Set these environment variables in your hosting control panel or `.env` file (if used):

```bash
NEWSLETTER_ADMIN_EMAIL=your-email@example.com
NEWSLETTER_SITE_NAME=Your Blog Name
NEWSLETTER_SITE_URL=https://yourblog.com
NEWSLETTER_SMTP_HOST=smtp.hostinger.com
NEWSLETTER_SMTP_PORT=587
NEWSLETTER_SMTP_USERNAME=your-email@example.com
NEWSLETTER_SMTP_PASSWORD=your-app-password
NEWSLETTER_SMTP_ENCRYPTION=tls
```

### 3. Add Form to Your Page

Add this to your `index.html` or the page where you want the signup form:

```html
<!-- Include the newsletter form -->
<div id="newsletter-container"></div>

<script>
    fetch('newsletter-form.html')
        .then(r => r.text())
        .then(html => {
            document.getElementById('newsletter-container').innerHTML = html;
        });
</script>
```

Or directly embed the content from `newsletter-form.html` into your page.

### 4. Optional: Install PHPMailer for Better SMTP Support

If you have Composer available on your hosting:

```bash
composer require phpmailer/phpmailer
```

The script will automatically use PHPMailer if available. Otherwise, it falls back to native `mail()`.

## Configuration

### Default Settings

- **Rate Limit**: 3 signup attempts per IP per hour
- **Email Template**: Responsive HTML with inline CSS, table-based layout
- **SMTP Encryption**: TLS on port 587 (standard for Hostinger)

### Customizing the Welcome Email

Edit the `generate_welcome_email()` function in `subscribe.php` to customize:
- Header color, font, spacing
- Welcome message content
- Links and call-to-action buttons
- Footer information

## How It Works

### Signup Flow

1. **Frontend Validation**: JavaScript validates email format and prevents empty submissions
2. **Backend Validation**: PHP validates with `filter_var(FILTER_VALIDATE_EMAIL)`
3. **Rate Limiting**: File-based IP tracking prevents spam
4. **Sanitization**: All header values sanitized to prevent header injection
5. **Email Sending**: Sends welcome email to subscriber + admin notification
6. **Response**: Generic JSON response (never exposes internal errors to frontend)
7. **Logging**: All outcomes logged to `logs/php-errors.log`

### Rate Limiting

Rate limiting stores timestamps in `logs/rate_limit.json`:
- Tracks submissions per IP address
- 1-hour sliding window
- Default: 3 submissions per hour per IP
- Old entries automatically pruned

### Email Sending

Two email methods supported (in order of preference):

1. **PHPMailer (Recommended)**: Uses SMTP, full authentication, better compatibility
2. **PHP mail()**: Falls back if PHPMailer unavailable, uses sanitized headers

Both methods:
- Sanitize all header values
- Use controlled From address (your admin email)
- Reply-To set to admin email
- Include proper Content-Type headers

## Security Features

✓ POST-only endpoint (405 response to GET/HEAD)  
✓ Email validation with PHP filter  
✓ Header injection prevention via `sanitize_header()`  
✓ File-based rate limiting (no database needed)  
✓ Generic error messages to frontend (never expose internals)  
✓ Detailed logging to private log file  
✓ Protected logs directory (no web access)  
✓ Exceptions caught and logged, never exposed  

## Testing

### Test via Command Line (if SSH available)

```bash
php subscribe.php
```

This runs the built-in test suite that checks:
- Invalid email rejection
- Empty email rejection
- Rate limiting (after 3 attempts)

### Test via Web Browser

1. Visit your site and fill out the newsletter form
2. Submit with a valid email address
3. Check your email inbox for the welcome message
4. Check admin email for the notification
5. Try submitting 4+ times rapidly to test rate limiting

### Test Email Inbox (Gmail Recommended)

For testing, use a free Gmail test inbox:
1. Update `NEWSLETTER_ADMIN_EMAIL` to your test Gmail account
2. Disable "Less secure app access" and set up an app password
3. Submit a test signup
4. Check Gmail for both emails

## Troubleshooting

### Emails Not Sending

1. Check `logs/php-errors.log` for errors
2. Verify environment variables are set correctly
3. Test SMTP credentials in Hostinger control panel
4. If using PHPMailer, verify Composer installation with `composer dump-autoload`
5. For mail() fallback, check server's mail queue

### Rate Limiting Too Strict

Edit this line in `subscribe.php` to increase limit:

```php
'rate_limit_max' => 5,        // Change 3 to 5 (or higher)
'rate_limit_window' => 3600,  // Change window (seconds)
```

### Form Not Showing

1. Verify `newsletter-form.html` is in the root directory
2. Check browser console for JavaScript errors
3. Ensure CORS allows loading the form (should be same domain)
4. Verify `subscribe.php` has correct path

## Hostinger Specific Notes

- Default PHP version: 7.4+ (PHPMailer requires PHP 5.5+)
- SMTP host: `smtp.hostinger.com`
- SMTP port: 587 (with TLS)
- App password required (not regular account password)
- Check File Manager > Storage to ensure logs directory writable

## Customization Examples

### Change Rate Limit Per IP

```php
'rate_limit_max' => 5,           // Allow 5 instead of 3
'rate_limit_window' => 86400,    // 1 day instead of 1 hour
```

### Customize Welcome Email Subject

```php
$subject = sanitize_header('Welcome to ' . $config['site_name'] . ' Newsletter!');
```

### Add Custom Fields

To add more fields (e.g., name, category preferences):

1. Add inputs to `newsletter-form.html`
2. Update validation in the form JavaScript
3. Update `process_signup()` in `subscribe.php` to read additional fields
4. Sanitize them with `sanitize_header()`
5. Update email templates to include them

## Support & Monitoring

Monitor these files regularly:

```bash
# Check for errors
tail -f logs/php-errors.log

# Check current rate limits
cat logs/rate_limit.json

# Clear rate limits (careful!)
rm logs/rate_limit.json
```

## Production Checklist

- [ ] Environment variables set on hosting
- [ ] Logs directory protected via .htaccess
- [ ] PHPMailer installed if using SMTP
- [ ] Admin email configured
- [ ] SMTP credentials verified
- [ ] Test form submitted successfully
- [ ] Welcome email received
- [ ] Admin notification received
- [ ] Rate limiting tested
- [ ] Error logging verified
- [ ] Form added to public page
