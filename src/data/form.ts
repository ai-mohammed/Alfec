import type { Bilingual, Lang } from '../i18n/ui';
import { trades } from './trades';

// The enquiry form's vocabulary. Values are stable machine keys shared with public/contact/send.php;
// labels are what visitors read. Choices come from the original alfec.net form (docs/audit, section 5),
// simplified with the user's approval on 2026-09-26: one phone field, no fax or postal address,
// menus that must really be chosen, an optional trade, a Bureau d'études role, optional city and country.

export type Option = { value: string; label: Bilingual };

export const roles: Option[] = [
  { value: 'maitre_oeuvre', label: { fr: 'Maître d’œuvre', en: 'Project manager (maître d’œuvre)' } },
  { value: 'bureau_etudes', label: { fr: 'Bureau d’études', en: 'Engineering consultancy (bureau d’études)' } },
  { value: 'maitre_ouvrage', label: { fr: 'Maître d’ouvrage', en: 'Project owner (maître d’ouvrage)' } },
  { value: 'entreprise_generale', label: { fr: 'Société générale de bâtiment', en: 'General building contractor' } },
  { value: 'collectivite', label: { fr: 'Collectivité locale', en: 'Local authority' } },
  { value: 'autre', label: { fr: 'Autre', en: 'Other' } },
];

export const activities: Option[] = [
  { value: 'batiment', label: { fr: 'Bâtiment', en: 'Buildings' } },
  { value: 'hotellerie', label: { fr: 'Hôtellerie', en: 'Hotels' } },
  { value: 'industrie', label: { fr: 'Industrie', en: 'Industry' } },
  { value: 'agroalimentaire', label: { fr: 'Agroalimentaire', en: 'Food processing' } },
  { value: 'sante', label: { fr: 'Santé', en: 'Healthcare' } },
  { value: 'autre', label: { fr: 'Autre', en: 'Other' } },
];

export const works: Option[] = [
  { value: 'travaux_neufs', label: { fr: 'Travaux neufs', en: 'New construction' } },
  { value: 'maintenance', label: { fr: 'Maintenance', en: 'Maintenance' } },
  { value: 'autre', label: { fr: 'Autre', en: 'Other' } },
];

export const tradeOptions: Option[] = trades.map((t) => ({ value: t.key, label: t.name }));

// ISO 3166-1 alpha-2 codes. Names are generated per language with Intl.DisplayNames.
const COUNTRY_CODES =
  'AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI KH CM CA CV CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HK HU IS IN ID IR IQ IE IT JM JP JO KZ KE KI KW KG LA LV LB LS LR LY LI LT LU MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG KP MK NO OM PK PW PS PA PG PY PE PH PL PT QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA KR SS ES LK SD SR SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW'.split(' ');

export function countries(lang: Lang): { value: string; label: string }[] {
  const names = new Intl.DisplayNames([lang], { type: 'region' });
  const collator = new Intl.Collator(lang);
  return COUNTRY_CODES.map((code) => ({ value: code, label: names.of(code) ?? code })).sort((a, b) =>
    collator.compare(a.label, b.label),
  );
}

export const accept = {
  extensions: ['pdf', 'jpg', 'jpeg', 'png', 'docx', 'xlsx'],
  maxBytes: 10 * 1024 * 1024,
};

export const labels = {
  fsYou: { fr: 'Vous', en: 'About you' },
  fsReach: { fr: 'Vos coordonnées', en: 'Contact details' },
  fsProject: { fr: 'Votre projet', en: 'Your project' },
  nom: { fr: 'Nom et prénom', en: 'Full name' },
  organisme: { fr: 'Organisme', en: 'Organisation' },
  role: { fr: 'Vous êtes', en: 'You are' },
  roleAutre: { fr: 'Précisez votre fonction', en: 'Please specify your role' },
  email: { fr: 'E-mail', en: 'E-mail' },
  tel: { fr: 'Téléphone', en: 'Phone' },
  ville: { fr: 'Ville', en: 'City' },
  pays: { fr: 'Pays', en: 'Country' },
  metier: { fr: 'Métier concerné', en: 'Relevant trade' },
  metierAny: { fr: 'Plusieurs métiers ou je ne sais pas', en: 'Several trades, or not sure' },
  activite: { fr: 'Secteur d’activité', en: 'Sector' },
  activiteAutre: { fr: 'Précisez le secteur', en: 'Please specify the sector' },
  travaux: { fr: 'Nature des travaux', en: 'Type of work' },
  travauxAutre: { fr: 'Précisez la nature des travaux', en: 'Please specify the type of work' },
  message: { fr: 'Votre message', en: 'Your message' },
  messageHint: { fr: 'Décrivez-nous votre projet et vos besoins.', en: 'Tell us about your project and your needs.' },
  piece: { fr: 'Pièce jointe', en: 'Attachment' },
  pieceButton: { fr: 'Choisir un fichier', en: 'Choose a file' },
  pieceHint: { fr: 'PDF, JPG, PNG, DOCX ou XLSX · 10 Mo maximum', en: 'PDF, JPG, PNG, DOCX or XLSX · 10 MB maximum' },
  pieceRemove: { fr: 'Retirer le fichier', en: 'Remove file' },
  optional: { fr: 'facultatif', en: 'optional' },
  choose: { fr: 'Choisir…', en: 'Choose…' },
  direct: { fr: 'Nous joindre directement :', en: 'Reach us directly:' },
  recipient: { fr: 'Votre demande est transmise à contact@alfec.net.', en: 'Your enquiry goes to contact@alfec.net.' },
  submit: { fr: 'Envoyer la demande', en: 'Send enquiry' },
  sending: { fr: 'Envoi en cours…', en: 'Sending…' },
  honeypot: { fr: 'Ne pas remplir ce champ', en: 'Leave this field empty' },
} satisfies Record<string, Bilingual>;

export const errors = {
  required: { fr: 'Ce champ est obligatoire.', en: 'This field is required.' },
  choose: { fr: 'Choisissez une option.', en: 'Please choose an option.' },
  email: { fr: 'Saisissez une adresse e-mail valide, par exemple nom@entreprise.dz.', en: 'Enter a valid e-mail address, for example name@company.com.' },
  tel: { fr: 'Saisissez un numéro de téléphone valide (chiffres, espaces, +, parenthèses).', en: 'Enter a valid phone number (digits, spaces, +, brackets).' },
  tooShort: { fr: 'Votre message est trop court : quelques lignes suffisent.', en: 'Your message is too short: a few lines will do.' },
  tooLong: { fr: 'Ce texte est trop long.', en: 'This text is too long.' },
  fileType: { fr: 'Ce type de fichier n’est pas accepté. Formats acceptés : PDF, JPG, PNG, DOCX, XLSX.', en: 'This file type is not accepted. Accepted formats: PDF, JPG, PNG, DOCX, XLSX.' },
  fileSize: { fr: 'Le fichier dépasse 10 Mo. Envoyez une version plus légère, ou envoyez-la par e-mail.', en: 'The file is larger than 10 MB. Send a smaller file, or send it by e-mail.' },
  summary: { fr: 'Certains champs sont à corriger avant l’envoi :', en: 'Some fields need correcting before sending:' },
  server: {
    fr: 'Votre demande n’a pas pu être envoyée. Réessayez dans quelques minutes, ou écrivez-nous à contact@alfec.net.',
    en: 'Your enquiry could not be sent. Please try again in a few minutes, or write to contact@alfec.net.',
  },
  rate: {
    fr: 'Trop de demandes ont été envoyées depuis votre connexion. Réessayez dans quelques minutes, ou appelez-nous.',
    en: 'Too many enquiries were sent from your connection. Please try again in a few minutes, or call us.',
  },
  network: {
    fr: 'La connexion a échoué. Vérifiez votre accès à Internet et réessayez.',
    en: 'The connection failed. Check your internet connection and try again.',
  },
} satisfies Record<string, Bilingual>;
