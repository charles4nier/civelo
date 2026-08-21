import type { CollectionConfig } from 'payload';
import { isLoggedIn, isAdminOrAbove } from './access';
import { withInfo } from './Pages';

// Décision 25 — collection dédiée aux images (hero, cards, POI, aperçus...).
// `alt` obligatoire : exigence RGAA déjà couverte par l'audit du site.
export const Media: CollectionConfig = {
	slug: 'media',
	upload: {
		mimeTypes: ['image/*']
	},
	access: {
		// Tous les rôles connectés ajoutent des images au quotidien ; la
		// suppression reste plus prudente (un fichier peut être référencé
		// ailleurs) — réservée à admin/super-admin.
		create: isLoggedIn,
		update: isLoggedIn,
		delete: isAdminOrAbove,
		read: () => true
	},
	fields: [
		withInfo(
			{
				name: 'alt',
				type: 'text',
				required: true
			},
			"Ce que représente l'image, lu à voix haute par les lecteurs d'écran (accessibilité)."
		),
		withInfo({ name: 'credit', type: 'text' }, "Le nom du photographe ou la source de l'image (optionnel).")
	]
};
