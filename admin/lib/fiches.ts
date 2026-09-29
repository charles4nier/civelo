// Décision 98 — petits utilitaires partagés par les composants admin des
// fiches (`FichesListHeader`, `FichePageField`, `PanneauFiches`, `Nav`).

// Paramètre d'URL posé par Payload sur la liste filtrée d'une page :
// `/admin/collections/fiches?where[page][equals]=<id>`.
export const PARAM_PAGE_LISTE = 'where[page][equals]';

// Mémorise la page de la dernière liste « Publier une fiche › <page> »
// ouverte : si l'éditeur crée une fiche depuis un bouton natif de Payload
// (qui ne transmet pas le filtre), `FichePageField` la retrouve quand même.
export const CLE_PAGE_EN_COURS = 'civelo:fiches:page';

export function listeFichesHref(pageId: string | number): string {
	return `/collections/fiches?${encodeURIComponent(PARAM_PAGE_LISTE)}=${pageId}`;
}

export function nouvelleFicheHref(pageId: string | number): string {
	return `/collections/fiches/create?page=${pageId}`;
}

export function lireSession(): string | null {
	try {
		return window.sessionStorage.getItem(CLE_PAGE_EN_COURS);
	} catch {
		return null;
	}
}

export function ecrireSession(pageId: string | null) {
	try {
		if (pageId) window.sessionStorage.setItem(CLE_PAGE_EN_COURS, pageId);
		else window.sessionStorage.removeItem(CLE_PAGE_EN_COURS);
	} catch {
		// Stockage indisponible (navigation privée…) : le préremplissage par
		// l'URL (`?page=`) reste le chemin normal.
	}
}
