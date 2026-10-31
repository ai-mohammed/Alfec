<?php
/**
 * Shared helpers for the alfec.net enquiry endpoint (send.php, token.php).
 * No secrets live here: they come from alfec-config.php, kept outside the web root (see deploy/).
 */

declare(strict_types=1);

namespace Alfec\Contact;

const TRADES = ['climatique', 'incendie', 'desenfumage', 'electricite', 'froid', 'industriel'];
const ROLES = ['maitre_oeuvre', 'bureau_etudes', 'maitre_ouvrage', 'entreprise_generale', 'collectivite', 'autre'];
const ACTIVITIES = ['batiment', 'hotellerie', 'industrie', 'agroalimentaire', 'sante', 'autre'];
const WORKS = ['travaux_neufs', 'maintenance', 'autre'];

/** Load the server-side configuration. Returns null when it is missing or incomplete. */
function config(): ?array
{
    static $config = false;
    if ($config !== false) {
        return $config;
    }
    $candidates = array_filter([
        getenv('ALFEC_CONFIG') ?: null,
        isset($_SERVER['DOCUMENT_ROOT']) ? dirname((string) $_SERVER['DOCUMENT_ROOT']) . '/alfec-config.php' : null,
        dirname(__DIR__, 3) . '/alfec-config.php',
    ]);
    $config = null;
    foreach ($candidates as $file) {
        if (is_file($file) && is_readable($file)) {
            $loaded = require $file;
            if (is_array($loaded)) {
                $config = $loaded + defaults();
            }
            break;
        }
    }
    if ($config !== null && (strlen((string) $config['secret']) < 32 || str_contains((string) $config['secret'], 'CHANGE-ME'))) {
        error_log('[alfec-contact] alfec-config.php: "secret" must be a random string of at least 32 characters');
        $config = null;
    }
    return $config;
}

function defaults(): array
{
    return [
        'recipient' => 'contact@alfec.net',
        'from_email' => 'contact@alfec.net',
        'from_name' => 'alfec.net',
        'transport' => 'mail',
        'smtp' => ['host' => '', 'port' => 587, 'secure' => 'tls', 'username' => '', 'password' => '', 'timeout' => 15],
        'secret' => '',
        'allowed_origins' => ['https://alfec.net', 'https://www.alfec.net'],
        'rate_limit' => ['max' => 5, 'window' => 600],
        'storage_dir' => null,
        'max_upload_bytes' => 10 * 1024 * 1024,
        'min_fill_seconds' => 3,
    ];
}

/** Response headers every endpoint response carries. */
function baseHeaders(): void
{
    header('X-Content-Type-Options: nosniff');
    header('Cache-Control: no-store');
    header('Referrer-Policy: same-origin');
}

function json(int $status, array $body): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function redirect(string $path): void
{
    http_response_code(303);
    header('Location: ' . $path);
    exit;
}

/** HMAC-signed issue time: proves the form was loaded before being sent, and how long ago. */
function issueToken(string $secret, ?int $now = null): string
{
    $ts = (string) ($now ?? time());
    return $ts . '.' . hash_hmac('sha256', 'alfec-contact|' . $ts, $secret);
}

/** @return int|null seconds since issue, or null when the token is malformed or forged */
function tokenAge(string $token, string $secret, ?int $now = null): ?int
{
    if (!preg_match('/^(\d{9,11})\.([a-f0-9]{64})$/', $token, $m)) {
        return null;
    }
    $expected = hash_hmac('sha256', 'alfec-contact|' . $m[1], $secret);
    if (!hash_equals($expected, $m[2])) {
        return null;
    }
    return ($now ?? time()) - (int) $m[1];
}

/** True when the request comes from one of the allowed origins, or carries no origin information at all. */
function originAllowed(array $allowed): bool
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin !== '') {
        return in_array(rtrim($origin, '/'), $allowed, true);
    }
    $referer = $_SERVER['HTTP_REFERER'] ?? '';
    if ($referer !== '') {
        $parts = parse_url($referer);
        if (!is_array($parts) || !isset($parts['scheme'], $parts['host'])) {
            return false;
        }
        $refOrigin = $parts['scheme'] . '://' . $parts['host'] . (isset($parts['port']) ? ':' . $parts['port'] : '');
        return in_array($refOrigin, $allowed, true);
    }
    return true;
}

/**
 * Sliding-window rate limit per client IP. The IP is only stored as a salted hash.
 * @param bool $record add a hit (after a successful send) instead of only checking
 */
function rateLimited(array $config, bool $record): bool
{
    $dir = $config['storage_dir'] ?: sys_get_temp_dir() . '/alfec-contact';
    if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) {
        error_log('[alfec-contact] rate-limit storage unavailable');
        return false;
    }
    $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $file = $dir . '/' . hash_hmac('sha256', $ip, (string) $config['secret']) . '.json';
    $window = (int) $config['rate_limit']['window'];
    $max = (int) $config['rate_limit']['max'];
    $now = time();

    $fh = @fopen($file, 'c+');
    if ($fh === false) {
        return false;
    }
    flock($fh, LOCK_EX);
    $hits = json_decode((string) stream_get_contents($fh), true);
    $hits = array_values(array_filter(is_array($hits) ? $hits : [], static fn ($t) => is_int($t) && $t > $now - $window));
    $limited = count($hits) >= $max;
    if ($record && !$limited) {
        $hits[] = $now;
    }
    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, json_encode($hits));
    flock($fh, LOCK_UN);
    fclose($fh);
    return $limited;
}

/** Trim, drop control characters (keeping newlines where allowed) and normalise whitespace. */
function clean(mixed $value, bool $multiline = false): string
{
    if (!is_string($value)) {
        return '';
    }
    $value = str_replace(["\r\n", "\r"], "\n", $value);
    if (!$multiline) {
        $value = preg_replace('/[\n\t]+/', ' ', $value) ?? '';
    }
    $value = preg_replace($multiline ? '/[^\P{C}\n\t]/u' : '/\p{C}/u', '', $value) ?? '';
    if (!$multiline) {
        $value = preg_replace('/\s+/u', ' ', $value) ?? '';
    }
    return trim($value);
}

function length(string $value): int
{
    return mb_strlen($value, 'UTF-8');
}

/**
 * Validate the enquiry. Returns [cleanData, errors] where errors maps a field name to an error code
 * the page translates (required, choose, email, tel, tooShort, tooLong, fileType, fileSize).
 */
function validate(array $post): array
{
    $d = [];
    $e = [];

    $text = static function (string $name, bool $required, int $max) use ($post, &$d, &$e): void {
        $v = clean($post[$name] ?? '');
        $d[$name] = $v;
        if ($v === '') {
            if ($required) {
                $e[$name] = 'required';
            }
        } elseif (length($v) > $max) {
            $e[$name] = 'tooLong';
        }
    };
    $choice = static function (string $name, array $allowed, bool $required) use ($post, &$d, &$e): void {
        $v = clean($post[$name] ?? '');
        $d[$name] = in_array($v, $allowed, true) ? $v : '';
        if ($d[$name] === '' && ($required || $v !== '')) {
            $e[$name] = 'choose';
        }
    };

    $text('nom', true, 120);
    $text('organisme', false, 160);
    $choice('role', ROLES, true);
    $text('role_autre', ($d['role'] ?? '') === 'autre', 120);

    $email = clean($post['email'] ?? '');
    $d['email'] = $email;
    if ($email === '') {
        $e['email'] = 'required';
    } elseif (length($email) > 254 || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
        $e['email'] = 'email';
    }

    $tel = clean($post['tel'] ?? '');
    $d['tel'] = $tel;
    if ($tel === '') {
        $e['tel'] = 'required';
    } elseif (!preg_match('/^[0-9+().\s-]{6,30}$/', $tel) || preg_match_all('/\d/', $tel) < 6) {
        $e['tel'] = 'tel';
    }

    $text('ville', false, 120);
    $pays = strtoupper(clean($post['pays'] ?? ''));
    $d['pays'] = preg_match('/^[A-Z]{2}$/', $pays) ? $pays : '';
    if ($pays !== '' && $d['pays'] === '') {
        $e['pays'] = 'choose';
    }

    $choice('metier', TRADES, false);
    $choice('activite', ACTIVITIES, true);
    $text('activite_autre', ($d['activite'] ?? '') === 'autre', 120);
    $choice('travaux', WORKS, true);
    $text('travaux_autre', ($d['travaux'] ?? '') === 'autre', 120);

    $message = clean($post['message'] ?? '', true);
    $d['message'] = $message;
    if ($message === '') {
        $e['message'] = 'required';
    } elseif (length($message) < 10) {
        $e['message'] = 'tooShort';
    } elseif (length($message) > 5000) {
        $e['message'] = 'tooLong';
    }

    return [$d, $e];
}

/**
 * Validate the optional attachment. Returns [attachment|null, errorCode|null].
 * The file is attached to the e-mail straight from PHP's temporary upload and never stored.
 */
function attachment(array $files, int $maxBytes): array
{
    $f = $files['piece'] ?? null;
    if (!is_array($f) || ($f['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
        return [null, null];
    }
    if (is_array($f['error'])) {
        return [null, 'fileType'];
    }
    if (in_array($f['error'], [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true)) {
        return [null, 'fileSize'];
    }
    if ($f['error'] !== UPLOAD_ERR_OK || !is_uploaded_file((string) $f['tmp_name'])) {
        return [null, 'fileType'];
    }
    $size = (int) $f['size'];
    if ($size <= 0 || $size > $maxBytes || filesize((string) $f['tmp_name']) > $maxBytes) {
        return [null, $size <= 0 ? 'fileType' : 'fileSize'];
    }

    $ext = strtolower(pathinfo((string) $f['name'], PATHINFO_EXTENSION));
    $allowed = [
        'pdf' => ['application/pdf'],
        'jpg' => ['image/jpeg'],
        'jpeg' => ['image/jpeg'],
        'png' => ['image/png'],
        'docx' => ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip'],
        'xlsx' => ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip'],
    ];
    if (!isset($allowed[$ext])) {
        return [null, 'fileType'];
    }
    $mime = (new \finfo(FILEINFO_MIME_TYPE))->file((string) $f['tmp_name']) ?: '';
    if (!in_array($mime, $allowed[$ext], true)) {
        return [null, 'fileType'];
    }
    if (in_array($ext, ['jpg', 'jpeg', 'png'], true) && @getimagesize((string) $f['tmp_name']) === false) {
        return [null, 'fileType'];
    }
    if (in_array($ext, ['docx', 'xlsx'], true) && !isOfficeZip((string) $f['tmp_name'], $ext)) {
        return [null, 'fileType'];
    }

    return [[
        'path' => (string) $f['tmp_name'],
        'name' => safeFilename((string) $f['name'], $ext),
        'mime' => $mime === 'application/zip' ? $allowed[$ext][0] : $mime,
    ], null];
}

function isOfficeZip(string $path, string $ext): bool
{
    if (!class_exists(\ZipArchive::class)) {
        return true; // extension, size and MIME already checked; cannot inspect further here
    }
    $zip = new \ZipArchive();
    if ($zip->open($path, \ZipArchive::RDONLY) !== true) {
        return false;
    }
    $ok = $zip->locateName('[Content_Types].xml') !== false
        && $zip->locateName($ext === 'docx' ? 'word/document.xml' : 'xl/workbook.xml') !== false;
    $zip->close();
    return $ok;
}

/** ASCII, no path, no leading dots, limited length, extension forced from the validated one. */
function safeFilename(string $original, string $ext): string
{
    $base = pathinfo(basename(str_replace('\\', '/', $original)), PATHINFO_FILENAME);
    $translit = class_exists(\Transliterator::class) ? \Transliterator::create('Any-Latin; Latin-ASCII') : null;
    if ($translit !== null) {
        $converted = $translit->transliterate($base);
        $base = is_string($converted) ? $converted : $base;
    } elseif (function_exists('iconv')) {
        $converted = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $base);
        $base = $converted !== false ? $converted : $base;
    }
    $base = preg_replace('/[^A-Za-z0-9._-]+/', '-', $base) ?? '';
    $base = trim(preg_replace('/-{2,}/', '-', $base) ?? '', '.-_');
    $base = substr($base, 0, 80);
    return ($base !== '' ? $base : 'piece-jointe') . '.' . ($ext === 'jpeg' ? 'jpg' : $ext);
}

/** Single-line value safe for a mail header. */
function headerSafe(string $value, int $max = 120): string
{
    $value = preg_replace('/[\r\n\t]+/', ' ', $value) ?? '';
    return mb_substr(trim($value), 0, $max, 'UTF-8');
}

function countryName(string $code): string
{
    if (class_exists(\Locale::class)) {
        $name = \Locale::getDisplayRegion('-' . $code, 'fr');
        if (is_string($name) && $name !== '' && $name !== $code) {
            return $name . ' (' . $code . ')';
        }
    }
    return $code;
}

/** Plain-text body for ALFEC's team, in French. */
function mailBody(array $d, string $lang, ?array $file): string
{
    $labels = [
        'role' => ['maitre_oeuvre' => 'Maître d’œuvre', 'bureau_etudes' => 'Bureau d’études', 'maitre_ouvrage' => 'Maître d’ouvrage', 'entreprise_generale' => 'Société générale de bâtiment', 'collectivite' => 'Collectivité locale', 'autre' => 'Autre'],
        'activite' => ['batiment' => 'Bâtiment', 'hotellerie' => 'Hôtellerie', 'industrie' => 'Industrie', 'agroalimentaire' => 'Agroalimentaire', 'sante' => 'Santé', 'autre' => 'Autre'],
        'travaux' => ['travaux_neufs' => 'Travaux neufs', 'maintenance' => 'Maintenance', 'autre' => 'Autre'],
        'metier' => ['climatique' => 'Génie climatique', 'incendie' => 'Protection & détection incendie', 'desenfumage' => 'Désenfumage', 'electricite' => 'Électricité & régulation', 'froid' => 'Froid industriel', 'industriel' => 'Génie industriel'],
    ];
    $pick = static fn (string $group, string $key, string $other = ''): string => $key === 'autre' && $other !== ''
        ? 'Autre : ' . $other
        : ($labels[$group][$key] ?? '—');

    $rows = [
        'Nom et prénom' => $d['nom'],
        'Organisme' => $d['organisme'] !== '' ? $d['organisme'] : '—',
        'Vous êtes' => $pick('role', $d['role'], $d['role_autre']),
        'E-mail' => $d['email'],
        'Téléphone' => $d['tel'],
        'Ville' => $d['ville'] !== '' ? $d['ville'] : '—',
        'Pays' => $d['pays'] !== '' ? countryName($d['pays']) : '—',
        'Métier concerné' => $d['metier'] !== '' ? $pick('metier', $d['metier']) : 'Non précisé',
        'Secteur d’activité' => $pick('activite', $d['activite'], $d['activite_autre']),
        'Nature des travaux' => $pick('travaux', $d['travaux'], $d['travaux_autre']),
        'Pièce jointe' => $file ? $file['name'] : 'Aucune',
        'Langue du site' => $lang === 'en' ? 'Anglais' : 'Français',
    ];
    $out = "Nouvelle demande de projet reçue depuis le site alfec.net\n\n";
    foreach ($rows as $label => $value) {
        // Pad by characters, not bytes, so accented labels line up.
        $out .= $label . str_repeat(' ', max(1, 20 - mb_strlen($label, 'UTF-8'))) . ': ' . $value . "\n";
    }
    return $out . "\nMessage :\n" . str_repeat('-', 40) . "\n" . $d['message'] . "\n";
}
