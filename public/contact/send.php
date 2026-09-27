<?php
/**
 * alfec.net enquiry endpoint. Accepts the form from /contact/ and /en/contact/.
 * - With `Accept: application/json` (the enhanced form) it answers JSON:
 *   200 {ok, redirect} · 422 {ok:false, errors:{field: code}} · 429 · 403 · 500, messages translated by the page.
 * - Without JavaScript it answers 303 redirects to the confirmation or error page.
 * Server errors never expose details; they are logged with error_log().
 */

declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';
require __DIR__ . '/lib/PHPMailer/Exception.php';
require __DIR__ . '/lib/PHPMailer/PHPMailer.php';
require __DIR__ . '/lib/PHPMailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use function Alfec\Contact\{attachment, baseHeaders, config, headerSafe, json, mailBody, originAllowed, rateLimited, redirect, tokenAge, validate};

baseHeaders();

$lang = ($_POST['lang'] ?? '') === 'en' ? 'en' : 'fr';
$wantsJson = str_contains((string) ($_SERVER['HTTP_ACCEPT'] ?? ''), 'application/json');
$pages = [
    'fr' => ['thanks' => '/contact/merci/', 'error' => '/contact/erreur/'],
    'en' => ['thanks' => '/en/contact/thank-you/', 'error' => '/en/contact/error/'],
][$lang];

$fail = static function (int $status, array $extra = []) use ($wantsJson, $pages): void {
    if ($wantsJson) {
        json($status, ['ok' => false] + $extra);
    }
    redirect($pages['error']);
};
$succeed = static function () use ($wantsJson, $pages): void {
    if ($wantsJson) {
        json(200, ['ok' => true, 'redirect' => $pages['thanks']]);
    }
    redirect($pages['thanks']);
};

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    json(405, ['ok' => false]);
}

// A POST larger than post_max_size arrives with empty $_POST and $_FILES.
if (empty($_POST) && (int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) {
    $fail(422, ['errors' => ['piece' => 'fileSize']]);
}

$config = config();
if ($config === null) {
    error_log('[alfec-contact] configuration missing or invalid');
    $fail(500);
}

if (!originAllowed($config['allowed_origins'])) {
    $fail(403);
}

// Honeypot filled: answer like a success so automated senders learn nothing, send nothing.
if (trim((string) ($_POST['website'] ?? '')) !== '') {
    $succeed();
}

// Signed load time. Missing (no JavaScript) is accepted; forged or too fast is treated as automated.
$token = (string) ($_POST['token'] ?? '');
if ($token !== '') {
    $age = tokenAge($token, (string) $config['secret']);
    if ($age === null || $age < (int) $config['min_fill_seconds']) {
        $succeed();
    }
}

if (rateLimited($config, false)) {
    $fail(429);
}

[$data, $errors] = validate($_POST);
[$file, $fileError] = attachment($_FILES, (int) $config['max_upload_bytes']);
if ($fileError !== null) {
    $errors['piece'] = $fileError;
}
if ($errors) {
    $fail(422, ['errors' => $errors]);
}

try {
    $mail = new PHPMailer(true);
    $mail->CharSet = PHPMailer::CHARSET_UTF8;
    $mail->Encoding = PHPMailer::ENCODING_QUOTED_PRINTABLE;
    $mail->XMailer = ' ';

    if ($config['transport'] === 'smtp') {
        $smtp = $config['smtp'];
        $mail->isSMTP();
        $mail->Host = (string) $smtp['host'];
        $mail->Port = (int) $smtp['port'];
        $mail->Timeout = (int) ($smtp['timeout'] ?? 15);
        $secure = (string) ($smtp['secure'] ?? 'tls');
        $mail->SMTPSecure = $secure === 'ssl' ? PHPMailer::ENCRYPTION_SMTPS : ($secure === 'tls' ? PHPMailer::ENCRYPTION_STARTTLS : '');
        $mail->SMTPAutoTLS = $secure !== 'none';
        if ((string) $smtp['username'] !== '') {
            $mail->SMTPAuth = true;
            $mail->Username = (string) $smtp['username'];
            $mail->Password = (string) $smtp['password'];
        }
    } else {
        $mail->isMail();
    }

    $mail->setFrom((string) $config['from_email'], headerSafe((string) $config['from_name'], 60), false);
    $mail->addAddress((string) $config['recipient']);
    $mail->addReplyTo($data['email'], headerSafe($data['nom'], 80));
    $mail->Subject = headerSafe(
        'Demande de projet · ' . $data['nom'] . ($data['organisme'] !== '' ? ' · ' . $data['organisme'] : ''),
        150
    );
    $mail->isHTML(false);
    $mail->Body = mailBody($data, $lang, $file);
    if ($file !== null) {
        $mail->addAttachment($file['path'], $file['name'], PHPMailer::ENCODING_BASE64, $file['mime']);
    }
    $mail->send();
} catch (\Throwable $e) {
    error_log('[alfec-contact] send failed: ' . get_class($e) . ': ' . $e->getMessage());
    $fail(500);
}

rateLimited($config, true);
$succeed();
