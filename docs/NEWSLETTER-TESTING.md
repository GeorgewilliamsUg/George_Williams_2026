#!/usr/bin/env php
<?php
/**
 * Newsletter Signup - Manual Test Guide
 * 
 * This file documents the complete testing procedure for the newsletter signup feature.
 * You cannot run this as a script; instead, it provides step-by-step instructions.
 * 
 * To run command-line tests (if SSH available):
 *   php subscribe.php
 */

echo <<<'TEST_GUIDE'

═══════════════════════════════════════════════════════════════════════════════
                NEWSLETTER SIGNUP - COMPLETE TESTING GUIDE
═══════════════════════════════════════════════════════════════════════════════

## SETUP TEST (Before Public Launch)

### Step 1: Verify Environment Variables
Run this via SSH or PHP execution:

    php -r "
    echo 'Checking environment variables...\n';
    echo 'NEWSLETTER_ADMIN_EMAIL: ' . (getenv('NEWSLETTER_ADMIN_EMAIL') ?: 'NOT SET') . '\n';
    echo 'NEWSLETTER_SITE_NAME: ' . (getenv('NEWSLETTER_SITE_NAME') ?: 'NOT SET') . '\n';
    echo 'NEWSLETTER_SMTP_HOST: ' . (getenv('NEWSLETTER_SMTP_HOST') ?: 'NOT SET') . '\n';
    echo 'NEWSLETTER_SMTP_PORT: ' . (getenv('NEWSLETTER_SMTP_PORT') ?: 'NOT SET') . '\n';
    "

Expected: All variables show your configured values (not "NOT SET")


### Step 2: Check Log Directory Permissions
SSH into your server and run:

    ls -la logs/

Expected output should show:
    drwx------ (700 permission - only owner can read/write)


### Step 3: Verify subscribe.php is Accessible
Open in browser (should return error, not display PHP):

    https://yourdomain.com/subscribe.php

Expected: 400 Bad Request JSON response (not visible PHP code)
Confirm this means the file is executable but requires POST data.


═══════════════════════════════════════════════════════════════════════════════
## FORM VALIDATION TEST

### Test 1: Empty Email Should be Rejected (JavaScript)

1. Visit your site
2. Leave the email field empty
3. Click Subscribe
4. Expected: Error message appears: "Please enter a valid email address"
5. Expected: No request sent to subscribe.php


### Test 2: Invalid Email Format Should be Rejected (JavaScript)

1. Visit your site
2. Enter invalid emails one by one:
   - "notanemail"
   - "missing@.com"
   - "@nodomain.com"
   - "space in@email.com"
3. Click Subscribe each time
4. Expected: Error message each time
5. Expected: No request sent to subscribe.php (check browser DevTools Network tab)


### Test 3: Valid Email Should Submit

1. Visit your site
2. Enter: test@gmail.com
3. Click Subscribe
4. Expected: "Subscribing..." state on button
5. Expected: Success message displays
6. Expected: Email field clears
7. Expected: Request visible in DevTools Network tab
   - URL: subscribe.php
   - Method: POST
   - Response: {"success": true, "message": "..."}


═══════════════════════════════════════════════════════════════════════════════
## EMAIL DELIVERY TEST

### Test 4: Welcome Email Should Arrive

1. Complete Test 3 with a real email you monitor
2. Wait 1-2 minutes
3. Check your email inbox (not spam folder)
4. Expected email contains:
   ✓ Subject: "Welcome to [Your Site Name]"
   ✓ From: Your configured admin email
   ✓ HTML formatted with site logo/heading area
   ✓ Warm welcome message
   ✓ "Visit Our Blog" link pointing to your site
   ✓ Footer with copyright info
   ✓ Mobile friendly (check on phone if possible)


### Test 5: Email Template Renders Correctly

Check the welcome email for:

Visual Quality:
   ✓ No broken images or missing content
   ✓ Heading and body text readable
   ✓ Colors consistent (dark text on light background)
   ✓ Button is clickable and styled properly
   ✓ No raw HTML tags showing

Content Accuracy:
   ✓ Your site name appears in heading
   ✓ "Visit Our Blog" link matches your NEWSLETTER_SITE_URL
   ✓ Message is friendly and clear

Email Client Testing:
   ✓ Gmail - should render perfectly
   ✓ Outlook - check for alignment issues
   ✓ Apple Mail - check font rendering
   ✓ Mobile mail app - check responsive layout


### Test 6: Admin Notification Should Arrive

1. Complete Test 3 again with another test email
2. Check your NEWSLETTER_ADMIN_EMAIL inbox (the admin email you set)
3. Expected email contains:
   ✓ Subject line includes the subscriber email
   ✓ Plain text (not HTML)
   ✓ Lists subscriber email
   ✓ Shows signup date/time
   ✓ Shows subscriber IP address


═══════════════════════════════════════════════════════════════════════════════
## RATE LIMITING TEST

### Test 7: Rate Limiting Should Trigger After 3 Attempts

1. Visit your site
2. Submit email 1: test1@gmail.com - Click Subscribe
   Expected: Success message
   
3. Submit email 2: test2@gmail.com - Click Subscribe  
   Expected: Success message
   
4. Submit email 3: test3@gmail.com - Click Subscribe
   Expected: Success message
   
5. Submit email 4: test4@gmail.com - Click Subscribe
   Expected: Error message about "too many signup attempts"
   
6. Check DevTools Network tab for request 4
   Expected Response: 400 status, message about rate limit

7. Wait 1 hour, then try again
   Expected: Can submit again after rate window expires


### Test 8: Rate Limiting is Per IP Address

If you have access to multiple IPs:

1. From IP A: Submit test@gmail.com
2. From IP B: Submit test@gmail.com - should still work
3. Back to IP A: Submit again - should count toward IP A's limit

This verifies rate limiting tracks per IP, not per email.


═══════════════════════════════════════════════════════════════════════════════
## ERROR HANDLING TEST

### Test 9: Invalid HTTP Methods Should Be Rejected

SSH and run:

    curl -X GET https://yourdomain.com/subscribe.php

Expected Response:
    HTTP/1.1 405 Method Not Allowed
    {"success":false,"message":"Method not allowed"}


### Test 10: Bad SMTP Configuration Should Be Handled Gracefully

1. Temporarily set NEWSLETTER_SMTP_PASSWORD to wrong value
2. Submit a form
3. Expected: Generic error message to user (not detailed error)
4. Expected: Detailed error logged to logs/php-errors.log
5. Check logs with SSH:
    tail logs/php-errors.log
   Should show SMTP authentication error details
6. Fix the SMTP password


### Test 11: Missing Environment Variables Should Fallback

1. Comment out NEWSLETTER_SMTP_HOST
2. Submit a form
3. If PHPMailer not installed, should try mail()
4. Otherwise, should gracefully fail with generic message


═══════════════════════════════════════════════════════════════════════════════
## SECURITY TEST

### Test 12: Header Injection Should Be Blocked

SSH and test with:

    php -r "
    \$_SERVER['REQUEST_METHOD'] = 'POST';
    \$_POST['email'] = 'test@example.com%0aBcc:attacker@evil.com';
    include('subscribe.php');
    "

Expected: 
    - Newsletter sent only to legitimate recipient
    - No blind copy to attacker email
    - The %0a (newline) should be stripped by sanitize_header()


### Test 13: SQL Injection Not Applicable (No Database)

This feature has no SQL injection risk because there's no database.
✓ Confirmed: Uses only file-based rate limiting


═══════════════════════════════════════════════════════════════════════════════
## LOG VERIFICATION

### Test 14: Check Error Logging

SSH into server:

    tail -f logs/php-errors.log

Submit a newsletter signup and verify log shows:
    [timestamp] Newsletter signup successful: test@example.com

If there's an error, verify detailed error information is logged.


### Test 15: Check Rate Limit Data File

SSH and inspect:

    cat logs/rate_limit.json | php -r "
    \$data = json_decode(file_get_contents('php://stdin'), true);
    echo json_encode(\$data, JSON_PRETTY_PRINT);
    "

Expected: JSON showing IPs and recent submission timestamps


═══════════════════════════════════════════════════════════════════════════════
## PRODUCTION READINESS CHECKLIST

Before deploying to production, verify:

SECURITY:
  [ ] Environment variables set in hosting control panel (not visible in code)
  [ ] logs/ directory has 700 permissions (not readable from web)
  [ ] .htaccess protecting logs/ directory is in place
  [ ] subscribe.php is not readable as plain text via web browser
  [ ] No database credentials exposed anywhere

FUNCTIONALITY:
  [ ] Form displays on your public page
  [ ] Email validation works (reject invalid addresses)
  [ ] Rate limiting triggers after configured attempts
  [ ] Welcome email delivers to subscriber inbox (not spam)
  [ ] Admin notification delivers successfully
  [ ] Both emails contain correct information
  [ ] Success/error messages are generic (no internal error details)

COMPATIBILITY:
  [ ] Welcome email renders in Gmail
  [ ] Welcome email renders in Outlook
  [ ] Welcome email renders in Apple Mail
  [ ] Form works on mobile browsers
  [ ] Button disabled during submission (no double-submit)

MONITORING:
  [ ] Check logs weekly for errors or rate limit issues
  [ ] Monitor subscriber email addresses for duplicates
  [ ] Test from multiple locations/IPs periodically
  [ ] Set up email forwarding if needed for admin notifications

═══════════════════════════════════════════════════════════════════════════════
## TROUBLESHOOTING

If something doesn't work, follow this process:

1. CHECK BROWSER CONSOLE (F12 > Console)
   - Look for JavaScript errors
   - Check Network tab for request details
   - See if subscribe.php is being called

2. CHECK ERROR LOGS
   Via SSH:
   tail logs/php-errors.log
   - Look for PHP errors or exceptions
   - Check SMTP connection errors

3. VERIFY ENVIRONMENT VARIABLES
   Confirm all NEWSLETTER_* variables are set correctly

4. TEST SMTP SEPARATELY
   On Hostinger, use their mail testing tool or run:
   php -r "
   \$to = 'test@gmail.com';
   \$subject = 'Test';
   \$message = 'This is a test';
   \$headers = 'From: admin@yourdomain.com';
   mail(\$to, \$subject, \$message, \$headers);
   echo 'Mail sent';
   "

5. CHECK RATE LIMIT FILE
   cat logs/rate_limit.json
   - Verify IP tracking is working
   - Look for the client IP in the file

═══════════════════════════════════════════════════════════════════════════════

END OF TEST GUIDE

For detailed setup instructions, see: NEWSLETTER-SETUP.md
For code documentation, see: subscribe.php (extensive comments)

═══════════════════════════════════════════════════════════════════════════════

TEST_GUIDE;
?>
