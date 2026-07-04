<?php
/**
 * Configuration Loader
 * 
 * Safely loads and validates configuration from .env file.
 * Fails loudly to logs if required keys are missing or empty.
 * Exposes values through a config array rather than getenv().
 */

class ConfigLoader {
    private $config = [];
    private $required_keys = [
        'NEWSLETTER_ADMIN_EMAIL',
        'NEWSLETTER_SITE_NAME',
        'NEWSLETTER_SITE_URL',
        'NEWSLETTER_SMTP_HOST',
        'NEWSLETTER_SMTP_PORT',
        'NEWSLETTER_SMTP_USERNAME',
        'NEWSLETTER_SMTP_PASSWORD',
    ];

    public function __construct($env_file_path = null) {
        if ($env_file_path === null) {
            // Try multiple possible locations
            $possible_paths = [
                dirname(__DIR__) . '/.env',  // Parent of public/
                dirname(__DIR__) . '/private/config/.env',
                __DIR__ . '/.env',
            ];
            
            foreach ($possible_paths as $path) {
                if (file_exists($path)) {
                    $env_file_path = $path;
                    break;
                }
            }
        }

        // Load the .env file if it exists
        if ($env_file_path && file_exists($env_file_path)) {
            $this->load_env_file($env_file_path);
        }

        // Apply defaults
        $this->apply_defaults();

        // Validate required fields
        $this->validate_required();

        // Validate specific formats
        $this->validate_formats();
    }

    /**
     * Load and parse .env file
     */
    private function load_env_file($file_path) {
        $lines = file($file_path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        if ($lines === false) {
            error_log('Failed to read .env file: ' . $file_path);
            return;
        }

        foreach ($lines as $line) {
            // Skip comments
            if (strpos(trim($line), '#') === 0) {
                continue;
            }

            // Parse key=value
            if (strpos($line, '=') === false) {
                continue;
            }

            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);

            // Remove quotes if present
            if ((strpos($value, '"') === 0 && strrpos($value, '"') === strlen($value) - 1) ||
                (strpos($value, "'") === 0 && strrpos($value, "'") === strlen($value) - 1)) {
                $value = substr($value, 1, -1);
            }

            if (!empty($key)) {
                $this->config[$key] = $value;
            }
        }
    }

    /**
     * Apply default values for optional keys
     */
    private function apply_defaults() {
        $defaults = [
            'NEWSLETTER_SMTP_PORT' => '587',
            'NEWSLETTER_SMTP_ENCRYPTION' => 'tls',
            'NEWSLETTER_RATE_LIMIT_MAX' => '3',
            'NEWSLETTER_RATE_LIMIT_WINDOW' => '3600', // 1 hour
            'NEWSLETTER_DUPLICATE_CHECK_WINDOW' => '86400', // 24 hours
        ];

        foreach ($defaults as $key => $value) {
            if (!isset($this->config[$key]) || empty($this->config[$key])) {
                $this->config[$key] = $value;
            }
        }
    }

    /**
     * Validate that required keys are present and not empty
     */
    private function validate_required() {
        $missing = [];
        $empty = [];

        foreach ($this->required_keys as $key) {
            if (!isset($this->config[$key])) {
                $missing[] = $key;
            } elseif (empty(trim($this->config[$key]))) {
                $empty[] = $key;
            }
        }

        if (!empty($missing)) {
            $msg = 'Missing required configuration keys: ' . implode(', ', $missing);
            error_log($msg);
            throw new RuntimeException($msg);
        }

        if (!empty($empty)) {
            $msg = 'Empty required configuration values: ' . implode(', ', $empty);
            error_log($msg);
            throw new RuntimeException($msg);
        }
    }

    /**
     * Validate specific configuration formats
     */
    private function validate_formats() {
        // Validate URL format
        $url = $this->config['NEWSLETTER_SITE_URL'] ?? '';
        if (!$this->is_valid_url($url)) {
            $msg = 'Invalid NEWSLETTER_SITE_URL format: ' . $url;
            error_log($msg);
            throw new RuntimeException($msg);
        }

        // Validate email format
        $email = $this->config['NEWSLETTER_ADMIN_EMAIL'] ?? '';
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $msg = 'Invalid NEWSLETTER_ADMIN_EMAIL format: ' . $email;
            error_log($msg);
            throw new RuntimeException($msg);
        }

        // Validate SMTP port is numeric
        $port = $this->config['NEWSLETTER_SMTP_PORT'] ?? '';
        if (!is_numeric($port) || $port < 1 || $port > 65535) {
            $msg = 'Invalid NEWSLETTER_SMTP_PORT: ' . $port;
            error_log($msg);
            throw new RuntimeException($msg);
        }
    }

    /**
     * Check if URL is well-formed
     */
    private function is_valid_url($url) {
        // Must be HTTPS or HTTP
        return filter_var($url, FILTER_VALIDATE_URL) && 
               (strpos($url, 'https://') === 0 || strpos($url, 'http://') === 0);
    }

    /**
     * Get configuration value
     */
    public function get($key, $default = null) {
        return $this->config[$key] ?? $default;
    }

    /**
     * Get all configuration as array
     */
    public function all() {
        return $this->config;
    }

    /**
     * Check if configuration key exists and is not empty
     */
    public function has($key) {
        return isset($this->config[$key]) && !empty($this->config[$key]);
    }
}
