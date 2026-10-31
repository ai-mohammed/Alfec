// Progressive enhancement for the enquiry form. Without JavaScript the form still posts to
// /contact/send.php and the server redirects to the confirmation or error page.

type ClientText = {
  lang: 'fr' | 'en';
  errors: Record<string, string>;
  sending: string;
  submit: string;
  thanks: string;
  maxBytes: number;
  extensions: string[];
};

const PHONE = /^[0-9+().\s-]{6,30}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function initEnquiryForm(): void {
  const form = document.querySelector<HTMLFormElement>('[data-form]');
  const textEl = document.getElementById('form-text');
  if (!form || !textEl) return;
  const formEl: HTMLFormElement = form;
  const t = JSON.parse(textEl.textContent || '{}') as ClientText;

  const summary = form.querySelector<HTMLElement>('[data-summary]')!;
  const status = form.querySelector<HTMLElement>('[data-status]')!;
  const submitBtn = form.querySelector<HTMLButtonElement>('[data-submit]')!;
  const submitLabel = form.querySelector<HTMLElement>('[data-submit-label]')!;
  const tokenInput = form.querySelector<HTMLInputElement>('[data-token]')!;

  // Signed timestamp from the server: proves the form was loaded before it was sent.
  const loadToken = () =>
    fetch('/contact/token.php', { headers: { Accept: 'application/json' }, cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data.token === 'string') tokenInput.value = data.token;
      })
      .catch(() => {});
  loadToken();

  // Pre-select the trade when arriving from a trade page (?metier=climatique).
  const params = new URLSearchParams(location.search);
  for (const select of form.querySelectorAll<HTMLSelectElement>('[data-prefill]')) {
    const value = params.get(select.dataset.prefill!);
    if (value && [...select.options].some((o) => o.value === value)) select.value = value;
  }

  // "Autre" free-text fields appear only when "Autre" is chosen.
  for (const select of form.querySelectorAll<HTMLSelectElement>('[data-other]')) {
    const field = form.querySelector<HTMLElement>(`[data-other-field="${select.dataset.other}"]`);
    if (!field) continue;
    const sync = () => {
      const show = select.value === 'autre';
      field.hidden = !show;
      if (!show) clearError(field.querySelector('input')!);
    };
    select.addEventListener('change', sync);
    sync();
  }

  // Attachment picker: show the chosen file, validate type and size, allow removal.
  const fileInput = form.querySelector<HTMLInputElement>('input[type="file"]')!;
  const fileName = form.querySelector<HTMLElement>('[data-file-name]')!;
  const fileRemove = form.querySelector<HTMLButtonElement>('[data-file-remove]')!;
  const describeFile = () => {
    const file = fileInput.files?.[0];
    fileName.hidden = !file;
    fileRemove.hidden = !file;
    fileName.textContent = file ? `${file.name} · ${formatSize(file.size, t.lang)}` : '';
    if (file) validateField(fileInput);
    else clearError(fileInput);
  };
  fileInput.addEventListener('change', describeFile);
  fileRemove.addEventListener('click', () => {
    fileInput.value = '';
    describeFile();
    fileInput.focus();
  });

  // Validate a field when the visitor leaves it, and live once it has shown an error.
  for (const el of fields(form)) {
    el.addEventListener('blur', () => {
      if (el.value) validateField(el);
    });
    el.addEventListener('input', () => {
      if (el.getAttribute('aria-invalid') === 'true') validateField(el);
    });
  }

  function validateField(el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): boolean {
    const code = check(el);
    if (code) showError(el, t.errors[code] ?? t.errors.required);
    else clearError(el);
    return !code;
  }

  function check(el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): string | null {
    const wrapper = el.closest<HTMLElement>('[data-other-field]');
    if (wrapper?.hidden) return null;
    if (el instanceof HTMLInputElement && el.type === 'file') {
      const file = el.files?.[0];
      if (!file) return null;
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      if (!t.extensions.includes(ext)) return 'fileType';
      if (file.size > t.maxBytes) return 'fileSize';
      return null;
    }
    const value = el.value.trim();
    const required = el.required || (wrapper != null && !wrapper.hidden);
    if (!value) return required ? (el instanceof HTMLSelectElement ? 'choose' : 'required') : null;
    if (el.name === 'email' && !EMAIL.test(value)) return 'email';
    if (el.name === 'tel' && !PHONE.test(value)) return 'tel';
    if (el.name === 'message' && value.length < 10) return 'tooShort';
    const max = Number(el.getAttribute('maxlength') || 0);
    if (max && value.length > max) return 'tooLong';
    return null;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    summary.hidden = true;
    status.textContent = '';

    const invalid = fields(form).filter((el) => !validateField(el));
    if (invalid.length) {
      showSummary(t.errors.summary, invalid);
      invalid[0].focus();
      return;
    }

    setBusy(true);
    try {
      if (!tokenInput.value) await loadToken();
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.ok) {
        location.assign(data.redirect || t.thanks);
        return;
      }
      if (response.status === 422 && data.errors) {
        const failed: HTMLElement[] = [];
        for (const [name, code] of Object.entries<string>(data.errors)) {
          const el = form.querySelector<HTMLInputElement>(`[name="${CSS.escape(name)}"]`);
          if (el) {
            showError(el, t.errors[code] ?? t.errors.required);
            failed.push(el);
          }
        }
        showSummary(t.errors.summary, failed);
        failed[0]?.focus();
      } else if (response.status === 429) {
        showSummary(t.errors.rate);
      } else {
        showSummary(t.errors.server);
      }
    } catch {
      showSummary(t.errors.network);
    }
    setBusy(false);
  });

  function setBusy(busy: boolean) {
    submitBtn.disabled = busy;
    submitLabel.textContent = busy ? t.sending : t.submit;
    status.textContent = busy ? t.sending : '';
    formEl.setAttribute('aria-busy', String(busy));
  }

  /** Show the summary, listing each failing field as a link that moves focus to it. */
  function showSummary(message: string, failed: HTMLElement[] = []) {
    summary.replaceChildren();
    const text = document.createElement('p');
    text.textContent = message;
    summary.append(text);
    if (failed.length) {
      const list = document.createElement('ul');
      for (const el of failed) {
        const label = formEl.querySelector<HTMLElement>(`label[for="${CSS.escape(el.id)}"], #${CSS.escape(el.id)}-label`);
        const name = (label?.firstChild?.textContent ?? el.getAttribute('name') ?? '').trim();
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#${el.id}`;
        link.textContent = name;
        link.addEventListener('click', (event) => {
          event.preventDefault();
          el.focus();
        });
        item.append(link);
        list.append(item);
      }
      summary.append(list);
    }
    summary.hidden = false;
    if (!failed.length) summary.focus();
  }
}

function fields(form: HTMLFormElement) {
  return [...form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    'input:not([type="hidden"]):not([name="website"]), select, textarea',
  )];
}

function showError(el: HTMLElement, message: string) {
  const error = document.getElementById(`err-${el.getAttribute('name')}`);
  el.setAttribute('aria-invalid', 'true');
  if (error) {
    error.textContent = message;
    error.hidden = false;
  }
}

function clearError(el: HTMLElement) {
  const error = document.getElementById(`err-${el.getAttribute('name')}`);
  el.removeAttribute('aria-invalid');
  if (error) {
    error.textContent = '';
    error.hidden = true;
  }
}

function formatSize(bytes: number, lang: 'fr' | 'en') {
  const mb = bytes / (1024 * 1024);
  const unit = lang === 'fr' ? ['Ko', 'Mo'] : ['KB', 'MB'];
  return mb >= 1
    ? `${mb.toLocaleString(lang, { maximumFractionDigits: 1 })} ${unit[1]}`
    : `${Math.max(1, Math.round(bytes / 1024))} ${unit[0]}`;
}

export function initMap(): void {
  const map = document.querySelector<HTMLElement>('[data-map]');
  const button = map?.querySelector<HTMLButtonElement>('[data-map-load]');
  if (!map || !button) return;
  button.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = map.dataset.src!;
    iframe.title = map.dataset.title!;
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer';
    map.querySelector('[data-map-slot]')?.replaceWith(iframe);
    iframe.focus();
  });
}
