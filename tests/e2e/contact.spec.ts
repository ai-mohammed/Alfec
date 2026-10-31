import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

// Contract: Contact Enquiry (unspa feature 9505fbbc) and the security requirements of the redesign.
const SINK = 'http://127.0.0.1:8025/api/messages';
const ORIGIN = 'http://127.0.0.1:8080';

type Mail = { to: string; replyTo: string; subject: string; text: string; headers: Record<string, string>; attachments: { filename: string; contentType: string; size: number }[] };

async function mails(request: APIRequestContext): Promise<Mail[]> {
  return (await request.get(SINK)).json();
}

async function clearMails(request: APIRequestContext) {
  await request.delete(SINK);
}

const pdf = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 10 10]/Parent 2 0 R>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n',
);

async function fillValid(page: Page, lang: 'fr' | 'en' = 'fr') {
  await page.fill('#nom', 'Karim Benali');
  await page.fill('#organisme', 'Bureau d’études Test');
  await page.selectOption('#role', 'maitre_oeuvre');
  await page.fill('#email', 'karim@example.com');
  await page.fill('#tel', '+213 41 00 00 00');
  await page.fill('#ville', 'Oran');
  await page.selectOption('#travaux', 'travaux_neufs');
  await page.selectOption('#activite', 'industrie');
  await page.fill('#message', lang === 'fr' ? 'Étude et réalisation du désenfumage d’un entrepôt de 4 000 m².' : 'Smoke control design and installation for a warehouse.');
}

/** Valid multipart payload for direct endpoint tests. */
function payload(overrides: Record<string, string> = {}) {
  return {
    lang: 'fr',
    token: '',
    website: '',
    nom: 'Test Direct',
    organisme: '',
    role: 'collectivite',
    role_autre: '',
    email: 'direct@example.com',
    tel: '0555 00 00 00',
    ville: 'Oran',
    pays: 'DZ',
    metier: '',
    activite: 'batiment',
    activite_autre: '',
    travaux: 'maintenance',
    travaux_autre: '',
    message: 'Demande envoyée directement au point d’accès.',
    ...overrides,
  };
}

async function freshToken(request: APIRequestContext) {
  const data = await (await request.get('/contact/token.php')).json();
  await new Promise((r) => setTimeout(r, 1200)); // min_fill_seconds is 1 in the test config
  return data.token as string;
}

test.beforeEach(async ({ request }) => {
  await clearMails(request);
});

test('empty submit shows translated errors and focuses the first field', async ({ page }) => {
  await page.goto('/contact/');
  await page.getByRole('button', { name: 'Envoyer la demande' }).click();
  await expect(page.locator('[data-summary]')).toContainText('Certains champs sont à corriger avant l’envoi');
  await expect(page.locator('[data-summary] a').first()).toHaveText('Nom et prénom');
  await expect(page.locator('#nom')).toBeFocused();
  await expect(page.locator('#nom')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#err-nom')).toHaveText('Ce champ est obligatoire.');
  await expect(page.locator('#err-role')).toHaveText('Choisissez une option.');
  await expect(page.locator('#err-activite')).toHaveText('Choisissez une option.');
  await expect(page.locator('#organisme')).not.toHaveAttribute('aria-invalid', 'true');
});

test('English page shows English errors', async ({ page }) => {
  await page.goto('/en/contact/');
  await page.getByRole('button', { name: 'Send enquiry' }).click();
  await expect(page.locator('#err-email')).toHaveText('This field is required.');
  await page.fill('#email', 'not-an-email');
  await page.locator('#email').blur();
  await expect(page.locator('#err-email')).toContainText('Enter a valid e-mail address');
});

test('choosing Autre reveals and requires its free-text field', async ({ page }) => {
  await page.goto('/contact/');
  await expect(page.locator('#role_autre')).toBeHidden();
  await page.selectOption('#role', 'autre');
  await expect(page.locator('#role_autre')).toBeVisible();
  await page.getByRole('button', { name: 'Envoyer la demande' }).click();
  await expect(page.locator('#err-role_autre')).toHaveText('Ce champ est obligatoire.');
  await page.selectOption('#role', 'maitre_ouvrage');
  await expect(page.locator('#role_autre')).toBeHidden();
});

test('arriving from a trade page pre-selects that trade', async ({ page }) => {
  await page.goto('/metiers/desenfumage/');
  await page.getByRole('link', { name: 'Parler de votre projet' }).last().click();
  await expect(page).toHaveURL(/\/contact\/\?metier=desenfumage$/);
  await expect(page.locator('#metier')).toHaveValue('desenfumage');
});

test('attachments are checked for type and size before sending', async ({ page }) => {
  await page.goto('/contact/');
  await page.setInputFiles('#piece', { name: 'installer.exe', mimeType: 'application/octet-stream', buffer: Buffer.from('MZ') });
  await expect(page.locator('#err-piece')).toContainText('Ce type de fichier n’est pas accepté');
  await page.setInputFiles('#piece', { name: 'plan.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(11 * 1024 * 1024) });
  await expect(page.locator('#err-piece')).toContainText('Le fichier dépasse 10 Mo');
  await page.getByRole('button', { name: 'Retirer le fichier' }).click();
  await expect(page.locator('#err-piece')).toBeHidden();
});

test('a complete French enquiry with attachment is delivered and confirmed', async ({ page, request }) => {
  await page.goto('/contact/?metier=froid');
  await fillValid(page);
  await page.setInputFiles('#piece', { name: 'Plan du bâtiment (v2).pdf', mimeType: 'application/pdf', buffer: pdf });
  await expect(page.locator('[data-file-name]')).toContainText('Plan du bâtiment (v2).pdf');
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: 'Envoyer la demande' }).click();
  await expect(page).toHaveURL(/\/contact\/merci\/$/);
  await expect(page.locator('h1')).toHaveText('Votre message a bien été envoyé.');

  const [mail] = await mails(request);
  expect(mail.to).toContain('contact@alfec.test');
  expect(mail.replyTo).toContain('karim@example.com');
  expect(mail.subject).toBe('Demande de projet · Karim Benali · Bureau d’études Test');
  expect(mail.text).toContain('Métier concerné');
  expect(mail.text).toContain('Froid industriel');
  expect(mail.text).toContain('Maître d’œuvre');
  expect(mail.text).toMatch(/Langue du site +: Français/);
  expect(mail.attachments).toHaveLength(1);
  expect(mail.attachments[0].filename).toBe('Plan-du-batiment-v2.pdf');
  expect(mail.attachments[0].contentType).toBe('application/pdf');
});

test('the English form confirms in English', async ({ page, request }) => {
  await page.goto('/en/contact/');
  await fillValid(page, 'en');
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: 'Send enquiry' }).click();
  await expect(page).toHaveURL(/\/en\/contact\/thank-you\/$/);
  await expect(page.locator('h1')).toHaveText('Your message has been sent.');
  const [mail] = await mails(request);
  expect(mail.text).toMatch(/Langue du site +: Anglais/);
});

test('pressing Enter submits the right language (legacy defect fixed)', async ({ page }) => {
  await page.goto('/en/contact/');
  await fillValid(page, 'en');
  await page.waitForTimeout(1200);
  await page.locator('#ville').press('Enter');
  await expect(page).toHaveURL(/\/en\/contact\/thank-you\/$/);
});

test('without JavaScript the form still sends and confirms', async ({ browser, request }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/contact/');
  await fillValid(page);
  // Playwright's stability check waits on animation frames, which do not tick with scripting off.
  await page.getByRole('button', { name: 'Envoyer la demande' }).click({ force: true });
  await expect(page).toHaveURL(/\/contact\/merci\/$/);
  expect((await mails(request)).length).toBe(1);
  await context.close();
});

test.describe('endpoint hardening', () => {
  const headers = { Accept: 'application/json', Origin: ORIGIN };

  test('server-side validation returns field codes and sends nothing', async ({ request }) => {
    const res = await request.post('/contact/send.php', {
      headers,
      multipart: payload({ email: 'bad', tel: 'abc', activite: 'unknown', message: 'short', role: 'autre' }),
    });
    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body).toEqual({
      ok: false,
      errors: { email: 'email', tel: 'tel', activite: 'choose', message: 'tooShort', role_autre: 'required' },
    });
    expect(await mails(request)).toHaveLength(0);
  });

  test('a foreign origin is refused', async ({ request }) => {
    const res = await request.post('/contact/send.php', {
      headers: { Accept: 'application/json', Origin: 'https://evil.example' },
      multipart: payload(),
    });
    expect(res.status()).toBe(403);
    expect(await mails(request)).toHaveLength(0);
  });

  test('a filled honeypot looks like success but sends nothing', async ({ request }) => {
    const res = await request.post('/contact/send.php', { headers, multipart: payload({ website: 'http://spam.example' }) });
    expect(res.status()).toBe(200);
    expect((await res.json()).ok).toBe(true);
    expect(await mails(request)).toHaveLength(0);
  });

  test('forged and too-fast tokens send nothing', async ({ request }) => {
    const forged = await request.post('/contact/send.php', { headers, multipart: payload({ token: `${Math.floor(Date.now() / 1000) - 60}.${'0'.repeat(64)}` }) });
    expect((await forged.json()).ok).toBe(true);
    const fast = (await (await request.get('/contact/token.php')).json()).token;
    const quick = await request.post('/contact/send.php', { headers, multipart: payload({ token: fast }) });
    expect((await quick.json()).ok).toBe(true);
    expect(await mails(request)).toHaveLength(0);
  });

  test('a valid token and payload are delivered', async ({ request }) => {
    const token = await freshToken(request);
    const res = await request.post('/contact/send.php', { headers, multipart: payload({ token }) });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ok: true, redirect: '/contact/merci/' });
    expect(await mails(request)).toHaveLength(1);
  });

  test('header injection through the name cannot add headers', async ({ request }) => {
    const token = await freshToken(request);
    await request.post('/contact/send.php', {
      headers,
      multipart: payload({ token, nom: 'Eve\r\nBcc: victim@example.com', organisme: 'X\nCc: other@example.com' }),
    });
    const [mail] = await mails(request);
    expect(mail.subject).not.toMatch(/[\r\n]/);
    expect(mail.headers.bcc ?? '').toBe('');
    expect(mail.headers.cc ?? '').toBe('');
  });

  test('a disguised executable named .pdf is rejected', async ({ request }) => {
    const token = await freshToken(request);
    const res = await request.post('/contact/send.php', {
      headers,
      multipart: { ...payload({ token }), piece: { name: 'plan.pdf', mimeType: 'application/pdf', buffer: Buffer.from('MZ\x90\x00 not a pdf at all') } },
    });
    expect(res.status()).toBe(422);
    expect((await res.json()).errors).toEqual({ piece: 'fileType' });
  });

  test('a real PDF is accepted and a PHP file is not', async ({ request }) => {
    let token = await freshToken(request);
    const ok = await request.post('/contact/send.php', {
      headers,
      multipart: { ...payload({ token }), piece: { name: 'devis.pdf', mimeType: 'application/pdf', buffer: pdf } },
    });
    expect(ok.status()).toBe(200);
    token = await freshToken(request);
    const php = await request.post('/contact/send.php', {
      headers,
      multipart: { ...payload({ token }), piece: { name: 'shell.php', mimeType: 'application/pdf', buffer: pdf } },
    });
    expect((await php.json()).errors).toEqual({ piece: 'fileType' });
  });

  test('only POST is allowed, and library files are not reachable', async ({ request }) => {
    expect((await request.get('/contact/send.php')).status()).toBe(405);
    expect((await request.get('/contact/lib/bootstrap.php')).status()).toBe(403);
    expect((await request.get('/contact/lib/PHPMailer/PHPMailer.php')).status()).toBe(403);
  });

  test('responses do not expose server details', async ({ request }) => {
    const res = await request.post('/contact/send.php', { headers, multipart: payload({ email: 'x' }) });
    expect(res.headers()['x-content-type-options']).toBe('nosniff');
    expect(res.headers()['cache-control']).toContain('no-store');
    expect(JSON.stringify(await res.json())).not.toMatch(/php|exception|stack|smtp/i);
  });
});
