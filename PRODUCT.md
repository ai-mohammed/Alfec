# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro with static output, plus one PHP endpoint for the contact form. Chosen by the user on 2026-09-26 over
redesigning the existing PHP templates in place (the production source isn't available) and over plain PHP.
The target is the current alfec.net hosting (nginx + PHP). The agency CMS and its `/webmaster/` admin are not
carried over: content lives in this repository.

Open: exact PHP version, mail transport (SMTP or `mail()`), the enquiry destination mailbox (presumably
contact@alfec.net), and whether the host allows nginx rewrite rules or only files.

## Users

Inferred from the enquiry form's "Vous êtes ?" options and the sectors ALFEC names; presented to the user on
2026-09-26 without correction:

- **Maîtres d'ouvrage**: public and private project owners.
- **Maîtres d'œuvre**: architects and engineering consultants who specify technical lots.
- **Sociétés générales de bâtiment**: general contractors subcontracting technical trades.
- **Collectivités locales**: local authorities.
- **Industrial operators** in agro-food, pharmaceutical and petrochemical sectors (named under Froid Industriel).

Their situation: evaluating a technical contractor for a building or industrial project, either new works or
maintenance. They check which trades ALFEC covers and whether it can be trusted with the job, then send an
enquiry, often with project documents attached. French is the primary reading language; English serves
international partners.

## Product Purpose

alfec.net presents ALFEC, an Engineering • Procurement • Construction contractor for technical installations in
buildings and industry. Its job is to earn the confidence of technical decision-makers and turn it into qualified
project enquiries. Success means a first impression that matches a serious engineering firm, enquiries that arrive
with enough detail to act on, and findability in French and English search.

## Positioning

One contractor for six complementary technical trades, across the full cycle of a project:

- Trades: Génie Climatique; Protection & Détection Incendie; Désenfumage; Electricité & Régulation;
  Froid Industriel; Génie Industriel.
- Cycle: studies and design (Engineering), installation (Réalisations), and maintenance contracts (Maintenance).

In ALFEC's own words, it proposes integrated offers following precise diagnostics of equipment and needs. Its
multidisciplinary approach is meant to deliver optimal energy performance within allocated budgets and deadlines.
Headquartered in Oran, it works across Algeria and has existed since the early 2000s.

## Operating Context

- Enquiries arrive through the web form (with one attachment) or by phone, fax, mobile and e-mail.
- Enquiries are qualified by activity (Bâtiment, Hôtellerie, Industrie, Agroalimentaire, Santé, Autre), requester
  role, and nature of works (Travaux neufs, Maintenance, Autre), each with a free-text "Autre".
- Regulatory frame: Algerian standards. Smoke control is mandatory in ERP and IGH buildings.
- Trade-fair presence: NAPEC 2018, Oran.

## Capabilities and Constraints

- French is the default language and English is complete. Both come from a single translation source, with no
  duplicated hard-coded components per language.
- Indexed URLs `/`, `/index.php?lg=fr` and `/index.php?lg=en` must keep resolving, via 301s to the new canonical
  URLs.
- The behavioral contract lives in Unspaghettit (`unspa/`, adoption pending). The observed behavior and the full
  FR/EN content are in `docs/audit/live-site-inventory.md`.
- The enquiry form keeps the current information contract and adds a real error state. The server side needs
  validation, upload type/MIME/size limits, safe filenames, CSRF protection, spam mitigation, and generic error
  responses.
- Photography: no originals are available (confirmed 2026-09-26). The best project photos are about 1133×850 or
  850×850, and only two files are ≥1600 px wide. Layouts must size photography to what the files support.
- Not decided: analytics (nothing functional today), map provider (a Google Maps key is currently embedded),
  whether a news section continues after the 2018 archive.

## Brand Commitments

- Name: logotype **alfec** in lowercase. Structured name "ALFEC Engineering Procurement Construction"; legal
  form seen on stand signage: EURL ALFEC.
- Logo: `images/alfec-logo.png` (675×507 PNG; no vector version found). It has blue swooshes, a navy serif
  wordmark and a grey baseline reading "Engineering • Procurement • Construction". It is used as supplied.
- The existing blue identity must be preserved and elevated, never replaced (user's binding constraint).
- Slogan: "Équilibre durable, Continuité et Innovation" / "Sustainability, Continuity and Innovation".
- The site must communicate precision, engineering, technical expertise, reliability, performance, industrial
  capability and long-term trust. ALFEC is not a SaaS, AI, agency or crypto company, and must not read like one.
- Social: facebook.com/AlfecDZ, YouTube channel `UCDak7qYykMomAYEgwSPs89w`, linkedin.com/company/alfec.
- Visual direction (2026-09-27, replaces the "category standard" of 2026-09-26). The client rejected the first
  version as cold, too big-group and not ALFEC. Their questionnaire answers set the new direction, then the user
  chose piste C « Grands projets » of three homepage comps (`pistes/`), with the sky-blue accent and without the
  scrolling band:
  - night-blue ground, a photo slideshow in the opening, and condensed uppercase display type (Barlow Condensed,
    with Barlow for text);
  - sky-blue accent `#4cbcf4` from the logo swoosh;
  - trades as expanding photo panels, and a network map drawn from Oran;
  - light sections for references, galleries and the form;
  - motion on scroll and hover, and the handwritten slogan artwork restored.
  The client's reference site is cegelec-clim-ouest.fr.
- Client headline (2026-09-27): « À chaque défi technique, la solution adaptée. » Génie climatique leads the trades
  as ALFEC's founding trade.
- Information architecture (user decision, 2026-09-26): multi-page, bilingual. Home, six trade pages, Company,
  Projects/References, Contact, each with its own URL in French and English. The client kept this structure.
- Still to come from ALFEC:
  - a photo shoot, since the current photos are judged poor;
  - clients they may name;
  - testimonials;
  - partner logos.
  The home page shows the testimonial and partner sections only once `testimonials` / `partners` in
  `src/data/company.ts` have entries.

## Evidence on Hand

Confirmed usable by the user on 2026-09-26:

- **Named references:** Sonelgaz, Tiaret (HVAC, photo #136) and Banque BEA, Oran (banking, photo #138). Nothing
  beyond these is known: no dates, scopes or sizes.
- **ALFEC's own photography:** about 70 installation and site photos, with technicians in ALFEC workwear, plant
  rooms, pump stations, electrical panels, storage tanks and greenhouses (IDs in the inventory §9). Files are in
  `.snapshot/alfec.net-2026-09-26/photos/` until imported.
- **Geographic footprint:** the current site's "Nos implantations" map marks 22 wilayas (Oran, Alger, Adrar,
  Annaba, Constantine, Laghouat, Tlemcen, El Oued, Béchar, Saïda, Mostaganem, Mascara, Tissemsilt, Naâma, Jijel,
  Bouira, Tiaret, Chlef, Boumerdès, Mila, Béjaïa, Guelma). The site frames them as where ALFEC intervenes; it
  never says they are offices, and nothing more is known about each.
- **NAPEC 2018:** stand B4-16/B4-17, 25–28 March 2018; visit of the Minister of Energy and the Wali of Oran.
  Kept as a dated archive.
- **ALFEC's own claims, kept as its statements:** "leader en génie climatique"; "pionnier du désenfumage en
  Algérie"; smoke-control equipment installed is certified; equipment uses ecological refrigerant gases; full
  compliance with Algerian standards; partnerships with local and international companies.
- **Content:** full FR/EN copy for company story, identity, competences, locations, six métiers, six sectors and
  commitments, in `docs/audit/live-site-inventory.md` §8.

Absent, and must not be fabricated:

- founding year (only "début des années 2000")
- headcount
- clients beyond Sonelgaz and BEA
- project details
- certifications such as ISO
- awards, statistics, testimonials
- offices other than Oran
- team or leadership names

Stock images on the current site are not evidence of ALFEC work.

## Product Principles

1. **Evidence over assertion.** Show real installations and stated facts; never inflate scale or credentials.
2. **One contractor, six trades, whole cycle.** The integrated offer is the story, not six separate services.
3. **Every path ends in a precise enquiry.** Content exists to make a qualified project conversation easy to start.
4. **French first, English equal.** Same content, same quality, same findability in both languages.
5. **Durable over fashionable.** The site should still read as current and trustworthy years from launch.

## Accessibility & Inclusion

Working target: WCAG 2.2 AA, the standard for the accessibility review the brief requests. It is not a
contractual requirement. Pinch-zoom must work, and all content must be reachable by keyboard and touch; the
current site violates both.
