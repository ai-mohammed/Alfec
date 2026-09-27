import type { ImageMetadata } from 'astro';
import type { Bilingual, Lang } from '../i18n/ui';

// ALFEC's own site photography, imported from the production CMS (ressources/fichiers_produits).
// Alt text describes only what is visible. Captions name the equipment shown, then the trade or gallery
// category the photo was filed under on alfec.net, and a place only when the source names it.
// Stock images from the old site are deliberately absent.

import salleDesPompes from '../assets/photos/salle-des-pompes.jpg';
import centraleTraitementAir from '../assets/photos/centrale-traitement-air.jpg';
import groupeFroidToiture from '../assets/photos/groupe-froid-toiture.jpg';
import couloirClimatise from '../assets/photos/couloir-climatise.jpg';
import plateauBureaux from '../assets/photos/plateau-bureaux-cassettes.jpg';
import plateauBureaux2 from '../assets/photos/plateau-bureaux-cassettes-2.jpg';
import splitsFacade from '../assets/photos/splits-facade.jpg';
import toitureGaines from '../assets/photos/toiture-gaines.jpg';
import vannesIncendie from '../assets/photos/vannes-reseau-incendie.jpg';
import pompesIncendie from '../assets/photos/pompes-incendie.jpg';
import centraleDetection from '../assets/photos/centrale-detection-extincteur.jpg';
import centraleDePression from '../assets/photos/centrale-de-pression.jpg';
import desenfumageEquipe from '../assets/photos/desenfumage-toiture-equipe.jpg';
import ventilateurDesenfumage from '../assets/photos/ventilateur-desenfumage.jpg';
import exutoireToiture from '../assets/photos/exutoire-toiture.jpg';
import gaineDesenfumage from '../assets/photos/gaine-desenfumage.jpg';
import plafondGaines from '../assets/photos/plafond-gaines-detection.jpg';
import gainePlafond from '../assets/photos/gaine-plafond.jpg';
import techniciensArmoires from '../assets/photos/techniciens-armoires.jpg';
import armoireCommande from '../assets/photos/armoire-commande.jpg';
import coffretsRegulation from '../assets/photos/coffrets-regulation.jpg';
import cablageDisjoncteurs from '../assets/photos/cablage-disjoncteurs.jpg';
import tableauDivisionnaire from '../assets/photos/tableau-divisionnaire.jpg';
import armoiresBasseTension from '../assets/photos/armoires-basse-tension.jpg';
import armoirePuissance from '../assets/photos/armoire-puissance.jpg';
import chambreFroideEvaporateurs from '../assets/photos/chambre-froide-evaporateurs.jpg';
import chambreFroide from '../assets/photos/chambre-froide.jpg';
import porteChambreFroide from '../assets/photos/porte-chambre-froide.jpg';
import tourRefroidissement from '../assets/photos/tour-refroidissement.jpg';
import reservoirsT14b from '../assets/photos/reservoirs-t14b.jpg';
import reservoirsSousPression from '../assets/photos/reservoirs-sous-pression.jpg';
import localPompesCalorifuge from '../assets/photos/local-pompes-calorifuge.jpg';
import pipingCalorifuge from '../assets/photos/piping-calorifuge.png';
import echangeurCalorifuge from '../assets/photos/echangeur-calorifuge.jpg';
import sonelgazTiaret from '../assets/photos/sonelgaz-tiaret.jpg';
import maintenanceToiture from '../assets/photos/maintenance-toiture.jpg';
import banqueBeaOran from '../assets/photos/banque-bea-oran.jpg';
import siegeOran from '../assets/photos/siege-oran.jpg';
import etablissementHospitalier from '../assets/photos/etablissement-hospitalier.jpg';
import napecStand from '../assets/photos/napec-2018-stand.jpg';
import napecStand2 from '../assets/photos/napec-2018-stand-2.jpg';
import napecVisite from '../assets/photos/napec-2018-visite.png';

export type Photo = {
  src: ImageMetadata;
  /** What a screen reader hears: a full description of what is visible. */
  alt: Bilingual;
  /** Short technical subject shown as the caption. */
  subject: Bilingual;
  /** Trade, sector or gallery category the photo was filed under on alfec.net. */
  category?: Bilingual;
  /** Place, only when the source names it. */
  place?: string;
};

const p = (src: ImageMetadata, alt: Bilingual, subject: Bilingual, category?: Bilingual, place?: string): Photo => ({
  src,
  alt,
  subject,
  category,
  place,
});

/**
 * Visible caption: subject · category · place. Pass the surrounding heading as `context`
 * to drop a category that would only repeat it.
 */
export function captionOf(photo: Photo, lang: Lang, context?: string): string {
  const category = photo.category?.[lang];
  return [photo.subject[lang], category && category !== context ? category : null, photo.place]
    .filter(Boolean)
    .join(' · ');
}

export const photos = {
  salleDesPompes: p(salleDesPompes,
    { fr: 'Local technique : tuyauteries calorifugées, vannes et équipements de pompage', en: 'Plant room: insulated pipework, valves and pumping equipment' },
    { fr: 'Salle des pompes', en: 'Pump room' }, { fr: 'Tertiaire', en: 'Offices' }),
  centraleTraitementAir: p(centraleTraitementAir,
    { fr: 'Centrale de traitement d’air extérieure raccordée à des gaines calorifugées au pied d’une façade', en: 'Outdoor air-handling unit connected to insulated ductwork at the foot of a façade' },
    { fr: 'Centrale de traitement d’air et gaines calorifugées', en: 'Air-handling unit and insulated ductwork' }, { fr: 'Génie climatique', en: 'HVAC' }),
  groupeFroidToiture: p(groupeFroidToiture,
    { fr: 'Groupe de production d’eau glacée sur dalle extérieure, avec tuyauteries calorifugées', en: 'Chiller on an outdoor slab with insulated pipework' },
    { fr: 'Groupe de production d’eau glacée', en: 'Chiller' }, { fr: 'Génie climatique', en: 'HVAC' }),
  couloirClimatise: p(couloirClimatise,
    { fr: 'Couloir de bâtiment tertiaire équipé de cassettes de climatisation et de coffrets techniques', en: 'Office corridor fitted with ceiling cassettes and technical enclosures' },
    { fr: 'Cassettes de climatisation en couloir', en: 'Ceiling cassettes in a corridor' }, { fr: 'Génie climatique', en: 'HVAC' }),
  plateauBureaux: p(plateauBureaux,
    { fr: 'Plateau de bureaux avec cassettes de climatisation au plafond', en: 'Open-plan office floor with ceiling air-conditioning cassettes' },
    { fr: 'Plateau de bureaux climatisé', en: 'Air-conditioned office floor' }, { fr: 'Climatisation', en: 'Air conditioning' }),
  plateauBureaux2: p(plateauBureaux2,
    { fr: 'Plateau de bureaux avec cassettes et grilles de soufflage au plafond', en: 'Office floor with ceiling cassettes and supply grilles' },
    { fr: 'Plateau de bureaux climatisé', en: 'Air-conditioned office floor' }, { fr: 'Banques', en: 'Banks' }),
  splitsFacade: p(splitsFacade,
    { fr: 'Unités extérieures de climatisation fixées sur une façade de part et d’autre d’une fenêtre', en: 'Air-conditioning outdoor units mounted on a façade on either side of a window' },
    { fr: 'Unités extérieures en façade', en: 'Façade-mounted outdoor units' }, { fr: 'Climatisation', en: 'Air conditioning' }),
  toitureGaines: p(toitureGaines,
    { fr: 'Toiture technique avec unités de climatisation et gaines de distribution', en: 'Plant roof with air-conditioning units and distribution ductwork' },
    { fr: 'Unités de toiture et gaines de distribution', en: 'Rooftop units and distribution ductwork' }, { fr: 'Réalisation', en: 'Installation' }),
  vannesIncendie: p(vannesIncendie,
    { fr: 'Réseau incendie : tuyauteries rouges, vannes et pompes dans un local technique', en: 'Fire-water network: red pipework, valves and pumps in a plant room' },
    { fr: 'Réseau d’eau incendie, vannes et pompes', en: 'Fire-water network, valves and pumps' }, { fr: 'Protection incendie', en: 'Fire protection' }),
  pompesIncendie: p(pompesIncendie,
    { fr: 'Groupes motopompes d’un réseau incendie, tuyauteries et manomètres rouges', en: 'Fire pump sets with red pipework and pressure gauges' },
    { fr: 'Groupes motopompes incendie', en: 'Fire pump sets' }, { fr: 'Protection incendie', en: 'Fire protection' }),
  centraleDetection: p(centraleDetection,
    { fr: 'Centrale de détection incendie murale, déclencheur manuel et extincteur', en: 'Wall-mounted fire detection panel, manual call point and extinguisher' },
    { fr: 'Centrale de détection et déclencheur manuel', en: 'Detection panel and manual call point' }, { fr: 'Détection incendie', en: 'Fire detection' }),
  centraleDePression: p(centraleDePression,
    { fr: 'Centrale de pression : collecteurs et vannes peints en rouge', en: 'Pressure station: red-painted manifolds and valves' },
    { fr: 'Centrale de pression', en: 'Pressure station' }, { fr: 'Industrie', en: 'Industry' }),
  desenfumageEquipe: p(desenfumageEquipe,
    { fr: 'Deux techniciens d’ALFEC installent un ventilateur de désenfumage sur une toiture', en: 'Two ALFEC technicians installing a smoke-extraction fan on a roof' },
    { fr: 'Pose d’un ventilateur de désenfumage', en: 'Installing a smoke-extraction fan' }, { fr: 'Désenfumage', en: 'Smoke control' }),
  ventilateurDesenfumage: p(ventilateurDesenfumage,
    { fr: 'Ventilateur de désenfumage en toiture, au pied d’une façade en travaux', en: 'Roof-mounted smoke-extraction fan beside a façade under construction' },
    { fr: 'Ventilateur de désenfumage en toiture', en: 'Roof smoke-extraction fan' }, { fr: 'Désenfumage', en: 'Smoke control' }),
  exutoireToiture: p(exutoireToiture,
    { fr: 'Exutoire de désenfumage sur une grande toiture industrielle', en: 'Smoke vent on a large industrial roof' },
    { fr: 'Exutoire de désenfumage', en: 'Smoke vent' }, { fr: 'Désenfumage', en: 'Smoke control' }),
  gaineDesenfumage: p(gaineDesenfumage,
    { fr: 'Gaine de désenfumage et chemins de câbles sous une dalle béton', en: 'Smoke-extraction duct and cable trays under a concrete slab' },
    { fr: 'Gaine de désenfumage et chemins de câbles', en: 'Smoke-extraction duct and cable trays' }, { fr: 'Désenfumage', en: 'Smoke control' }),
  plafondGaines: p(plafondGaines,
    { fr: 'Plafond technique : gaines spiralées, chemins de câbles et détecteurs', en: 'Service ceiling: spiral ducts, cable trays and detectors' },
    { fr: 'Gaines spiralées et détecteurs', en: 'Spiral ducts and detectors' }, { fr: 'Désenfumage', en: 'Smoke control' }),
  gainePlafond: p(gainePlafond,
    { fr: 'Gaine rectangulaire suspendue sous une dalle, à côté des chemins de câbles', en: 'Rectangular duct hung below a slab next to cable trays' },
    { fr: 'Gaine suspendue sous dalle', en: 'Duct hung below the slab' }, { fr: 'Désenfumage', en: 'Smoke control' }),
  techniciensArmoires: p(techniciensArmoires,
    { fr: 'Trois techniciens câblent des armoires électriques dans un local technique', en: 'Three technicians wiring electrical cabinets in a plant room' },
    { fr: 'Câblage d’armoires électriques', en: 'Wiring electrical cabinets' }, { fr: 'Électricité & régulation', en: 'Electrical & controls' }),
  armoireCommande: p(armoireCommande,
    { fr: 'Armoire de commande ouverte : borniers, relais et câblage', en: 'Open control cabinet: terminal blocks, relays and wiring' },
    { fr: 'Armoire de commande', en: 'Control cabinet' }, { fr: 'Électricité & régulation', en: 'Electrical & controls' }),
  coffretsRegulation: p(coffretsRegulation,
    { fr: 'Coffret de régulation et armoire de commande avec voyants, raccordés par chemin de câbles', en: 'Control enclosure and command cabinet with indicator lamps, fed by a cable tray' },
    { fr: 'Coffret de régulation et armoire de commande', en: 'Control enclosure and command cabinet' }, { fr: 'Électricité & régulation', en: 'Electrical & controls' }),
  cablageDisjoncteurs: p(cablageDisjoncteurs,
    { fr: 'Câblage d’un tableau : disjoncteurs de puissance et conducteurs repérés', en: 'Switchboard wiring: power breakers and labelled conductors' },
    { fr: 'Câblage d’un tableau de puissance', en: 'Power switchboard wiring' }, { fr: 'Électricité & régulation', en: 'Electrical & controls' }),
  tableauDivisionnaire: p(tableauDivisionnaire,
    { fr: 'Tableau divisionnaire ouvert, deux rangées de disjoncteurs', en: 'Open distribution board with two rows of breakers' },
    { fr: 'Tableau divisionnaire', en: 'Distribution board' }, { fr: 'Câblage', en: 'Wiring' }),
  armoiresBasseTension: p(armoiresBasseTension,
    { fr: 'Rangée d’armoires électriques basse tension, portes ouvertes', en: 'Row of low-voltage switchgear cabinets, doors open' },
    { fr: 'Armoires basse tension', en: 'Low-voltage switchgear' }, { fr: 'Câblage', en: 'Wiring' }),
  armoirePuissance: p(armoirePuissance,
    { fr: 'Armoire de puissance équipée de disjoncteurs', en: 'Power cabinet fitted with circuit breakers' },
    { fr: 'Armoire de puissance', en: 'Power cabinet' }, { fr: 'Câblage', en: 'Wiring' }),
  chambreFroideEvaporateurs: p(chambreFroideEvaporateurs,
    { fr: 'Technicien sur échafaudage devant une rangée d’évaporateurs de chambre froide', en: 'Technician on a scaffold beside a row of cold-room evaporators' },
    { fr: 'Évaporateurs de chambre froide', en: 'Cold-room evaporators' }, { fr: 'Froid industriel', en: 'Industrial refrigeration' }),
  chambreFroide: p(chambreFroide,
    { fr: 'Chambre froide vide, évaporateur au plafond', en: 'Empty cold room with a ceiling evaporator' },
    { fr: 'Chambre froide', en: 'Cold room' }, { fr: 'Froid industriel', en: 'Industrial refrigeration' }),
  porteChambreFroide: p(porteChambreFroide,
    { fr: 'Porte de chambre froide et afficheurs de température', en: 'Cold-room door and temperature displays' },
    { fr: 'Porte de chambre froide et régulation', en: 'Cold-room door and controls' }, { fr: 'Froid industriel', en: 'Industrial refrigeration' }),
  tourRefroidissement: p(tourRefroidissement,
    { fr: 'Tour de refroidissement et tuyauteries sur une plateforme industrielle', en: 'Cooling tower and pipework on an industrial platform' },
    { fr: 'Tour de refroidissement', en: 'Cooling tower' }, { fr: 'Froid industriel', en: 'Industrial refrigeration' }),
  reservoirsT14b: p(reservoirsT14b,
    { fr: 'Réservoirs de stockage cylindriques T14B et T15A sur un site industriel', en: 'Cylindrical storage tanks T14B and T15A on an industrial site' },
    { fr: 'Réservoirs de stockage T14B et T15A', en: 'Storage tanks T14B and T15A' }, { fr: 'Génie industriel', en: 'Industrial engineering' }),
  reservoirsSousPression: p(reservoirsSousPression,
    { fr: 'Réservoirs horizontaux sous pression et leurs tuyauteries dans un hall industriel', en: 'Horizontal pressure vessels and their pipework in an industrial hall' },
    { fr: 'Réservoirs sous pression', en: 'Pressure vessels' }, { fr: 'Génie industriel', en: 'Industrial engineering' }),
  localPompesCalorifuge: p(localPompesCalorifuge,
    { fr: 'Local de pompage : tuyauteries calorifugées et pompes rouges', en: 'Pump room: insulated pipework and red pumps' },
    { fr: 'Local de pompage calorifugé', en: 'Insulated pump room' }, { fr: 'Génie industriel', en: 'Industrial engineering' }),
  pipingCalorifuge: p(pipingCalorifuge,
    { fr: 'Piping calorifugé et pompes sous une charpente métallique', en: 'Insulated piping and pumps under a steel frame' },
    { fr: 'Piping calorifugé', en: 'Insulated piping' }, { fr: 'Génie industriel', en: 'Industrial engineering' }),
  echangeurCalorifuge: p(echangeurCalorifuge,
    { fr: 'Équipement calorifugé et tuyauteries sur une structure métallique', en: 'Insulated vessel and pipework on a steel structure' },
    { fr: 'Équipement calorifugé sur structure', en: 'Insulated vessel on a steel frame' }, { fr: 'Génie industriel', en: 'Industrial engineering' }),
  sonelgazTiaret: p(sonelgazTiaret,
    { fr: 'Technicien d’ALFEC intervenant sur une unité de climatisation en toiture', en: 'ALFEC technician working on a rooftop air-conditioning unit' },
    { fr: 'Sonelgaz', en: 'Sonelgaz' }, { fr: 'Climatisation', en: 'Air conditioning' }, 'Tiaret'),
  maintenanceToiture: p(maintenanceToiture,
    { fr: 'Technicien d’ALFEC ouvrant le coffret électrique d’une unité de toiture', en: 'ALFEC technician opening the electrical panel of a rooftop unit' },
    { fr: 'Intervention sur une unité de toiture', en: 'Servicing a rooftop unit' }, { fr: 'Maintenance', en: 'Maintenance' }),
  banqueBeaOran: p(banqueBeaOran,
    { fr: 'Technicien d’ALFEC sur une armoire de climatisation dans le hall d’une agence bancaire', en: 'ALFEC technician on a floor-standing air-conditioning unit in a bank hall' },
    { fr: 'Banque BEA', en: 'Banque BEA' }, { fr: 'Banques', en: 'Banks' }, 'Oran'),
  siegeOran: p(siegeOran,
    { fr: 'Le bâtiment du siège d’ALFEC à Canastel, Oran', en: 'ALFEC’s head-office building in Canastel, Oran' },
    { fr: 'Siège d’ALFEC', en: 'ALFEC head office' }, undefined, 'Canastel, Oran'),
  etablissementHospitalier: p(etablissementHospitalier,
    { fr: 'Bâtiment d’un établissement public hospitalier, vu depuis une toiture', en: 'Public hospital building seen from a rooftop' },
    { fr: 'Établissement public hospitalier', en: 'Public hospital' }, { fr: 'Établissements publics hospitaliers', en: 'Public hospitals' }),
  napecStand: p(napecStand,
    { fr: 'Le stand d’ALFEC au salon NAPEC 2018', en: 'ALFEC’s stand at NAPEC 2018' },
    { fr: 'Stand d’ALFEC', en: 'ALFEC stand' }, { fr: 'NAPEC 2018', en: 'NAPEC 2018' }, 'Oran'),
  napecStand2: p(napecStand2,
    { fr: 'Visiteurs sur le stand d’ALFEC au salon NAPEC 2018', en: 'Visitors on ALFEC’s stand at NAPEC 2018' },
    { fr: 'Visiteurs sur le stand', en: 'Visitors on the stand' }, { fr: 'NAPEC 2018', en: 'NAPEC 2018' }, 'Oran'),
  napecVisite: p(napecVisite,
    { fr: 'Visite officielle du salon NAPEC 2018', en: 'Official visit at NAPEC 2018' },
    { fr: 'Visite officielle', en: 'Official visit' }, { fr: 'NAPEC 2018', en: 'NAPEC 2018' }, 'Oran'),
} satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof photos;
