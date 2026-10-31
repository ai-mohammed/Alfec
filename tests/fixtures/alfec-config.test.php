<?php
// Test-only configuration for docker-compose.test.yml. Not a production secret.
return [
    'recipient' => 'contact@alfec.test',
    'from_email' => 'site@alfec.test',
    'from_name' => 'Site alfec.net (test)',
    'transport' => 'smtp',
    'smtp' => ['host' => getenv('TEST_SMTP_HOST') ?: 'mailpit', 'port' => (int) (getenv('TEST_SMTP_PORT') ?: 1025), 'secure' => 'none', 'username' => '', 'password' => '', 'timeout' => 10],
    'secret' => 'test-secret-0123456789abcdef0123456789abcdef',
    'allowed_origins' => ['http://127.0.0.1:8080', 'http://localhost:8080'],
    'rate_limit' => ['max' => 40, 'window' => 600],
    'storage_dir' => getenv('TEST_STORAGE_DIR') ?: sys_get_temp_dir() . '/alfec-contact-test',
    'max_upload_bytes' => 10 * 1024 * 1024,
    'min_fill_seconds' => 1,
];
