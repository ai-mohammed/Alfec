---
target: alfec.net homepage and page system
total_score: 29
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 4
target_identity: "file:C:\\Users\\moham\\Documents\\Github\\HGP-GO\\Alfec\\src\\pages\\index.astro"
target_fingerprint: "sha256:cbd4609c8074a60529c31e118a21dcd700083d8c0b91b075a44dd9cc38454026"
target_path: "C:\\Users\\moham\\Documents\\Github\\HGP-GO\\Alfec\\src\\pages\\index.astro"
timestamp: 2026-09-26T18-17-51Z
slug: src-pages-index-astro
---
Method: dual-agent (A: design review · B: detector + browser evidence)

## Design Health Score
| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | aria-current nav, busy state, viewer counter; thanks page confirms nothing specific |
| 2 | Match System / Real World | 3 | Right vocabulary; "Réalisations" means both Projects page and Installation step |
| 3 | User Control and Freedom | 3 | Breadcrumbs, trade pager, Esc everywhere; thanks page is a dead end |
| 4 | Consistency and Standards | 3 | Desktop nav omits Contact (contract lists it); non-interactive sector lists styled like links |
| 5 | Error Prevention | 3 | Accept filters, size hint, prefill; 9 required fields |
| 6 | Recognition Rather Than Recall | 3 | Projects gallery taxonomy differs from the six trades |
| 7 | Flexibility and Efficiency | 3 | tel:/mailto everywhere, trade prefill; no call shortcut in mobile header |
| 8 | Aesthetic and Minimalist Design | 3 | Restrained, no clichés; home runs 8 sections restating interior pages |
| 9 | Error Recovery | 3 | Inline translated errors; summary does not enumerate failing fields |
| 10 | Help and Documentation | 2 | No guidance on what an actionable enquiry includes |
| **Total** | | **29/40** | **Good** |

## Design Specificity Verdict
Clean category-standard execution at competent-template level. Authored: numbered navy trade index with photo swap, evidence discipline, ALFEC-jacket photography, 22-wilaya map. Under-used: map buried on /entreprise/, named references as 13px captions, one left-heading/right-body composition repeated ~10 times. Biggest craft gap: visible captions repeat category names while alt text holds technical descriptions.
Detector: CLI 0 findings. Browser: cramped-padding on header CTA (false positive: min-height + centering) and first-viewport-column-overflow on /contact/ (false positive: deliberate sticky sidebar; real sub-point: sidebar needs >=891px viewport height to fit while pinned).

## Priority Issues
- [P1] Home duplicates interior pages; /metiers/ near-copies a home section. Fix: home = hero, trade index, proof (references + map), cycle, enquiry; sectors/commitments on /entreprise/ only; /metiers/ as a real hub. Command: /impeccable distill
- [P1] Proof set small, captions carry no information. Fix: reference blocks on home; technical captions from alt text; default index frame = team photo; 4:3 crops. Command: /impeccable typeset
- [P1] Mobile mostly stacked desktop. Fix: header call link, contact details above form on phones, 2-up galleries <600px, 4:3 hero, 2-col facts, CTA+lang in tablet header. Command: /impeccable adapt
- [P1] Keyboard/finish defects: drawer focus escapes (needs inert), field borders 1.8:1 (<3:1), map HQ ring filled + label collision, phone numbers wrap. Command: /impeccable harden
- [P2] Enquiry moment lacks guidance: checklist next to message, say where it goes, thanks page with next step + phone, travaux_autre beside its select. Command: /impeccable clarify

## Persona Red Flags
Jordan: no Contact in desktop nav; clicks non-link sectors; "Réalisations" ambiguity. Casey: 9,400px home, no header call, phone below 12 fields, 9px map label. Sam: focus escapes drawer, error summary not enumerated, 14-20 word trade link names. Mourad (bureau d'études engineer, IGH smoke-control package): thin désenfumage page, captionless photos, references without year/scope, no "Bureau d'études" role, 10MB limit, "Procurement" never explained.

## Minor Observations
Three dark bands end /entreprise/, slogan twice; gallery orphans; empty grey map placeholder; home reference photos not linked; blank half-column when Autre hidden.

## Questions to Consider
Why is the only visual evidence of reach two clicks deep while CSR text takes a home section? Why do captions tell a reader less than alt text? Does ALFEC procure equipment (the P in EPC)?
