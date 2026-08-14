import type { CollectionConfig } from 'payload';
import { isLoggedIn, isAdminOrAbove } from './access';

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
		{
			name: 'alt',
			type: 'text',
			required: true
		},
		{
			name: 'credit',
			type: 'text'
		}
	]
};
