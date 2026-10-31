<?php
/** Issues the signed load-time token the enquiry form sends back with the enquiry. */

declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';

use function Alfec\Contact\{baseHeaders, config, issueToken, json};

baseHeaders();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    header('Allow: GET');
    json(405, ['ok' => false]);
}

$config = config();
if ($config === null) {
    json(503, ['ok' => false]);
}

json(200, ['ok' => true, 'token' => issueToken((string) $config['secret'])]);
