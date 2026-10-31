import { DEFAULT_LOCALE, LOCALES } from './routes.mjs';

export type Lang = (typeof LOCALES)[number];
export type Bilingual<T = string> = Record<Lang, T>;

export const langs = LOCALES;
export const defaultLang: Lang = DEFAULT_LOCALE as Lang;

/** French typography: no-break spaces before high punctuation. Applied to French strings only. */
export function typo(lang: Lang, s: string): string {
  if (lang !== 'fr') return s;
  return s
    .replace(/ ([:])/g, ' $1')
    .replace(/ ([;?!])/g, ' $1')
    .replace(/« /g, '« ')
    .replace(/ »/g, ' »');
}

/** Pick a language from a bilingual value (with French typography when it's a string). */
export function tx<T>(value: Bilingual<T>, lang: Lang): T {
  const v = value[lang];
  return (typeof v === 'string' ? typo(lang, v) : v) as T;
}

export const ui = {
  skip: { fr: 'Aller au contenu', en: 'Skip to content' },
  nav: {
    label: { fr: 'Navigation principale', en: 'Main navigation' },
    home: { fr: 'Accueil', en: 'Home' },
    company: { fr: 'Entreprise', en: 'Company' },
    trades: { fr: 'Métiers', en: 'Expertise' },
    projects: { fr: 'Réalisations', en: 'Projects' },
    contact: { fr: 'Contact', en: 'Contact' },
    menu: { fr: 'Menu', en: 'Menu' },
    close: { fr: 'Fermer', en: 'Close' },
    homeLink: { fr: 'ALFEC, retour à l’accueil', en: 'ALFEC, back to home' },
  },
  lang: {
    label: { fr: 'Langue', en: 'Language' },
    switchTo: { fr: 'Read this page in English', en: 'Lire cette page en français' },
    short: { fr: 'FR', en: 'EN' },
  },
  cta: {
    project: { fr: 'Parler de votre projet', en: 'Discuss your project' },
    call: { fr: 'Appeler', en: 'Call' },
    allTrades: { fr: 'Les métiers', en: 'All trades' },
    company: { fr: 'Découvrir l’entreprise', en: 'About the company' },
    projects: { fr: 'Voir les réalisations', en: 'See our projects' },
    tradeMore: { fr: 'En savoir plus', en: 'Learn more' },
  },
  footer: {
    headOffice: { fr: 'Siège social', en: 'Head office' },
    phone: { fr: 'Tél.', en: 'Phone' },
    fax: { fr: 'Fax', en: 'Fax' },
    mobile: { fr: 'Mobile', en: 'Mobile' },
    email: { fr: 'E-mail', en: 'E-mail' },
    follow: { fr: 'Suivre ALFEC', en: 'Follow ALFEC' },
    sitemap: { fr: 'Plan du site', en: 'Site map' },
    rights: { fr: 'Tous droits réservés.', en: 'All rights reserved.' },
  },
  photo: {
    enlarge: { fr: 'Agrandir la photo', en: 'Enlarge photo' },
  },
} as const;
