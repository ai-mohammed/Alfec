# alfec.net — live-site audit and behavioral inventory

Captured 2026-09-26 from the production site `https://alfec.net/`. The repository contained no
source code at capture time, so everything below was observed from outside: served HTML, the
client script `js/custom.js`, the AJAX endpoints it calls, and rendering in a real browser.
Raw capture: `.snapshot/alfec.net-2026-09-26/` (git-ignored; it contains third-party agency code).

This file is the source material for the behavioral contract (Unspaghettit adoption). Each
behavior is tagged:

- **KEEP**: behavior that must stay compatible after the redesign
- **IMPL**: implementation detail that may be replaced
- **VISUAL**: presentation that will be redesigned
- **BUG**: current defect; do not carry it forward
- **UNKNOWN**: server-side logic we can't see without the PHP source

---

## 1. Architecture (observed)

| Aspect | Finding |
|---|---|
| Server | nginx, PHP (custom CMS built by the agency Naltis, `naltis.com`) |
| Rendering | Server-rendered PHP single page (`index.php`) + HTML fragments loaded by jQuery `.load()` |
| Content source | CMS database (images stored as `ressources/fichiers_produits/fichier_produit_<id>.<ext>`) |
| Back office | Not visible. `robots.txt` lists `/webmaster/`, `/_sql/`, `/_template/` |
| Front-end libraries | jQuery 3.1.1, GSAP TweenMax + CustomEase, Revealer (page-transition layers), OwlCarousel 2.2.1 (loaded but unused), Slick, Magnific Popup, mCustomScrollbar, Font Awesome 4.7 (loaded twice), Modernizr |
| Fonts | Raleway (self-hosted, 300/400/500/italic), script slogan rendered as PNG |
| Third parties | Google Maps JS API (key in page), reCAPTCHA v2, Google Analytics Universal `UA-104150153-1`, Naltis tracking pixel (`http://nws.naltis.com/...`) |
| Localization | Query parameter `lg=fr|en`; server renders language-specific copy; JS reads `lg` again for AJAX calls |
| Hosting behavior | `http://` and `www.` 301 to `https://alfec.net/…` (query string preserved); HSTS 1 year; custom 404 page |

## 2. Endpoints

| Endpoint | Method | Returns | Used by | Tag |
|---|---|---|---|---|
| `/` , `/index.php` | GET | Full page, FR | entry | KEEP (URL) |
| `/index.php?lg=fr` / `?lg=en` | GET | Full page, FR / EN | language switch, sitemap | KEEP (URL) |
| `/index.php?msg=success` / `?msg=success_en&lg=en` | GET | Page with contact panel open and a success message instead of the form | post-submit landing | KEEP (outcome), IMPL (mechanism) |
| `/quisommesnous.php?lg=` | GET | HTML fragment "Qui sommes-nous ?" | reloaded into panel 2 on every panel change | IMPL |
| `/presentation.php?lg=` | GET | Fragment "Notre Identité": Présentation, Engineering, Réalisations, Maintenance | sub-menu | IMPL (content KEEP) |
| `/domaines.php?lg=` | GET | Fragment "Nos implantations" | sub-menu | IMPL (content KEEP) |
| `/galerie.php?lg=` | GET | Fragment "Galerie": categorized project photos | sub-menu | IMPL (content KEEP) |
| `/actualites.php?lg=` | GET | Fragment "Actualités": 4 posts, 2017–2018 | sub-menu | IMPL |
| `/metiers.php?pageName=<key>&lg=` | POST (GET also works) | JSON `{nom, text, pictures[]}`, content-type `text/html` | métiers overlay | IMPL (content KEEP) |
| `/contact/mail.php` | POST multipart | Sends the enquiry; presumably redirects to `?msg=success[_en]` | contact form | KEEP (contract), UNKNOWN (internals) |

Métier keys (FR / EN): `Génie17`/`HVAC17`, `Protection19`/`Fire19`, `Désenfumage84`/`Smoke84`,
`Electricité18`/`Electricity18`, `Froid20`/`Refrigeration20`, `Génie85`/`Industrial85`; `met` returns the default photo set.

## 3. Routing and indexed URLs

- **B01 KEEP.** `https://alfec.net/` serves the French site.
- **B02 KEEP.** `/index.php?lg=fr` serves French, `/index.php?lg=en` serves English; any other or missing
  `lg` falls back to French. These three URLs are the only ones in `sitemap.xml` and must keep resolving
  (200, or a 301 to their new canonical equivalents).
- **B03 KEEP.** `http://` and `www.` variants redirect permanently to `https://alfec.net/` with path and query preserved.
- **B04 IMPL.** The site is one page of five panels (0 Accueil, 1 Qui sommes-nous, 2 Nos Secteurs,
  3 Nos Engagements, 4 Contact). Menu hrefs (`#Accueil`, `#Qui_sommes-nous`, `#Metiers`,
  `#Secteurs_interventions`, `#Offres`, `#contact`) are not real routes: JS intercepts clicks by index.
  Opening a URL with one of these hashes does **not** open that panel, so no section is deep-linkable today.
  Sub-pages (Identité, Implantations, Galerie, Actualités) have no URL at all and aren't indexable.
- **B05 KEEP (outcome).** Any `msg` query parameter opens the Contact panel on load. `msg=success` (FR) and
  `msg=success_en` (EN) replace the form with the confirmation message. Any other value (e.g. `msg=error`)
  shows the normal form with **no error message** (BUG / missing error state).

## 4. Navigation and page relationships

- **B06 VISUAL.** Desktop: fixed left sidebar (logo, current-panel label, "Nous contacter" button, social icons,
  language flags); right edge hover-reveal vertical menu with six entries; a "next" pill on each panel making a
  linear tour: Accueil → Qui sommes-nous → Secteurs d'intervention → Nos Engagements → Contact.
- **B07 KEEP (relationship).** Home offers four entry points (Qui sommes-nous ?, Nos métiers, Nos Secteurs,
  Nos Engagements), each with a teaser line, each leading to its full section.
- **B08 KEEP (content + ability to browse per métier), VISUAL (overlay).** "Nos métiers" opens a full-screen
  overlay: intro text, list of the six métiers, photo strip. Selecting a métier swaps title, description and
  photos (up to 4 visible, the rest reachable in the lightbox). Selecting the "Nos métiers" title restores the intro.
- **B09 KEEP (content), IMPL (AJAX).** "Qui sommes-nous ?" shows the company story plus a sub-menu:
  Notre Identité / Nos implantations / Galerie / Actualités (EN: Profile / Our Locations / Gallery / What's New),
  each replacing the panel content via AJAX. Every fragment ships `js/innercustom.js`, which re-binds the sub-menu,
  lightboxes, slider and image switcher after each load (and re-binds the home-card hovers again each time).
  Four-image switcher: only three thumbnails are wired (BUG). "Nos implantations" loads a second copy of the Google
  Maps API and draws a map of 22 wilayas (see §7), each marker opening an info window with a city photo.
- **B10 KEEP (content).** Secteurs: six sectors (Bâtiment, Tertiaire, Hôpitaux, Hôtellerie, Industrie,
  Agro-alimentaire); hover reveals a photo; click opens a lightbox of all six.
- **B11 KEEP (content).** Engagements: commitments text + 4-image slider with lightbox.
- **B12 KEEP.** Contact section: head-office address, phones, fax, mobile, e-mail, map of the head office,
  enquiry form.
- **B13 KEEP (usability), VISUAL.** Mobile keeps the same one-panel-at-a-time model (the current panel scrolls
  internally; the document itself doesn't scroll). Top bar: logo, social icons, language flags; blue bar with the
  current section name and a three-line menu trigger. The six-entry menu (Accueil, Qui sommes-nous ?, Nos métiers,
  Nos secteurs d'intervention, Nos engagements, Nous contacter) opens on CSS `:hover` only, on desktop (right edge)
  and on touch (tap-emulated hover). It has no close control, no keyboard access and no ARIA state (BUG). No horizontal
  overflow observed at 375px.
- **B14 KEEP.** Language switch present on every view, both desktop and mobile. Only the inactive language is
  a link. Switching reloads the page in the other language at home (current section is lost: acceptable to
  improve by switching to the equivalent section).
- **B15 KEEP.** Logo returns to home.
- **B16 KEEP.** External links open in a new tab: Facebook `https://www.facebook.com/AlfecDZ`,
  YouTube `https://www.youtube.com/channel/UCDak7qYykMomAYEgwSPs89w/`, LinkedIn `https://www.linkedin.com/company/alfec/`.
  Missing `rel="noopener"` (BUG). Footer credit link to `http://www.naltis.com` (`rel=author` in head).
- **B17 KEEP (enlarge photos), IMPL (Magnific Popup).** Photo sets open in a lightbox with next/previous.

## 5. Contact form contract

`<form id="contact_form" method="post" action="contact/mail.php" enctype="multipart/form-data">`

| Name | Control | Required (HTML) | FR label | EN label | Notes |
|---|---|---|---|---|---|
| `form_canvas` | hidden | — | — | — | `contact` (FR) or `contact_en` (EN), set by JS on submit click; server likely uses it for language of redirect/template |
| `nom` | text | yes | Nom & Prénom | First & Last Name | |
| `organisme` | text | no | Organisme | Organization | |
| `ville` | text | yes | Ville | City | |
| `pays` | select | no | ~190 countries, French names only, default "Algérie" | same French list | EN page shows French country names (BUG) |
| `sectur_activite` | select | yes* | Activité: Bâtiment, Hôtellerie, Industrie, Agroalimentaire, Santé, Autre | Activity: Buildings, Hotel, Industry, Food, Health, Other | typo in name is part of the server contract |
| `tel` | text | yes | Téléphone | Phone | |
| `fax` | text | no | Fax | Fax | |
| `mobile` | text | yes | Mobile | Mobile | |
| `vous_etes` | select | yes* | Vous êtes ?: Maître d'œuvre, Maître d'ouvrage, société générale de bâtiment, Collectivité Locale, Autre | You are?: Project manager, Owner, Society, Local collectivity, Other | |
| `nature_travaux` | select | yes* | Nature des travaux: Travaux Neufs, Maintenance, Autre | Work field: New construction, Maintenance, Other | |
| `email` | email | yes | e-mail | e-mail | |
| `adresse` | text | no | Adresse | Address | |
| `message` | textarea | yes | Message | Message | |
| `piece` | file (single) | no | Pièce jointe | Attached file | no `accept`, no client size limit; tooltip "Décrivez nous votre projet et vos besoins" |
| `g-recaptcha-response` | reCAPTCHA v2 checkbox | yes (JS) | — | — | unchecked → "Veuillez cocher le reCaptcha ci-dessous" (also shown in French on EN page: BUG) |
| `contact` | submit | — | Envoyer | Send | |

\* The placeholder option has no `value`, so its text is submitted and `required` never blocks (BUG).
"Autre" options reveal a free-text input whose text replaces the option value (**KEEP**: the enquirer can
describe a category that isn't listed).

- **B20 KEEP.** Required information before sending: name, city, phone, mobile, activity, role, nature of work,
  valid e-mail, message, human check.
- **B21 KEEP.** One optional attachment can accompany the enquiry.
- **B22 KEEP.** After a successful send the visitor sees, in their language:
  FR "Votre message a été bien envoyé. Nous vous répondrons dès que possible."
  EN "Your message has been sent. We will answer you as soon as possible."
  The form is not shown again in that state.
- **B23 missing.** No error state exists (server failure, captcha failure, invalid upload). The redesign must add one.
- **UNKNOWN:** server-side validation, reCAPTCHA verification, upload type/size limits, filename handling,
  storage of uploads, destination mailbox, e-mail format, whether `form_canvas` selects the redirect language.
  These need `contact/mail.php` to confirm.

## 6. SEO state

| Item | FR | EN |
|---|---|---|
| `<html lang>` | `fr` | `en` |
| Title | Alfec Oran Froid industriel Climatisation Protection incendie | Alfec Oran HVAC Engineering Fire protection and security |
| Description | Alfec - Équilibre durable Construction, génie-climatique, froid et électricité, protection d'incendie, sécurité, traitement d'air désenfumage | Alfec - Oran HVAC Frigorific Warehouse, Industrial engineering, installation & maintenance of HVAC, Fire protection, Security equipment, Electricity, regulation |
| `og:locale` | fr | fr (BUG) |
| canonical / hreflang | none | none |
| Headings | one `h1` hidden inside panel 2; `h3` for card titles | same |

- JSON-LD `Organization` "ALFEC Engineering Procurement Construction", with address, phones, fax, e-mail and
  `sameAs`, but malformed: `Address`/`Telephone` are capitalized (invalid properties), nested inside `logo`,
  and the logo URL has leading/trailing spaces.
- `sitemap.xml`: 3 URLs (`/`, `?lg=en`, `?lg=fr`), lastmod 2021-06-28, image entries.
- `robots.txt`: `Crawl-delay: 10`; lists page URLs as `Sitemap:` entries (invalid); exposes `/_sql/` and `/webmaster/` paths.
- Viewport sets `maximum-scale=1` (blocks pinch-zoom: accessibility BUG). Slogan is an image with no alt text.
  No image on the site has alt text; sector icons are Font Awesome glyphs.

## 7. Company facts (verbatim sources for the rebuild)

Nothing beyond this list may be stated as fact without confirmation.

- Name: **alfec** (logotype lowercase); legal/structured name "ALFEC Engineering Procurement Construction";
  logo baseline "Engineering • Procurement • Construction". Also "EURL ALFEC" on the 2018 NAPEC stand signage.
- Slogan (image): FR "Equilibre durable, Continuité et Innovation" / EN "Sustainability, Continuity and Innovation".
- Founded in the early 2000s (no exact year given).
- Head office: 38, Rue El Moudjahid Kacha Lahouari, Coopérative Tekkouk Adda, Canastel 31000 Oran – Algérie.
  Map point: 35.752182899, -0.563931.
- Tél. +213 (0)41 737 337 / 338 · Fax +213 (0)41 737 339 · Mobile +213 (0)555 071 930 · contact@alfec.net
- Operates nationwide ("sur l'ensemble du territoire national"), direction based in Oran.
- "Nos implantations" map marks 22 wilayas: Oran, Alger, Adrar, Annaba, Constantine, Laghouat, Tlemcen, El Oued,
  Béchar, Saïda, Mostaganem, Mascara, Tissemsilt, Naâma, Jijel, Bouira, Tiaret, Chlef, Boumerdès, Mila, Béjaïa,
  Guelma (marker coordinates in `.snapshot/.../frag/domaines_fr.html`). The site doesn't say whether these are
  project sites or presence; the page text frames them as where ALFEC intervenes.
- Six métiers: Génie Climatique; Protection & Détection Incendie; Désenfumage; Electricité & Régulation;
  Froid Industriel; Génie Industriel.
- Three competences: Engineering (studies/design), Réalisations (installation), Maintenance (maintenance contracts).
- Six sectors: Bâtiment, Tertiaire, Hôpitaux, Hôtellerie, Industrie, Agro-alimentaire. Froid Industriel text also
  names agroalimentaire, pharmacie, pétrochimie.
- Existing self-descriptions (company's own claims, keep verbatim if used): "leader en génie climatique";
  "pionnier dans le domaine du désenfumage en Algérie"; "Tous les équipements installés … dans ce domaine sont
  certifiés"; "tous nos équipements utilisent des gaz réfrigérants écologiques"; "respect total des normes en
  vigueur en Algérie"; "partenariat avec des sociétés locales et internationales".
- Events: NAPEC (North Africa Petroleum Exhibition & Conference) 2018, stand B4-16/B4-17, 25–28 March 2018,
  Centre de conventions d'Oran; visit of the Minister of Energy and the Wali of Oran (28 March 2018).
- Photo titles that imply named projects (**unverified**, need confirmation before use as references):
  "sonelgaz Tiaret" (#136), "Banque BEA - Oran" (#138), "Ventilation Central Hôpital" (#159, stock image),
  "Centrale de Pression" (#137).

## 8. Content inventory (FR / EN)

### Home teasers
- **Qui sommes-nous ?** / Our Company — FR: "alfec, une entreprise au carrefour des techniques de construction les
  plus innovantes... Avec une prise en charge globale de corps d'états complémentaires comme la ventilation, la
  climatisation, l'électricité, la sécurité..." EN: "alfec, a company at the crossroads of the most innovative
  construction techniques... Thanks to a global management of complementary fields such as HVAC, fire protection,
  electricity, refrigeration..."
- **Nos métiers** / Our Jobs — FR: "Depuis sa création, alfec œuvre à proposer des offres intégrées à sa clientèle
  suite à des diagnostics précis de leurs équipements et de leurs attentes. Grâce à la maitrise de plusieurs corps
  de métiers…" EN: "Since its creation, alfec has been aiming at offering integrated solutions to customers,
  following precise diagnosis of their equipment and considering thoroughly their needs …"
- **Nos Secteurs** / Our Sectors — FR: "Grâce à une stratégie globale et multidisciplinaire, alfec investit
  différents secteurs d'activités dont le Bâtiment, le Tertiaire, les Hôpitaux, etc." EN: "Thanks to a global and
  multidisciplinary strategy, alfec invests in various sectors of activity, including Construction, the Tertiary
  sector, Hospitals, etc."
- **Nos Engagements** / Our Commitments — FR: "La société alfec intègre les préoccupations sociales,
  environnementales et économiques inhérentes à ses différentes …" EN: "The company alfec integrates the social,
  environmental and economic concerns inherent caused by its different ..."

### Qui sommes-nous ? / Our Company
FR:
1. Début des années 2000, le marché Algérien n'a pas cessé d'évoluer dans le génie climatique qui était en pleine
   expansion. Les exigences techniques des clients d'une part et les entreprises dépourvues des structures
   techniques adéquates d'autre part, ont permis la création de la société alfec.
2. Animée par un groupe de visionnaires, alfec s'est orientée progressivement vers d'autres activités et d'autres
   secteurs afin d'apporter des solutions les mieux adaptées aux besoins du marché Algérien.
3. L'écoute et la satisfaction de ses clients, la compétence, la créativité et l'efficacité de ses équipes, la
   garantie de performance et d'économie sont les moteurs de la politique qualité d'alfec.

EN:
1. Early 2000s, The Algerian market has not ceased to evolve in the climatic engineering which was in full
   expansion. The technical requirements of the customers on the one hand and the companies deprived of the
   adequate technical structures on the other hand, allowed the creation of the company alfec.
2. Driven by a group of visionaries, alfec has gradually moved towards other activities and other sectors in order
   to provide solutions that are best suited to the needs of the Algerian market.
3. The listening and satisfaction of its customers, the competence, creativity and efficiency of its teams, the
   guarantee of performance and economy are the drivers of alfec's quality policy.

### Notre Identité / Profile (presentation.php)
- **Présentation** — FR: "Opérant sur l'ensemble du territoire national, alfec est une jeune entreprise dynamique
  qui accompagne ses clients en innovant toujours plus dans ses offres, depuis la conception de leurs projets
  jusqu'à leur réalisation, en passant par la maintenance de leurs équipements." / "alfec se développe rapidement
  sur un marché très concurrentiel, en suivant une ligne directrice basée sur l'entreprenariat et en mettant en
  œuvre son savoir-faire et son expertise dans le but de créer de la valeur ajoutée pour ses clients."
  EN: "Operating nationwide, alfec is a young dynamic company that handles its customers needs by innovating
  everytime more from the conception of their projects to their realization as well as regards to the maintenance
  of their equipment." / "alfec is rapidly developing in a very competitive market, following a guideline based on
  entrepreneurship while applying its know-how and expertise in order to create added value for its customers."
- **Nos Compétences / Our Skills**
  - **Engineering** — FR: "alfec accompagne ses clients pour les études relatives à leurs projets, en partant
    d'idées diverses jusqu'à aboutir au meilleur concept. Lorsque la phase d'exécution commence, ses équipes
    compétentes et multidisciplinaires mettent à profit tout leur savoir et leur savoir-faire pour un aboutissement
    concluant des projets." EN: "alfec carries out, for customers, studies they need for their projects, starting
    from various ideas until reaching the best concept. When the implementation phase begins, its competent and
    multidisciplinary teams make full use of their knowledge and know-how for successful completion of projects."
  - **Réalisations / Achievements** — FR: "alfec réalise pour ses clients des installations techniques conformément
    aux normes en vigueur et qui répondent parfaitement à leurs besoins telles que : les installations techniques
    relatives au génie climatique dans le bâtiment, le tertiaire, l'industrie ; Installations techniques pour la
    protection et la détection incendie ; Installations techniques pour le froid industriel ; Installations
    techniques industrielles. Des équipes techniques compétentes en la matière ainsi que des moyens matériels
    conséquents sont mis à la disposition des projets." EN: "alfec carries out technical installations for its
    customers in accordance with current standards so as to perfectly meet their needs, such as: technical
    installations related to climate engineering in the construction, industry, the tertiary sector; Technical
    installations for fire protection and detection; Technical installations for industrial refrigeration;
    Industrial technical installations. Technical teams are competent in these different fields ans are dedicated
    to projects, as well as important equipments."
  - **Maintenance** — FR: "alfec effectue l'entretien régulier de ses installations dans le but de réduire au
    maximum le risque des pannes. Dans cette optique, des contrats de maintenance sont signés entre alfec et ses
    différents clients avec pour objectifs, d'une part assurer le bon fonctionnement des installations, et d'autre
    part fournir les meilleures conditions pour procéder à leur maintenance" EN: "alfec carries out the regular
    maintenance of its installations in order to minimize the risk of breakdowns. In this context, maintenance
    contracts are signed between alfec and its various customers with the aim of ensuring the proper functioning of
    the installations and, on the other hand, providing the best conditions for their maintenance."

### Nos implantations / Our Locations (domaines.php)
FR: "De par la qualité de ses réalisations et l'efficacité de ses interventions, unanimement reconnues par les
professionnels, alfec jouit aujourd'hui d'une solide réputation. Avec une direction basée à Oran, alfec intervient
aujourd'hui sur l'ensemble du territoire national, grâce à une force d'intervention appréciable et des équipes de
maintenance disponibles et efficaces."
EN: "As acknowledged by professionals and thanks to the quality of its achievements, alfec is boasting a strong
reputation. With headquarters based in Oran, alfec carries out various projects in different parts of the country
thanks to an effective taskforce with high-skilled maintenance teams."
(Accompanied by a Google map with 22 wilaya markers, each info window showing a generic city photo #133–#184.)

### Nos métiers / Our Jobs
Intro FR: "Les entreprises et les institutions évoluent dans des environnements particuliers, propres à chacune
d'entre elles. C'est sur la base de cette constatation fondamentale qu'alfec offre des solutions personnalisées.
Grâce à une approche pluridisciplinaire, englobant les volets du génie climatique, de l'électricité et de la
régulation, de la protection incendie, de la réfrigération, etc. alfec est capable d'assurer un rendement
énergétique optimal en respectant les budgets alloués ainsi que les délais de réalisation."
Intro EN: "Businesses and institutions operate in specific environments that are unique to each one of them. It is
on the basis of this fundamental observation that the company offers customized solutions. Through a
multidisciplinary approach, encompassing climate engineering, electricity and regulation, fire protection,
refrigeration, etc. alfec is able to ensure optimal energy efficiency while respecting allocated budgets as well as
deadlines."

| # | FR | EN (current) | Photos |
|---|---|---|---|
| 01 | Génie Climatique | HVAC | 197, 250, 195, 212, 63 |
| 02 | Protection & Détection Incendie | Fire protection and detection | 198, 211, 62, 221, 61 |
| 03 | Désenfumage | Smoke detection (mistranslation: should be smoke extraction/control) | 148, 199, 151, 200 |
| 04 | Electricité & Régulation | Electricity and Regulation | 201, 202, 67, 251, 203, 254, 70 |
| 05 | Froid Industriel | Refrigeration | 207, 204, 206, 205, 53 |
| 06 | Génie Industriel | Industrial Engineering | 214, 217, 213, 222, 215, 216 |

- **Génie Climatique** — FR: "En tant que leader en génie climatique, alfec vous offre une prestation de qualité et
  un service personnalisé pour différents systèmes de climatisation. Il est à noter que tous nos équipements
  utilisent des gaz réfrigérants écologiques. En outre, nous vous offrons des solutions performantes pour le
  chauffage central et la ventilation mécanique, à même de répondre efficacement à toutes vos exigences
  techniques." EN: "As a leader in climate engineering, alfec offers you top quality services in different air
  conditioning systems. As a matter of fact, all our equipment uses environment friendly refrigerant gases. In
  addition, we offer high-performance solutions for central heating and mechanical ventilation, able to meet all
  of your technical requirements."
- **Protection & Détection Incendie** — FR: "En ce qui concerne la protection contre l'incendie, alfec vous assure
  un respect total des normes en vigueur en Algérie ; la compétence des équipes chargées des installations étant un
  gage sérieux pour la protection des personnes et de l'environnement. En ce qui concerne la détection d'incendie,
  alfec vous propose une gamme de nouvelles technologies alliant fiabilité et efficacité." EN: "As far as fire
  protection is concerned, alfec ensures full compliance with Algerian standards. Indeed, high-skilled teams are
  responsible for the installations and allow therefore a serious guarantee for the protection of people and the
  environment. As regards to fire detection, alfec offers you a range of new technologies, combining reliability
  and efficiency."
- **Désenfumage** — FR: "La société alfec est un pionnier dans le domaine du désenfumage en Algérie. Elle conçoit des
  installations fiables et en conformité avec les normes en vigueur en pays. Le désenfumage devient nécessaire et
  obligatoire en Algérie dans les établissements ERP et IGH. Tous les équipements installés par la société alfec
  dans ce domaine sont certifiés." EN: "The company alfec is a pioneer in the field of smoke extraction in Algeria.
  It designs reliable installations all in compliance with national standards. Smoke extraction becomes necessary
  and obligatory in ERP and IGH in Algeria. All equipment installed by alfec in this domain are certified."
- **Electricité & Régulation** — FR: "alfec met au service de sa clientèle une ingénierie de précision ainsi que des
  équipements de dernière génération afin d'assurer à leurs projets un franc succès. Les différentes équipes
  d'alfec opèrent au rythme de cette démarche, notamment en ce qui concerne les installations électriques ainsi que
  les outils de régulation avec au final des solutions globales, automatisées et au moindre coût." EN: "alfec
  provides customers with precise engineering and state-of-the-art equipment, so as to ensure a true success of
  their projects. alfec's various teams operate at the pace of this approach, particularly with regard to
  electrical installations as well as regulation tools. This way, alfec reaches ultimately global, automated and
  cost-effective solutions."
- **Froid Industriel** — FR: "Forte de son expérience et de la compétence de son personnel, alfec a su conquérir,
  grâce à sa maîtrise des technologies de réfrigération, différents secteurs d'activité comme l'agroalimentaire, la
  pharmacie et la pétrochimie." EN: "Thanks to a big amount of experience and to proven skills, alfec has been able
  to invest various sectors such as food processing, pharmaceuticals and petrochemicals and make his customers
  benefit from its expertise in refrigeration technologies."
- **Génie Industriel** — FR: "Dans le cadre de l'extension de ses activités et en réponse aux besoins du marché
  national, alfec s'est orientée progressivement vers le secteur de l'industrie à savoir les réservoirs de stockage,
  le piping, les serres multi chapelles...etc. La capacité de la gestion des projets et la politique de partenariat
  avec des sociétés locales et internationales ont permis à alfec de proposer des solutions adéquates et efficaces
  qui répondent parfaitement aux besoins de ses clients." EN: "Within the framework of extending its activities and
  in response to the national market needs, alfec has gradually moved towords the industry sector, namely the
  storage reservoir, the piping, multi-span greenhouse systems...etc. The ability to manage projects and the
  partnership policy with local and international societies have enabled alfec to propose adequate and effective
  solutions that perfectly meet the needs of its customers."

### Nos Secteurs / Our Sectors
| FR | EN | Photo |
|---|---|---|
| Bâtiment | Building | 188 (stock) |
| Tertiaire | Offices | 13 |
| Hôpitaux | Hospitals | 189 (stock) |
| Hôtellerie | Hotels | 14 (stock) |
| Industrie | Industry | 190 |
| Agro-alimentaire | Food processing | 191 (stock) |

### Nos Engagements / Our Commitments
FR: "La société alfec intègre les préoccupations sociales, environnementales et économiques inhérentes à ses
différentes activités. Consciente des défis énergétiques actuels et des problèmes d'environnement inhérents au
développement humain, alfec a pour objectif principal le développement durable des territoires sur lesquels cette
entreprise opère."
EN: "alfec is a corporate citizen that aims to take in account all social, environmental and economic issues caused
by its activities. Facing the current energy challenges and environmental problems inherent to human development,
alfec 's main objective is a sustainable development of territories where this company operates."
Slider: 127, 218, 219, 220 (all stock eco imagery).

### Galerie / Gallery
| FR category | EN category | Photos |
|---|---|---|
| Climatisation | HVAC | 136 ("sonelgaz Tiaret 037"), 255, 256, 257, 258 |
| Industries | Industries | 259, 260, 137 ("Centrale de Pression") |
| Hôpitaux | Hospitals | 159 (stock) |
| Banques | Banks | 261, 138 ("Banque BEA - Oran") |
| Câblage | Wiring | 281, 263, 280, 265 |
| Désenfumage | Smoke Protection | 267, 146, 140 |
| Etablissements Publics Hospitaliers | Public Health Centers | 275, 160 (stock) |

### Actualités / What's New
Intro FR: "Un des objectifs phares d'alfec : une communication permanente sur les différentes initiatives de
l'entreprise." EN: "One of the main objectives of alfec : a continuous communication on the various initiatives of
the company."
1. Salon NAPEC 2018 — 28 mars 2018 — photos 302, 303, 299, 298 + YouTube `oizwMYIQ8Vs` — "Nous étions honnorés
   par la visite de monsieur le ministre de l'énergie et monsieur le Wali de la Wilaya d'Oran au stand d'alfec."
   (EN post has no title or body.)
2. Participation au salon international NAPEC — 20 mars 2018 — photos 297, 295 — "alfec vous donne rendez-vous au
   salon NAPEC sur le stand B4-16/B4-17 du 25 au 28 mars 2018 au centre de conventions Oran, Algérie"
3. Bonne année 2018 — 14 janvier 2018 — greeting cards 293, 289, 294, 290, 292, 291
4. Lancement de notre nouveau site Web — 20 novembre 2017 — obsolete once the redesign ships.

## 9. Asset inventory

- `images/alfec-logo.png` 675×507 PNG, full colour on transparent (blue swooshes + navy wordmark + grey baseline).
  No vector version found. Colours sampled: navy `#004588`, mid blue `#0092DD`, light blue `#5dbfea`/`#74c5f3`.
- `images/slogan.png` / `slogan-en.png`: white script text as image.
- `images/texture.png`, `favicon.ico` (1.9 KB).
- 113 CMS photos. Resolution: only 2 are ≥1600 px wide, 10 are ≥1200 px, 41 are under 800 px; the typical
  authentic project photo is 1133×850 or 850×850 (downscaled by the CMS).
- **Authentic ALFEC photography** (technicians in ALFEC-branded workwear, installations, sites):
  61, 62, 72, 136, 137, 138, 140, 146, 192–207, 209, 211–217, 222, 223, 246–248, 250–267, 275, 280, 281, 298, 299, 302, 303.
  Probably authentic, needs confirmation: 13, 53, 63, 131, 190.
- **Stock / generic** (do not use as evidence of ALFEC work): 67, 70, 71, 111, 113, 127, 129, 130, 148, 159, 160,
  188, 189, 191, 218–221, city photos 133–184.
- Event and greeting graphics: 288–297.

## 10. Fragile behavior, legacy and defects

Fragile (works today, easy to break):
- Panel navigation depends on DOM order: nav items map to panels by index; `.nav_test` cards use `i+1`.
- Every panel change reloads `quisommesnous.php` into panel 2, discarding any sub-page the visitor opened.
- `form_canvas` is only set when the submit **button** is clicked; pressing Enter submits the default `contact`
  value even on the English page.
- The language is re-derived client-side from `lg`; `lg=contact` is handled as a special case (dead code).
- Hover-only disclosure: home teasers and sector photos appear on `mouseover` only (no keyboard/touch equivalent).

Unnecessary legacy implementation:
- OwlCarousel (no `.owl-carousel` element), mCustomScrollbar (no `.projects_container`), hero-text animations for
  elements that don't exist, duplicate Font Awesome, a commented W3.CSS link, Modernizr, Revealer.
- Google Analytics Universal (sunset July 2023; collects nothing), Naltis `http://` tracking pixel (blocked as mixed
  content), `signed_in=true` Maps parameter (removed by Google), `document.write` tracking.
- Cache-busting with `?v=HH:MM:SS` (changes every second, defeats caching).

Defects:
- No error state for the contact form; captcha message untranslated; placeholder options submittable; country list
  untranslated; external links without `rel="noopener"`; pinch-zoom disabled; no alt text; images as CSS
  backgrounds (not indexable, no alt); malformed JSON-LD; `og:locale` wrong on EN; no canonical/hreflang;
  EN copy has typos ("towords", "ans", "his customers") and a mistranslation (Désenfumage → "Smoke detection").
- Stale content presented as current: news ends January 2018; "Lancement de notre nouveau site Web" (2017).

## 11. Functionality that must not regress

1. The three indexed URLs resolve in the right language; `http`/`www` redirects.
2. French is the default language; English is available everywhere; a switch exists on every view.
3. All company facts in §7 and the métier/sector/competence content in §8 remain available in both languages.
4. Each of the six métiers can be browsed individually with its description and photos.
5. Contact details (address, three phone numbers, fax, e-mail) and the head-office location on a map.
6. The enquiry form collects the same information (field names in §5 unless `mail.php` is replaced), supports the
   "Autre" free-text option, one attachment, a human check, and ends in a translated confirmation.
7. Photo sets can be enlarged.
8. Social links (Facebook, YouTube, LinkedIn).
9. Mobile navigation reaches every section without horizontal scrolling.
