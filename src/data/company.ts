import type { ImageMetadata } from 'astro';
import type { Bilingual } from '../i18n/ui';

// Company facts and copy captured from alfec.net (docs/audit/live-site-inventory.md, sections 7 and 8).
// French is the original wording; English keeps the original meaning with grammar corrected.
// Nothing here may be extended with facts the audit does not contain.

export const contact = {
  legalName: 'ALFEC Engineering Procurement Construction',
  address: {
    street: '38, Rue El Moudjahid Kacha Lahouari, Coopérative Tekkouk Adda',
    locality: 'Canastel',
    postalCode: '31000',
    city: 'Oran',
    country: { fr: 'Algérie', en: 'Algeria' } as Bilingual,
  },
  phones: [
    { label: '+213 (0)41 73 73 37', tel: '+21341737337' },
    { label: '+213 (0)41 73 73 38', tel: '+21341737338' },
  ],
  fax: { label: '+213 (0)41 73 73 39', tel: '+21341737339' },
  mobile: { label: '+213 (0)555 07 19 30', tel: '+213555071930' },
  email: 'contact@alfec.net',
  geo: { lat: 35.752182899, lng: -0.563931 },
  social: [
    { key: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/company/alfec/' },
    { key: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/AlfecDZ' },
    { key: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/channel/UCDak7qYykMomAYEgwSPs89w/' },
  ],
} as const;

export const slogan: Bilingual = {
  fr: 'Équilibre durable, continuité et innovation',
  en: 'Sustainability, continuity and innovation',
};

export const baseline = 'Engineering · Procurement · Construction';

export const story: Bilingual<string[]> = {
  fr: [
    'Début des années 2000, le marché algérien n’a cessé d’évoluer dans le génie climatique, alors en pleine expansion. Les exigences techniques des clients d’une part, et les entreprises dépourvues des structures techniques adéquates d’autre part, ont permis la création de la société ALFEC.',
    'Animée par un groupe de visionnaires, ALFEC s’est orientée progressivement vers d’autres activités et d’autres secteurs afin d’apporter les solutions les mieux adaptées aux besoins du marché algérien.',
    'L’écoute et la satisfaction de ses clients, la compétence, la créativité et l’efficacité de ses équipes, la garantie de performance et d’économie sont les moteurs de la politique qualité d’ALFEC.',
  ],
  en: [
    'In the early 2000s, the Algerian HVAC market was expanding fast. Clients’ technical requirements on one side, and companies lacking the right technical structures on the other, led to the creation of ALFEC.',
    'Driven by a group of visionaries, ALFEC gradually moved into other activities and sectors to provide the solutions best suited to the needs of the Algerian market.',
    'Listening to clients and keeping them satisfied, the competence, creativity and efficiency of its teams, and guaranteed performance and cost-effectiveness drive ALFEC’s quality policy.',
  ],
};

export const intro: Bilingual = {
  fr: 'ALFEC, une entreprise au carrefour des techniques de construction les plus innovantes, avec une prise en charge globale de corps d’états complémentaires : la ventilation, la climatisation, l’électricité, la sécurité.',
  en: 'ALFEC is a company at the crossroads of the most innovative construction techniques, taking overall charge of complementary trades: ventilation, air conditioning, electrical work and safety.',
};

export const presentation: Bilingual<string[]> = {
  fr: [
    'Opérant sur l’ensemble du territoire national, ALFEC est une jeune entreprise dynamique qui accompagne ses clients en innovant toujours plus dans ses offres, depuis la conception de leurs projets jusqu’à leur réalisation, en passant par la maintenance de leurs équipements.',
    'ALFEC se développe rapidement sur un marché très concurrentiel, en suivant une ligne directrice basée sur l’entrepreneuriat et en mettant en œuvre son savoir-faire et son expertise dans le but de créer de la valeur ajoutée pour ses clients.',
  ],
  en: [
    'Operating nationwide, ALFEC is a young, dynamic company that supports its clients with ever more innovative offers, from the design of their projects through to their completion and the maintenance of their equipment.',
    'ALFEC is growing quickly in a highly competitive market, guided by entrepreneurship and applying its know-how and expertise to create added value for its clients.',
  ],
};

/** The three competences: the project cycle ALFEC covers. Titles and short texts rewritten by ALFEC (2026-09-27). */
export const competences: { key: string; title: Bilingual; short: Bilingual; text: Bilingual }[] = [
  {
    key: 'engineering',
    title: { fr: 'Ingénierie', en: 'Engineering' },
    short: {
      fr: 'Nous étudions vos besoins et concevons la solution technique adaptée à votre projet.',
      en: 'We study your needs and design the technical solution suited to your project.',
    },
    text: {
      fr: 'ALFEC accompagne ses clients pour les études relatives à leurs projets, en partant d’idées diverses jusqu’à aboutir au meilleur concept. Lorsque la phase d’exécution commence, ses équipes compétentes et multidisciplinaires mettent à profit tout leur savoir et leur savoir-faire pour un aboutissement concluant des projets.',
      en: 'ALFEC carries out the studies its clients’ projects require, from a range of initial ideas to the best concept. When execution begins, its competent, multidisciplinary teams put all their knowledge and know-how into bringing projects to a successful conclusion.',
    },
  },
  {
    key: 'installation',
    title: { fr: 'Réalisation', en: 'Installation' },
    short: {
      fr: 'Nos équipes concrétisent cette solution sur le terrain, dans le respect des exigences du projet.',
      en: 'Our teams deliver that solution on site, in line with the project’s requirements.',
    },
    text: {
      fr: 'ALFEC réalise pour ses clients des installations techniques conformes aux normes en vigueur et qui répondent parfaitement à leurs besoins : génie climatique dans le bâtiment, le tertiaire et l’industrie, protection et détection incendie, froid industriel, installations techniques industrielles. Des équipes techniques compétentes ainsi que des moyens matériels conséquents sont mis à la disposition des projets.',
      en: 'ALFEC delivers technical installations that comply with current standards and meet its clients’ needs precisely: HVAC for buildings, offices and industry, fire protection and detection, industrial refrigeration and industrial technical installations. Competent technical teams and substantial equipment are dedicated to each project.',
    },
  },
  {
    key: 'maintenance',
    title: { fr: 'Maintenance', en: 'Maintenance' },
    short: {
      fr: 'Nous entretenons vos installations pour préserver leur performance et leur disponibilité.',
      en: 'We maintain your installations to preserve their performance and availability.',
    },
    text: {
      fr: 'ALFEC effectue l’entretien régulier de ses installations afin de réduire au maximum le risque de pannes. Des contrats de maintenance sont signés avec ses clients pour assurer le bon fonctionnement des installations et réunir les meilleures conditions pour leur maintenance.',
      en: 'ALFEC services its installations regularly to keep the risk of breakdown to a minimum. Maintenance contracts signed with its clients ensure the installations run properly and provide the best conditions for their upkeep.',
    },
  },
];

export const locationsText: Bilingual = {
  fr: 'De par la qualité de ses réalisations et l’efficacité de ses interventions, unanimement reconnues par les professionnels, ALFEC jouit aujourd’hui d’une solide réputation. Avec une direction basée à Oran, ALFEC intervient sur l’ensemble du territoire national, grâce à une force d’intervention appréciable et à des équipes de maintenance disponibles et efficaces.',
  en: 'Thanks to the quality of its work and the efficiency of its service, widely recognised by professionals, ALFEC enjoys a strong reputation. With its management based in Oran, ALFEC works across the whole country, backed by a substantial field force and available, effective maintenance teams.',
};

/** The 22 wilayas marked on the "Nos implantations" map of alfec.net (marker coordinates as published). */
export const wilayas: { name: string; lat: number; lng: number }[] = [
  { name: 'Oran', lat: 35.72116, lng: -0.557245 },
  { name: 'Alger', lat: 36.769177, lng: 3.054911 },
  { name: 'Adrar', lat: 27.970139, lng: -0.199894 },
  { name: 'Annaba', lat: 36.915012, lng: 7.752668 },
  { name: 'Constantine', lat: 36.350527, lng: 6.632652 },
  { name: 'Laghouat', lat: 33.800098, lng: 2.869715 },
  { name: 'Tlemcen', lat: 34.881941, lng: -1.308805 },
  { name: 'El Oued', lat: 33.369173, lng: 6.850245 },
  { name: 'Béchar', lat: 31.618494, lng: -2.21538 },
  { name: 'Saïda', lat: 34.833056, lng: 0.15 },
  { name: 'Mostaganem', lat: 35.933056, lng: 0.090278 },
  { name: 'Mascara', lat: 35.394444, lng: 0.139722 },
  { name: 'Tissemsilt', lat: 35.604853, lng: 1.807647 },
  { name: 'Naâma', lat: 33.171308, lng: -0.374806 },
  { name: 'Jijel', lat: 36.799722, lng: 5.766667 },
  { name: 'Bouira', lat: 36.38, lng: 3.901389 },
  { name: 'Tiaret', lat: 35.36726, lng: 1.313074 },
  { name: 'Chlef', lat: 36.164722, lng: 1.335 },
  { name: 'Boumerdès', lat: 36.766667, lng: 3.477222 },
  { name: 'Mila', lat: 36.451959, lng: 6.25859 },
  { name: 'Béjaïa', lat: 36.75, lng: 5.083056 },
  { name: 'Guelma', lat: 36.466111, lng: 7.433889 },
];

export const sectors: { key: string; name: Bilingual }[] = [
  { key: 'batiment', name: { fr: 'Bâtiment', en: 'Buildings' } },
  { key: 'tertiaire', name: { fr: 'Tertiaire', en: 'Commercial' } },
  { key: 'hopitaux', name: { fr: 'Hôpitaux', en: 'Hospitals' } },
  { key: 'hotellerie', name: { fr: 'Hôtellerie', en: 'Hotels' } },
  { key: 'industrie', name: { fr: 'Industrie', en: 'Industry' } },
  { key: 'agroalimentaire', name: { fr: 'Agroalimentaire', en: 'Food processing' } },
];

export const sectorsText: Bilingual = {
  fr: 'Grâce à une stratégie globale et multidisciplinaire, ALFEC intervient dans différents secteurs d’activité, du bâtiment à l’industrie. Sa maîtrise des technologies de réfrigération lui a ouvert l’agroalimentaire, la pharmacie et la pétrochimie.',
  en: 'Through a global, multidisciplinary strategy, ALFEC works across many sectors, from buildings to industry. Its command of refrigeration technology has opened up the food-processing, pharmaceutical and petrochemical sectors.',
};

export const commitments: Bilingual<string[]> = {
  fr: [
    'ALFEC intègre les préoccupations sociales, environnementales et économiques inhérentes à ses différentes activités.',
    'Consciente des défis énergétiques actuels et des problèmes d’environnement inhérents au développement humain, ALFEC a pour objectif principal le développement durable des territoires sur lesquels elle opère.',
  ],
  en: [
    'ALFEC takes into account the social, environmental and economic issues raised by all of its activities.',
    'Aware of today’s energy challenges and of the environmental problems that come with human development, ALFEC’s main objective is the sustainable development of the regions where it operates.',
  ],
};

export const approach: Bilingual<string[]> = {
  fr: [
    'Les entreprises et les institutions évoluent dans des environnements particuliers, propres à chacune d’entre elles. C’est sur la base de cette constatation fondamentale qu’ALFEC offre des solutions personnalisées.',
    'Grâce à une approche pluridisciplinaire englobant le génie climatique, l’électricité et la régulation, la protection incendie, la réfrigération, ALFEC est capable d’assurer un rendement énergétique optimal en respectant les budgets alloués ainsi que les délais de réalisation.',
  ],
  en: [
    'Businesses and institutions each operate in an environment of their own. It is on this fundamental observation that ALFEC builds tailored solutions.',
    'Through a multidisciplinary approach spanning HVAC, electrical work and controls, fire protection and refrigeration, ALFEC delivers optimal energy performance while respecting allocated budgets and completion deadlines.',
  ],
};

/** Client testimonials, supplied by ALFEC with each client's consent. The home page shows the section only once this has entries. */
export const testimonials: { quote: Bilingual; name: string; role: Bilingual }[] = [];

/** Partner brands, supplied by ALFEC (logo files under src/assets/partners). The home page shows the row only once this has entries. */
export const partners: { name: string; logo: ImageMetadata }[] = [];
