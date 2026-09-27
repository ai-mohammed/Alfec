<?php
/**
 * Server configuration for the alfec.net enquiry form.
 *
 * Copy this file to `alfec-config.php` in the directory ABOVE the web root (next to the folder that
 * contains index.html), or point the ALFEC_CONFIG environment variable at it. Never commit the real file
 * and never place it inside the web root.
 */

return [
    // Where enquiries are delivered, and who they appear to come from (use a mailbox on alfec.net).
    'recipient' => 'contact@alfec.net',
    'from_email' => 'contact@alfec.net',
    'from_name' => 'Site alfec.net',

    // 'smtp' (recommended) or 'mail' (PHP mail(), relies on the host's mail setup).
    'transport' => 'smtp',
    'smtp' => [
        'host' => 'smtp.example.net',
        'port' => 587,
        'secure' => 'tls', // 'tls' (STARTTLS, port 587), 'ssl' (port 465) or 'none'
        'username' => 'contact@alfec.net',
        'password' => '',
        'timeout' => 15,
    ],

    // Random secret of at least 32 characters, e.g. the output of: php -r "echo bin2hex(random_bytes(32));"
    'secret' => 'CHANGE-ME',

    // Pages allowed to post the form.
    'allowed_origins' => ['https://alfec.net', 'https://www.alfec.net'],

    // At most `max` successful enquiries per visitor IP within `window` seconds.
    'rate_limit' => ['max' => 5, 'window' => 600],

    // Directory for the rate-limit counters (outside the web root). null = the system temp directory.
    'storage_dir' => null,

    // Attachment size limit in bytes. PHP's upload_max_filesize and post_max_size must be at least this.
    'max_upload_bytes' => 10 * 1024 * 1024,

    // Submissions faster than this after the page loaded are treated as automated.
    'min_fill_seconds' => 3,
];
