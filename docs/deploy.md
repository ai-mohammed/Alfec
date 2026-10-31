# Deploying alfec.net

The site is static HTML built by Astro, plus two small PHP scripts for the enquiry form and one for the
legacy URLs. It runs on the existing nginx + PHP hosting.

## 1. Build

```bash
npm ci
npm run build        # writes dist/
npm test             # optional but recommended: PHP checks + end-to-end tests (docs/testing.md)
```

## 2. Server requirements

| Requirement | Value |
|---|---|
| PHP | 8.0 or later (tested on 8.0.30 and 8.3.35) |
| PHP extensions | `fileinfo` and `mbstring` (required); `openssl` (SMTP over TLS); `intl` (country names, filename transliteration); `zip` (checks that DOCX/XLSX files are real Office documents) |
| `php.ini` | `upload_max_filesize = 12M`, `post_max_size = 13M`, `display_errors = Off`, `log_errors = On`, `expose_php = Off` |
| nginx | `client_max_body_size 13m;` |

## 3. Upload

Replace the web root's contents with the contents of `dist/`. Remove the previous site's files at the same
time: `index.php` is replaced; `contact/mail.php`, `quisommesnous.php`, `presentation.php`, `domaines.php`,
`galerie.php`, `actualites.php`, `metiers.php` and the `js/`, `styles/`, `plugins/`, `fonts/` folders are no
longer used. Keep `ressources/fichiers_produits/` for a few months if you want old image links shared on social
media to keep working; nothing on the new site uses it.

## 4. Enquiry form configuration

1. Copy `deploy/alfec-config.example.php` to `alfec-config.php` **in the directory above the web root**
   (for a web root `/var/www/alfec.net/public_html`, the file goes to `/var/www/alfec.net/alfec-config.php`).
   Alternatively set the `ALFEC_CONFIG` environment variable for PHP-FPM to its full path.
2. Fill in the SMTP account (recommended) or set `'transport' => 'mail'`.
3. Set `secret` to a random string: `php -r "echo bin2hex(random_bytes(32));"`.
4. Make the file readable by PHP only: `chmod 640 alfec-config.php` with the PHP-FPM user's group.
5. Send a test enquiry with an attachment from https://alfec.net/contact/ and check it arrives at the recipient.

Without a valid configuration the form shows a generic error and nothing is sent; the reason is written to the
PHP error log with the prefix `[alfec-contact]`.

## 5. nginx

```nginx
server {
    listen 443 ssl http2;
    server_name alfec.net;
    root /var/www/alfec.net/public_html;   # contents of dist/
    index index.html;
    error_page 404 /404.html;
    client_max_body_size 13m;

    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;
    # The pages also carry a hash-based Content-Security-Policy <meta> generated at build time.
    # frame-ancestors can only be sent as a header:
    add_header Content-Security-Policy "frame-ancestors 'self'" always;

    # Old indexed URLs: /index.php?lg=fr|en and old confirmation links (handled by index.php).
    location = /index.php {
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root/index.php;
        fastcgi_pass unix:/run/php/php-fpm.sock;
    }

    # Old AJAX endpoints of the previous site.
    location ~ ^/(quisommesnous|presentation|domaines|galerie|actualites|metiers)\.php$ {
        return 301 /;
    }
    location = /contact/mail.php {
        return 301 /contact/;
    }

    # The enquiry endpoint and its token.
    location ~ ^/contact/(send|token)\.php$ {
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_pass unix:/run/php/php-fpm.sock;
    }

    # PHP library files are never served nor executed directly.
    location ^~ /contact/lib/ {
        return 404;
    }

    # No other PHP file may run.
    location ~ \.php$ {
        return 404;
    }

    # Hashed build assets can be cached for a year.
    location ^~ /_astro/ {
        add_header Cache-Control "public, max-age=31536000, immutable" always;
    }

    location / {
        try_files $uri $uri/ =404;
    }
}

server {
    listen 80;
    listen 443 ssl http2;
    server_name www.alfec.net;
    return 301 https://alfec.net$request_uri;
}
```

The `http://` and `www.` redirects already exist on the current hosting and must be kept (they preserve the
path and query string).

## 6. After going live

- Submit `https://alfec.net/sitemap-index.xml` in Google Search Console and Bing Webmaster Tools.
- Check `https://alfec.net/index.php?lg=en` answers `301` to `/en/`.
- The old Google Analytics (Universal) tag was dead and has been removed; no analytics runs on the new site.
