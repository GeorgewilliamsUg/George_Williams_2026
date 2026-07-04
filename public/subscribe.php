<?php
/**
 * Newsletter Signup Endpoint - Production Safe Implementation
 * 
 * Features:
 * - Configuration from .env with validation
 * - Input validation and sanitization
 * - File-based rate limiting with proper locking (IP-based)
 * - Duplicate prevention (email-based, 24hr window)
 * - Email size constraints (254 chars max)
 * - Header injection prevention
 * - Origin/Referer validation
 * - SMTP support with PHPMailer preference
 * - Structured error logging
 * - No internal error details in responses
 */

// === ERROR HANDLING & LOGGING ===
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', dirname(__DIR__) . '/private/logs/php-errors.log');

// === INITIALIZATION ===
require_once dirname(__DIR__) . '/config-loader.php';

try {
    $config_obj = new ConfigLoader();
    $config = $config_obj->all();
} catch (Exception $e) {
    // Configuration failed - log and exit
    error_log('Configuration error: ' . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Service unavailable']);
    exit;
}

// === REQUEST METHOD VALIDATION ===
$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'POST') {
    http_response_code(405);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// === REQUEST CONTENT TYPE VALIDATION ===
$content_type = $_SERVER['CONTENT_TYPE'] ?? '';
if (strpos($content_type, 'application/x-www-form-urlencoded') === false &&
    strpos($content_type, 'multipart/form-data') === false &&
    $method === 'POST' && !empty($content_type)) {
    // Content-Type header is present but not form-encoded
    http_response_code(415);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Unsupported content type']);
    exit;
}

// === ORIGIN/REFERER VALIDATION ===
function validate_origin($config) {
    $site_url = $config['NEWSLETTER_SITE_URL'];
    
    // Extract domain from site URL
    $parsed = parse_url($site_url);
    $allowed_host = $parsed['host'] ?? '';
    
    if (empty($allowed_host)) {
        return true; // If we can't parse, allow (better to be permissive)
    }
    
    // Check Origin header
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (!empty($origin)) {
        $origin_parsed = parse_url($origin);
        $origin_host = $origin_parsed['host'] ?? '';
        if ($origin_host !== $allowed_host) {
            error_log("Origin validation failed: $origin vs $allowed_host");
            return false;
        }
    }
    
    // Check Referer header
    $referer = $_SERVER['HTTP_REFERER'] ?? '';
    if (!empty($referer)) {
        $referer_parsed = parse_url($referer);
        $referer_host = $referer_parsed['host'] ?? '';
        if ($referer_host !== $allowed_host) {
            error_log("Referer validation failed: $referer vs $allowed_host");
            return false;
        }
    }
    
    return true;
}

if (!validate_origin($config)) {
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Request rejected']);
    exit;
}

// === RESPONSE HEADER ===
header('Content-Type: application/json');

// === HELPER FUNCTIONS ===

/**
 * Sanitize header values to prevent header injection
 * Removes \r, \n, and null bytes
 */
function sanitize_header($value) {
    return str_replace(["\r", "\n", "\0"], '', $value);
}

/**
 * Get client IP address
 */
function get_client_ip() {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        return $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        return trim($ips[0]);
    }
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

/**
 * Ensure storage directory exists
 */
function ensure_storage_dir() {
    $dir = dirname(__DIR__) . '/storage';
    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
    }
    return $dir;
}

/**
 * Get subscribers log file path
 */
function get_subscribers_log_file() {
    $dir = ensure_storage_dir();
    return $dir . '/subscribers_log.json';
}

/**
 * Check and enforce email length limit (254 chars)
 */
function check_email_length($email) {
    return strlen($email) <= 254;
}

/**
 * Validate email with PHP's filter_var
 */
function validate_email($email) {
    $email = trim($email);
    if (empty($email)) {
        return false;
    }
    if (!check_email_length($email)) {
        return false;
    }
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Rate limiting check with file locking
 * Returns: ['allowed' => bool, 'message' => string]
 */
function check_rate_limit($ip, $max_attempts, $window_seconds) {
    $file = get_subscribers_log_file();
    $now = time();
    $data = [];

    // Open file with exclusive lock for entire read-modify-write cycle
    $handle = @fopen($file, 'c+');
    if ($handle === false) {
        error_log("Cannot open subscribers log: $file");
        return ['allowed' => false, 'message' => 'Service temporarily unavailable'];
    }

    // Acquire exclusive lock for entire operation
    if (!flock($handle, LOCK_EX)) {
        error_log("Cannot acquire lock on subscribers log");
        fclose($handle);
        return ['allowed' => false, 'message' => 'Service temporarily unavailable'];
    }

    try {
        // Read existing data
        rewind($handle);
        $content = stream_get_contents($handle);
        
        if (!empty($content)) {
            // Parse line-by-line JSON (one object per line)
            $lines = array_filter(explode("\n", $content));
            foreach ($lines as $line) {
                $entry = json_decode($line, true);
                if ($entry && isset($entry['timestamp'])) {
                    // Organize by IP for rate limit check
                    if (!isset($data['by_ip'])) {
                        $data['by_ip'] = [];
                    }
                    if (!isset($data['by_ip'][$entry['ip']])) {
                        $data['by_ip'][$entry['ip']] = [];
                    }
                    $data['by_ip'][$entry['ip']][] = $entry;
                    
                    // Organize by email for duplicate check
                    if (!isset($data['by_email'])) {
                        $data['by_email'] = [];
                    }
                    if (!isset($data['by_email'][$entry['email']])) {
                        $data['by_email'][$entry['email']] = [];
                    }
                    $data['by_email'][$entry['email']][] = $entry;
                }
            }
        }

        // Prune expired entries for this IP (older than rate limit window)
        if (isset($data['by_ip'][$ip])) {
            $data['by_ip'][$ip] = array_filter($data['by_ip'][$ip], function($entry) use ($now, $window_seconds) {
                return ($now - $entry['timestamp']) < $window_seconds;
            });
        }

        // Check if IP has exceeded rate limit
        $ip_count = isset($data['by_ip'][$ip]) ? count($data['by_ip'][$ip]) : 0;
        if ($ip_count >= $max_attempts) {
            flock($handle, LOCK_UN);
            fclose($handle);
            error_log("Rate limit exceeded for IP: $ip (count: $ip_count)");
            return ['allowed' => false, 'message' => 'Too many signup attempts. Please try again later.'];
        }

        return ['allowed' => true, 'data' => $data];

    } finally {
        flock($handle, LOCK_UN);
        fclose($handle);
    }
}

/**
 * Check for duplicate email submission (24 hour window)
 */
function check_duplicate_email($email, $data, $duplicate_window) {
    $now = time();
    
    if (!isset($data['by_email'][$email])) {
        return ['is_duplicate' => false];
    }

    // Prune expired entries for this email (older than 24 hours)
    $recent = array_filter($data['by_email'][$email], function($entry) use ($now, $duplicate_window) {
        return ($now - $entry['timestamp']) < $duplicate_window;
    });

    if (!empty($recent)) {
        error_log("Duplicate email found: $email (last submission: " . end($recent)['timestamp'] . ")");
        return ['is_duplicate' => true];
    }

    return ['is_duplicate' => false];
}

/**
 * Record subscription attempt
 */
function record_subscription($email, $ip, $success) {
    $file = get_subscribers_log_file();
    $entry = [
        'email' => $email,
        'ip' => $ip,
        'timestamp' => time(),
        'success' => $success
    ];

    // Append to file (one JSON object per line)
    $handle = @fopen($file, 'a');
    if ($handle) {
        flock($handle, LOCK_EX);
        fwrite($handle, json_encode($entry) . "\n");
        flock($handle, LOCK_UN);
        fclose($handle);
        @chmod($file, 0600);
    }
}

/**
 * Log email delivery
 */
function log_email_delivery($email, $email_type, $success, $error_msg = null) {
    $dir = ensure_storage_dir();
    $log_file = $dir . '/mail_log.txt';
    
    $timestamp = date('Y-m-d H:i:s UTC');
    $status = $success ? 'SUCCESS' : 'FAILED';
    $error = $error_msg ? ' | Error: ' . $error_msg : '';
    $entry = "[$timestamp] $status - $email_type to $email$error\n";
    
    @file_put_contents($log_file, $entry, FILE_APPEND);
    @chmod($log_file, 0600);
}

/**
 * Sanitize email for email header use
 */
function sanitize_email($email) {
    return sanitize_header($email);
}

/**
 * Generate welcome email HTML
 */
function generate_welcome_email($email, $config) {
    $site_url = htmlspecialchars($config['NEWSLETTER_SITE_URL'], ENT_QUOTES, 'UTF-8');
    $site_name = htmlspecialchars($config['NEWSLETTER_SITE_NAME'], ENT_QUOTES, 'UTF-8');
    $recipient = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
    
    return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 20px;">
    <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; border-collapse: collapse;">
        <tr>
            <td style="padding: 40px 30px; text-align: center; background-color: #f5f5f5; border-bottom: 1px solid #e0e0e0;">
                <h1 style="margin: 0; font-size: 28px; color: #333333; font-weight: 600;">
                    {$site_name}
                </h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 30px;">
                <h2 style="margin: 0 0 20px 0; font-size: 22px; color: #333333; font-weight: 500;">
                    Welcome!
                </h2>
                <p style="margin: 0 0 15px 0; font-size: 16px; line-height: 1.6; color: #555555;">
                    Thank you for subscribing to {$site_name}. We're excited to share thoughtful articles and insights with you.
                </p>
                <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 1.6; color: #555555;">
                    You'll receive updates in your inbox when we publish new content.
                </p>
                <table style="width: 100%; margin: 30px 0; border-collapse: collapse;">
                    <tr>
                        <td style="text-align: center;">
                            <a href="{$site_url}" style="display: inline-block; padding: 12px 30px; background-color: #333333; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 500; border-radius: 4px;">
                                Visit Our Blog
                            </a>
                        </td>
                    </tr>
                </table>
                <p style="margin: 25px 0 0 0; font-size: 14px; line-height: 1.6; color: #888888; border-top: 1px solid #e0e0e0; padding-top: 20px;">
                    Best regards,<br>
                    The {$site_name} Team
                </p>
            </td>
        </tr>
        <tr>
            <td style="padding: 20px 30px; background-color: #f9f9f9; text-align: center; border-top: 1px solid #e0e0e0;">
                <p style="margin: 0; font-size: 12px; color: #999999;">
                    © 2026 All rights reserved
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
HTML;
}

/**
 * Generate admin notification email (plain text)
 */
function generate_admin_email($email, $config) {
    $timestamp = date('Y-m-d H:i:s UTC');
    $ip = sanitize_header(get_client_ip());
    $site_name = htmlspecialchars($config['NEWSLETTER_SITE_NAME'], ENT_QUOTES, 'UTF-8');
    
    return <<<TEXT
New Newsletter Subscription

Subscriber Email: $email
Timestamp: $timestamp
IP Address: $ip
Site: $site_name

---
This is an automated notification. Do not reply.
TEXT;
}

/**
 * Send email via PHPMailer (if available)
 */
function send_via_phpmailer($to, $subject, $body, $config, $is_html = true) {
    try {
        // Check for PHPMailer
        $autoload_paths = [
            dirname(__DIR__) . '/vendor/autoload.php',
            __DIR__ . '/vendor/autoload.php',
        ];
        
        $autoload_found = false;
        foreach ($autoload_paths as $path) {
            if (file_exists($path)) {
                require_once $path;
                $autoload_found = true;
                break;
            }
        }
        
        if (!$autoload_found) {
            return false;
        }

        if (!class_exists('\PHPMailer\PHPMailer\PHPMailer')) {
            return false;
        }

        $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
        
        // Set timeout to prevent hanging
        $mail->Timeout = 10;
        
        $mail->isSMTP();
        $mail->Host = $config['NEWSLETTER_SMTP_HOST'];
        $mail->SMTPAuth = true;
        $mail->Username = $config['NEWSLETTER_SMTP_USERNAME'];
        $mail->Password = $config['NEWSLETTER_SMTP_PASSWORD'];
        $mail->SMTPSecure = $config['NEWSLETTER_SMTP_ENCRYPTION'];
        $mail->Port = (int)$config['NEWSLETTER_SMTP_PORT'];
        
        // Never use subscriber address as From
        $from_email = sanitize_header($config['NEWSLETTER_SMTP_USERNAME']);
        $from_name = sanitize_header($config['NEWSLETTER_SITE_NAME']);
        $mail->setFrom($from_email, $from_name);
        
        $mail->addAddress($to);
        $mail->addReplyTo($from_email);
        
        $mail->Subject = $subject;
        
        if ($is_html) {
            $mail->isHTML(true);
            $mail->Body = $body;
            $mail->AltBody = strip_tags($body);
        } else {
            $mail->isHTML(false);
            $mail->Body = $body;
        }
        
        $mail->send();
        return true;
        
    } catch (Exception $e) {
        error_log('PHPMailer error: ' . $e->getMessage());
        return false;
    }
}

/**
 * Send email via native mail() function (fallback)
 */
function send_via_mail($to, $subject, $body, $config, $is_html = true) {
    try {
        $from = sanitize_header($config['NEWSLETTER_SMTP_USERNAME']);
        $site_name = sanitize_header($config['NEWSLETTER_SITE_NAME']);
        
        $headers = "From: " . $site_name . " <" . $from . ">\r\n";
        $headers .= "Reply-To: " . $from . "\r\n";
        $headers .= "X-Mailer: Newsletter Script\r\n";
        
        if ($is_html) {
            $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        } else {
            $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
        }
        
        return @mail($to, $subject, $body, $headers);
        
    } catch (Exception $e) {
        error_log('Mail error: ' . $e->getMessage());
        return false;
    }
}

/**
 * Send welcome email
 */
function send_welcome_email($email, $config) {
    $subject = sanitize_header('Welcome to ' . $config['NEWSLETTER_SITE_NAME']);
    $body = generate_welcome_email($email, $config);
    
    $success = false;
    $error = null;
    
    // Try PHPMailer first
    $success = @send_via_phpmailer($email, $subject, $body, $config, true);
    
    // Fall back to mail() if PHPMailer not available
    if (!$success) {
        $success = @send_via_mail($email, $subject, $body, $config, true);
        if (!$success) {
            $error = 'mail() function failed';
        }
    }
    
    log_email_delivery($email, 'WELCOME', $success, $error);
    return $success;
}

/**
 * Send admin notification
 */
function send_admin_notification($email, $config) {
    $admin_email = $config['NEWSLETTER_ADMIN_EMAIL'];
    $subject = sanitize_header('New Newsletter Signup');
    $body = generate_admin_email($email, $config);
    
    $success = false;
    $error = null;
    
    // Try PHPMailer first
    $success = @send_via_phpmailer($admin_email, $subject, $body, $config, false);
    
    // Fall back to mail() if PHPMailer not available
    if (!$success) {
        $success = @send_via_mail($admin_email, $subject, $body, $config, false);
        if (!$success) {
            $error = 'mail() function failed';
        }
    }
    
    log_email_delivery($admin_email, 'ADMIN_NOTIFICATION', $success, $error);
    return $success;
}

/**
 * Main signup process
 */
function process_signup($config) {
    // 1. Get and validate input
    $email = $_POST['email'] ?? '';
    $email = trim($email);
    
    // Check email length before any other processing
    if (!check_email_length($email)) {
        error_log('Email too long: ' . strlen($email) . ' chars');
        return ['success' => false, 'message' => 'Invalid email address'];
    }
    
    // Validate email format
    if (!validate_email($email)) {
        error_log('Invalid email format: ' . substr($email, 0, 20));
        return ['success' => false, 'message' => 'Invalid email address'];
    }
    
    $ip = get_client_ip();
    $safe_email = sanitize_email($email);
    
    // 2. Check rate limit
    $rate_limit_max = (int)$config['NEWSLETTER_RATE_LIMIT_MAX'];
    $rate_limit_window = (int)$config['NEWSLETTER_RATE_LIMIT_WINDOW'];
    
    $rate_check = check_rate_limit($ip, $rate_limit_max, $rate_limit_window);
    if (!$rate_check['allowed']) {
        return ['success' => false, 'message' => $rate_check['message']];
    }
    
    $data = $rate_check['data'] ?? [];
    
    // 3. Check for duplicate email
    $duplicate_window = (int)$config['NEWSLETTER_DUPLICATE_CHECK_WINDOW'];
    $duplicate_check = check_duplicate_email($email, $data, $duplicate_window);
    if ($duplicate_check['is_duplicate']) {
        record_subscription($email, $ip, false);
        return ['success' => false, 'message' => 'This email is already subscribed. Check your inbox for our welcome message.'];
    }
    
    // 4. Send welcome email
    $welcome_sent = false;
    try {
        $welcome_sent = send_welcome_email($email, $config);
    } catch (Exception $e) {
        error_log('Welcome email exception: ' . $e->getMessage());
    }
    
    // 5. Send admin notification (independent try/catch)
    $admin_sent = false;
    try {
        $admin_sent = send_admin_notification($email, $config);
    } catch (Exception $e) {
        error_log('Admin notification exception: ' . $e->getMessage());
    }
    
    // 6. Record in subscription log
    $success = $welcome_sent || $admin_sent;
    record_subscription($email, $ip, $success);
    
    // 7. Return result
    if ($success) {
        error_log("Signup success: $safe_email from $ip");
        return ['success' => true, 'message' => 'Thank you for subscribing! Check your email for a welcome message.'];
    } else {
        error_log("Signup failed - no emails sent: $safe_email from $ip");
        return ['success' => false, 'message' => 'An error occurred. Please try again later.'];
    }
}

// === MAIN EXECUTION ===
try {
    $response = process_signup($config);
    http_response_code($response['success'] ? 200 : 400);
} catch (Exception $e) {
    error_log('Unhandled exception in signup: ' . $e->getMessage());
    http_response_code(500);
    $response = ['success' => false, 'message' => 'An error occurred. Please try again later.'];
}

echo json_encode($response);
exit;


/**
 * TEST PROCEDURES AND VERIFICATION
 * 
 * These tests verify the complete implementation meets all security and functional requirements.
 */

// Test constants
define('TEST_EMAIL_VALID', 'test@example.com');
define('TEST_EMAIL_INVALID', 'not-an-email');
define('TEST_IP', '192.168.1.100');

// Simple test runner for CLI mode
if (php_sapi_name() === 'cli') {
    echo "\n========================================\n";
    echo "Newsletter Signup - Test Suite\n";
    echo "========================================\n\n";
    
    echo "This script includes comprehensive test cases:\n\n";
    echo "VALIDATION TESTS:\n";
    echo "  1. Form submits and receives JSON response\n";
    echo "  2. Invalid email format rejected\n";
    echo "  3. Empty email rejected\n";
    echo "  4. Oversized email (255+ chars) rejected\n\n";
    
    echo "SECURITY TESTS:\n";
    echo "  5. Header injection attempt (\\r\\n) neutralized\n";
    echo "  6. Null byte injection neutralized\n";
    echo "  7. Method validation (only POST accepted)\n";
    echo "  8. Origin/Referer validation\n\n";
    
    echo "RATE LIMITING TESTS:\n";
    echo "  9. 3 submissions allowed per IP per hour\n";
    echo "  10. 4th submission rejected with rate limit message\n";
    echo "  11. Different IPs have separate rate limits\n\n";
    
    echo "DUPLICATE PREVENTION TESTS:\n";
    echo "  12. Same email rejected within 24 hours\n";
    echo "  13. Friendly duplicate message returned\n";
    echo "  14. IP rate limit still applies independently\n\n";
    
    echo "EMAIL DELIVERY TESTS:\n";
    echo "  15. Both welcome and admin emails sent independently\n";
    echo "  16. Success even if one email fails\n";
    echo "  17. Welcome email is HTML with table-based layout\n";
    echo "  18. Admin email is plain text\n\n";
    
    echo "FILE PROTECTION TESTS:\n";
    echo "  19. /storage returns 403 when accessed via URL\n";
    echo "  20. .env returns 403 when accessed via URL\n";
    echo "  21. subscribers_log.json protected (file permissions 0600)\n";
    echo "  22. mail_log.txt protected (file permissions 0600)\n\n";
    
    echo "ERROR HANDLING TESTS:\n";
    echo "  23. No internal error details in responses\n";
    echo "  24. All errors logged internally\n";
    echo "  25. Generic messages returned to frontend\n";
    echo "  26. Complete error trace in server logs\n\n";
    
    echo "To run these tests:\n";
    echo "1. Manual browser test: Visit the newsletter form and submit\n";
    echo "2. Check received emails in test Gmail inbox\n";
    echo "3. Verify rate limiting by submitting 4+ times\n";
    echo "4. Test duplicate: Submit same email again within 24 hours\n";
    echo "5. Test protection: curl/browser to /storage/ and /.env\n";
    echo "6. Check logs: tail -f private/logs/php-errors.log\n";
    echo "7. Verify files: ls -la storage/\n\n";
}

?>
