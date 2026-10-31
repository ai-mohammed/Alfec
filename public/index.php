<?php
/**
 * Legacy entry point of the previous alfec.net (a single PHP page).
 * Indexed URLs keep resolving:
 *   /index.php?lg=fr and /index.php → 301 /       (French home)
 *   /index.php?lg=en                → 301 /en/
 *   /index.php?msg=success[_en]     → 303 to the new confirmation pages (old form redirect target)
 *   /index.php?msg=…                → 303 to the contact page
 * When the server resolves "/" to index.php instead of index.html, the French home is served directly.
 */

declare(strict_types=1);

header('X-Content-Type-Options: nosniff');

$path = (string) parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH);
$lg = isset($_GET['lg']) ? (string) $_GET['lg'] : null;
$msg = isset($_GET['msg']) ? (string) $_GET['msg'] : null;

$go = static function (string $to, int $status): void {
    header('Location: ' . $to, true, $status);
    exit;
};

if ($msg !== null) {
    if ($msg === 'success_en') {
        $go('/en/contact/thank-you/', 303);
    }
    if ($msg === 'success') {
        $go($lg === 'en' ? '/en/contact/thank-you/' : '/contact/merci/', 303);
    }
    $go($lg === 'en' ? '/en/contact/' : '/contact/', 303);
}

if ($lg === 'en') {
    $go('/en/', 301);
}

if ($lg !== null || str_ends_with($path, '/index.php')) {
    $go('/', 301);
}

header('Content-Type: text/html; charset=utf-8');
readfile(__DIR__ . '/index.html');
