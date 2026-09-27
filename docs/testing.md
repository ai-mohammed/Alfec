# Testing

```bash
npm test          # build, PHP unit checks, end-to-end tests
npm run check     # TypeScript / Astro diagnostics
```

## What runs

- **PHP unit checks** (`tests/php/run.php`): tokens, input cleaning, header safety, filename sanitising,
  validation rules and the rate limit of `public/contact/lib/bootstrap.php`.
- **End-to-end tests** (`tests/e2e/`, Playwright): every page in both languages with its SEO head, legacy
  redirects, navigation and the mobile menu, the photo viewer, horizontal overflow at 1440/1280/1024/768/390 px,
  touch targets, and the whole enquiry flow including attachments, server-side validation and hardening.

Playwright starts two servers itself:

- `php -S 127.0.0.1:8080 -t dist tests/support/router.php`: the built site with the endpoint, using
  `tests/fixtures/alfec-config.test.php`. The router mirrors the nginx rules in `docs/deploy.md`.
- `node tests/support/smtp-sink.mjs`: an SMTP server on port 2525 that keeps received mail in memory and
  serves it at `http://127.0.0.1:8025/api/messages`, so tests can check what ALFEC would receive.

## PHP for the tests

Any PHP 8.0+ with `fileinfo`, `mbstring`, `intl`, `zip` works. Resolution order: the `PHP_BIN` environment
variable, then a portable build in `.tools/php8.3/` (git-ignored), then `php` from the PATH.

To create the portable build on Windows, download the official NTS x64 zip from
https://downloads.php.net/~windows/releases/ , check its SHA-256 against `releases.json`, unzip it to
`.tools/php8.3/`, and add a `php.ini` there enabling `fileinfo`, `mbstring`, `intl`, `zip` and `openssl`, with
`upload_max_filesize = 12M` and `post_max_size = 13M`.

A Docker alternative is described in `docker-compose.test.yml` (PHP + Apache and Mailpit).
