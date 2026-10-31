<?php
/**
 * Router for PHP's built-in server during tests (`php -S 127.0.0.1:8080 -t dist tests/support/router.php`).
 * Mirrors the production web-server rules in docs/deploy.md: library folder denied, directory index,
 * PHP scripts executed, everything else static, unknown paths answered by the site's 404 page.
 */

declare(strict_types=1);

$root = rtrim((string) $_SERVER['DOCUMENT_ROOT'], '/\\');
$path = rawurldecode((string) parse_url((string) $_SERVER['REQUEST_URI'], PHP_URL_PATH));

if (str_starts_with($path, '/contact/lib')) {
    http_response_code(403);
    echo 'Forbidden';
    return true;
}

$file = realpath($root . $path);
if ($file !== false && str_starts_with($file, realpath($root)) && is_file($file)) {
    if (str_ends_with($file, '.php')) {
        $_SERVER['SCRIPT_NAME'] = $path;
        $_SERVER['SCRIPT_FILENAME'] = $file;
        chdir(dirname($file));
        require $file;
        return true;
    }
    return false; // static file: let the built-in server send it with the right MIME type
}

if ($file !== false && is_dir($file)) {
    if (!str_ends_with($path, '/')) {
        header('Location: ' . $path . '/', true, 301);
        return true;
    }
    if (is_file($file . '/index.html')) {
        header('Content-Type: text/html; charset=utf-8');
        readfile($file . '/index.html');
        return true;
    }
}

http_response_code(404);
header('Content-Type: text/html; charset=utf-8');
readfile($root . '/404.html');
return true;
