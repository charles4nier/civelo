// Les `layoutType` déjà passés en fiches. Pilote : Actualités seulement —
// les 5 autres restent des tableaux dans leur page (`liste.itemsXxx`) tant
// qu'ils n'ont pas été migrés un par un (chantier-fiches.md §7). Lu aussi
// par la sidebar (`admin/Nav`, entrées « Publier une fiche ») et par le
// panneau de renvoi des pages Liste.
export const LAYOUTS_EN_FICHES = ['actualites'] as const;
export type TypeFiche = (typeof LAYOUTS_EN_FICHES)[number];
