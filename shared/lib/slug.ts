// Chantier « fiches » (décision 98) — URL d'une fiche calculée depuis son
// titre : minuscules, sans accents, mots séparés par des tirets. Importé en
// chemin relatif depuis `collections/` (le loader des scripts,
// `scripts/_resolve-ts.mjs`, ne résout pas les alias `@shared/*`).
export function slugify(value: string): string {
	return value
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/œ/g, 'oe')
		.replace(/æ/g, 'ae')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 80)
		.replace(/-+$/g, '');
}
