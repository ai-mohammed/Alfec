import type { Bilingual } from '../i18n/ui';
import { TRADE_KEYS } from '../i18n/routes.mjs';
import type { PhotoKey } from './photos';

export type TradeKey = (typeof TRADE_KEYS)[number];

export type Trade = {
  key: TradeKey;
  number: string;
  name: Bilingual;
  /** One line, derived from the trade's own description. */
  summary: Bilingual;
  /** The trade description published on alfec.net. */
  body: Bilingual<string[]>;
  /** Scope items named in the description. */
  scope: Bilingual<string[]>;
  cover: PhotoKey;
  gallery: PhotoKey[];
};

export const trades: Trade[] = [
  {
    key: 'climatique',
    number: '01',
    name: { fr: 'Génie climatique', en: 'HVAC' },
    summary: {
      fr: 'Climatisation, chauffage central et ventilation mécanique, avec des gaz réfrigérants écologiques.',
      en: 'Air conditioning, central heating and mechanical ventilation, with environmentally friendly refrigerants.',
    },
    body: {
      fr: [
        'En tant que leader en génie climatique, ALFEC vous offre une prestation de qualité et un service personnalisé pour différents systèmes de climatisation. Tous nos équipements utilisent des gaz réfrigérants écologiques.',
        'Nous vous offrons en outre des solutions performantes pour le chauffage central et la ventilation mécanique, à même de répondre efficacement à toutes vos exigences techniques.',
      ],
      en: [
        'As a leader in climate engineering, ALFEC provides quality work and a personalised service across a range of air-conditioning systems. All our equipment uses environmentally friendly refrigerant gases.',
        'We also offer high-performance solutions for central heating and mechanical ventilation, able to meet all of your technical requirements.',
      ],
    },
    scope: {
      fr: ['Climatisation', 'Chauffage central', 'Ventilation mécanique'],
      en: ['Air conditioning', 'Central heating', 'Mechanical ventilation'],
    },
    cover: 'maintenanceToiture',
    gallery: ['centraleTraitementAir', 'groupeFroidToiture', 'couloirClimatise', 'plateauBureaux', 'splitsFacade', 'toitureGaines'],
  },
  {
    key: 'incendie',
    number: '02',
    name: { fr: 'Protection & détection incendie', en: 'Fire protection & detection' },
    summary: {
      fr: 'Protection incendie conforme aux normes en vigueur en Algérie et détection alliant fiabilité et efficacité.',
      en: 'Fire protection in full compliance with Algerian standards, and detection combining reliability and efficiency.',
    },
    body: {
      fr: [
        'En matière de protection contre l’incendie, ALFEC vous assure un respect total des normes en vigueur en Algérie ; la compétence des équipes chargées des installations est un gage sérieux pour la protection des personnes et de l’environnement.',
        'En matière de détection d’incendie, ALFEC vous propose une gamme de nouvelles technologies alliant fiabilité et efficacité.',
      ],
      en: [
        'For fire protection, ALFEC ensures full compliance with the standards in force in Algeria; the competence of the teams in charge of the installations is a serious guarantee for the protection of people and the environment.',
        'For fire detection, ALFEC offers a range of new technologies combining reliability and efficiency.',
      ],
    },
    scope: {
      fr: ['Protection incendie', 'Détection incendie'],
      en: ['Fire protection', 'Fire detection'],
    },
    cover: 'vannesIncendie',
    gallery: ['vannesIncendie', 'pompesIncendie', 'centraleDetection', 'centraleDePression'],
  },
  {
    key: 'desenfumage',
    number: '03',
    name: { fr: 'Désenfumage', en: 'Smoke control' },
    summary: {
      fr: 'Des installations fiables et certifiées, nécessaires et obligatoires dans les ERP et les IGH.',
      en: 'Reliable, certified installations, required in public-access and high-rise buildings.',
    },
    body: {
      fr: [
        'ALFEC est un pionnier du désenfumage en Algérie. Elle conçoit des installations fiables et conformes aux normes en vigueur dans le pays.',
        'Le désenfumage est devenu nécessaire et obligatoire en Algérie dans les établissements recevant du public (ERP) et les immeubles de grande hauteur (IGH). Tous les équipements installés par ALFEC dans ce domaine sont certifiés.',
      ],
      en: [
        'ALFEC is a pioneer of smoke control in Algeria. It designs reliable installations that comply with the country’s standards.',
        'Smoke control has become necessary and mandatory in Algeria in buildings open to the public (ERP) and high-rise buildings (IGH). All the equipment ALFEC installs in this field is certified.',
      ],
    },
    scope: {
      fr: ['Désenfumage des ERP', 'Désenfumage des IGH', 'Équipements certifiés'],
      en: ['Public-access buildings (ERP)', 'High-rise buildings (IGH)', 'Certified equipment'],
    },
    cover: 'desenfumageEquipe',
    gallery: ['desenfumageEquipe', 'ventilateurDesenfumage', 'exutoireToiture', 'gaineDesenfumage', 'plafondGaines'],
  },
  {
    key: 'electricite',
    number: '04',
    name: { fr: 'Électricité & régulation', en: 'Electrical & controls' },
    summary: {
      fr: 'Installations électriques et outils de régulation, pour des solutions globales, automatisées et au moindre coût.',
      en: 'Electrical installations and control systems for comprehensive, automated, cost-effective solutions.',
    },
    body: {
      fr: [
        'ALFEC met au service de sa clientèle une ingénierie de précision ainsi que des équipements de dernière génération afin d’assurer à ses projets un franc succès.',
        'Les différentes équipes d’ALFEC opèrent au rythme de cette démarche, notamment pour les installations électriques et les outils de régulation, avec au final des solutions globales, automatisées et au moindre coût.',
      ],
      en: [
        'ALFEC brings its clients precision engineering and state-of-the-art equipment to make their projects a clear success.',
        'ALFEC’s teams work to the same approach, particularly on electrical installations and control systems, delivering comprehensive, automated and cost-effective solutions.',
      ],
    },
    scope: {
      fr: ['Installations électriques', 'Régulation', 'Automatisation'],
      en: ['Electrical installations', 'Controls', 'Automation'],
    },
    cover: 'techniciensArmoires',
    gallery: ['techniciensArmoires', 'armoireCommande', 'coffretsRegulation', 'cablageDisjoncteurs', 'armoiresBasseTension'],
  },
  {
    key: 'froid',
    number: '05',
    name: { fr: 'Froid industriel', en: 'Industrial refrigeration' },
    summary: {
      fr: 'La maîtrise des technologies de réfrigération, au service de l’agroalimentaire, de la pharmacie et de la pétrochimie.',
      en: 'Refrigeration technology for food processing, pharmaceuticals and petrochemicals.',
    },
    body: {
      fr: [
        'Forte de son expérience et de la compétence de son personnel, ALFEC a su conquérir, grâce à sa maîtrise des technologies de réfrigération, différents secteurs d’activité comme l’agroalimentaire, la pharmacie et la pétrochimie.',
      ],
      en: [
        'Building on its experience and the competence of its staff, ALFEC’s command of refrigeration technology has won it work in sectors such as food processing, pharmaceuticals and petrochemicals.',
      ],
    },
    scope: {
      fr: ['Agroalimentaire', 'Pharmacie', 'Pétrochimie'],
      en: ['Food processing', 'Pharmaceuticals', 'Petrochemicals'],
    },
    cover: 'chambreFroideEvaporateurs',
    gallery: ['chambreFroideEvaporateurs', 'chambreFroide', 'porteChambreFroide', 'tourRefroidissement'],
  },
  {
    key: 'industriel',
    number: '06',
    name: { fr: 'Génie industriel', en: 'Industrial engineering' },
    summary: {
      fr: 'Réservoirs de stockage, piping et serres multichapelles, avec des partenaires locaux et internationaux.',
      en: 'Storage tanks, piping and multi-span greenhouses, with local and international partners.',
    },
    body: {
      fr: [
        'Pour étendre ses activités et répondre aux besoins du marché national, ALFEC s’est orientée progressivement vers le secteur de l’industrie : réservoirs de stockage, piping, serres multichapelles.',
        'Sa capacité de gestion de projets et sa politique de partenariat avec des sociétés locales et internationales permettent à ALFEC de proposer des solutions adéquates et efficaces, qui répondent parfaitement aux besoins de ses clients.',
      ],
      en: [
        'To extend its activities and meet the needs of the national market, ALFEC has gradually moved into industry: storage tanks, piping and multi-span greenhouses.',
        'Its project-management capability and its partnerships with local and international companies allow ALFEC to propose appropriate, effective solutions that meet its clients’ needs precisely.',
      ],
    },
    scope: {
      fr: ['Réservoirs de stockage', 'Piping', 'Serres multichapelles'],
      en: ['Storage tanks', 'Piping', 'Multi-span greenhouses'],
    },
    cover: 'reservoirsT14b',
    gallery: ['reservoirsT14b', 'reservoirsSousPression', 'localPompesCalorifuge', 'pipingCalorifuge', 'echangeurCalorifuge'],
  },
];

export const tradesByKey = Object.fromEntries(trades.map((t) => [t.key, t])) as Record<TradeKey, Trade>;
