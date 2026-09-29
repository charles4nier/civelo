// Les `layoutType` passés en fiches (décision 98). Pilote Actualités le
// 2026-09-29, puis les 5 autres types le même jour. Lu par la sidebar
// (`admin/Nav`, entrées « Publier une fiche »), par le panneau de renvoi des
// pages Liste et par le filtre du champ « Page » d'une fiche.
export const LAYOUTS_EN_FICHES = ['actualites', 'agenda', 'demarches', 'annuaire', 'document', 'budget-projet'] as const;
export type TypeFiche = (typeof LAYOUTS_EN_FICHES)[number];
