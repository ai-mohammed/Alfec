<?php
/**
 * Unit checks for public/contact/lib/bootstrap.php, run inside the test container:
 *   php tests/php/run.php            (or inside the Docker test stack: php /tests/run.php)
 */

declare(strict_types=1);

require is_file(__DIR__ . '/../../public/contact/lib/bootstrap.php')
    ? __DIR__ . '/../../public/contact/lib/bootstrap.php'
    : '/lib/bootstrap.php';

use function Alfec\Contact\{clean, headerSafe, issueToken, safeFilename, tokenAge, validate, rateLimited};

$failures = 0;
$count = 0;
function check(string $name, bool $ok): void
{
    global $failures, $count;
    $count++;
    if (!$ok) {
        $failures++;
        echo "FAIL  $name\n";
    } else {
        echo "ok    $name\n";
    }
}

$secret = str_repeat('s', 40);

// Tokens
$t = issueToken($secret, 1_800_000_000);
check('token age is computed from issue time', tokenAge($t, $secret, 1_800_000_010) === 10);
check('token signed with another secret is rejected', tokenAge($t, str_repeat('x', 40), 1_800_000_010) === null);
check('tampered timestamp is rejected', tokenAge('1800000001' . substr($t, 10), $secret) === null);
check('malformed token is rejected', tokenAge('abc.def', $secret) === null);

// Cleaning and headers
check('control characters are removed', clean("Nom\x00\x07 Prénom") === 'Nom Prénom');
check('newlines are collapsed on single-line fields', clean("a\r\nb") === 'a b');
check('newlines survive in multiline text', clean("ligne 1\r\nligne 2", true) === "ligne 1\nligne 2");
check('header values cannot carry CR/LF', !str_contains(headerSafe("Sujet\r\nBcc: x@y.z"), "\n"));

// Filenames
check('path traversal is stripped', safeFilename('../../etc/passwd.pdf', 'pdf') === 'passwd.pdf');
check('accents are transliterated', !class_exists(\Transliterator::class) || safeFilename('Plan du bâtiment.pdf', 'pdf') === 'Plan-du-batiment.pdf');
check('non-Latin names still produce a usable file name', preg_match('/^[A-Za-z0-9._-]+\.pdf$/', safeFilename('مخطط المشروع.pdf', 'pdf')) === 1);
check('the validated extension always ends the name', str_ends_with(safeFilename('devis.pdf.exe', 'pdf'), '.pdf'));
check('empty name falls back', safeFilename('....pdf', 'pdf') === 'piece-jointe.pdf');
check('jpeg is normalised to jpg', str_ends_with(safeFilename('photo.jpeg', 'jpeg'), '.jpg'));
check('names are capped at 80 characters', strlen(safeFilename(str_repeat('a', 300) . '.pdf', 'pdf')) <= 84);

// Validation
$valid = [
    'nom' => 'Karim B.', 'organisme' => '', 'role' => 'maitre_ouvrage', 'role_autre' => '',
    'email' => 'k.b@example.com', 'tel' => '+213 41 00 00 00', 'ville' => 'Oran', 'pays' => 'DZ',
    'metier' => 'desenfumage', 'activite' => 'industrie', 'activite_autre' => '', 'travaux' => 'maintenance',
    'travaux_autre' => '', 'message' => 'Étude de désenfumage pour un entrepôt.',
];
[$d, $e] = validate($valid);
check('a complete enquiry validates', $e === []);
[, $e] = validate(['role' => 'autre', 'role_autre' => ''] + $valid);
check('Autre requires its free text', ($e['role_autre'] ?? '') === 'required');
[, $e] = validate(['activite' => ''] + $valid);
check('placeholder choice is refused', ($e['activite'] ?? '') === 'choose');
[, $e] = validate(['activite' => 'not-a-value'] + $valid);
check('unknown choice is refused', ($e['activite'] ?? '') === 'choose');
[, $e] = validate(['metier' => 'hacking'] + $valid);
check('unknown optional trade is refused', ($e['metier'] ?? '') === 'choose');
[, $e] = validate(['email' => "a@b.co\r\nBcc: x@y.z"] + $valid);
check('e-mail header injection is refused', ($e['email'] ?? '') === 'email');
[, $e] = validate(['tel' => 'call me'] + $valid);
check('phone must look like a phone number', ($e['tel'] ?? '') === 'tel');
[, $e] = validate(['message' => 'court'] + $valid);
check('message has a minimum length', ($e['message'] ?? '') === 'tooShort');
[, $e] = validate(['message' => str_repeat('x', 5001)] + $valid);
check('message has a maximum length', ($e['message'] ?? '') === 'tooLong');
[, $e] = validate(['pays' => 'Algérie'] + $valid);
check('a given country must be an ISO code', ($e['pays'] ?? '') === 'choose');
[, $e] = validate(['ville' => '', 'pays' => ''] + $valid);
check('city and country are optional', $e === []);
[, $e] = validate(['role' => 'bureau_etudes'] + $valid);
check('Bureau d’études is an accepted role', $e === []);
[$d] = validate(['nom' => '<script>alert(1)</script>'] + $valid);
check('markup is kept as inert text for a plain-text e-mail', $d['nom'] === '<script>alert(1)</script>');
[, $e] = validate(['nom' => ['array']] + $valid);
check('non-string input is treated as empty', ($e['nom'] ?? '') === 'required');

// Rate limit
$config = ['storage_dir' => sys_get_temp_dir() . '/alfec-rl-' . bin2hex(random_bytes(4)), 'secret' => $secret, 'rate_limit' => ['max' => 2, 'window' => 60]];
$_SERVER['REMOTE_ADDR'] = '203.0.113.9';
check('first send is allowed', rateLimited($config, true) === false);
check('second send is allowed', rateLimited($config, true) === false);
check('third send within the window is limited', rateLimited($config, false) === true);
$_SERVER['REMOTE_ADDR'] = '203.0.113.10';
check('another IP is not limited', rateLimited($config, false) === false);

echo "\n$count checks, $failures failed\n";
exit($failures === 0 ? 0 : 1);
