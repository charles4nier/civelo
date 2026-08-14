import type { CollectionConfig } from 'payload';
import { isSuperAdmin, isLoggedIn } from './access';

// Décision 22 — source unique des numéros de la mairie, référencée par
// relation partout ailleurs (jamais resaisie en texte libre).
export const Telephones: CollectionConfig = {
	slug: 'telephones',
	admin: {
		useAsTitle: 'label'
	},
	access: {
		// Fixé au setup (décision 22, même logique que les catégories).
		create: isSuperAdmin,
		update: isSuperAdmin,
		delete: isSuperAdmin,
		read: isLoggedIn
	},
	fields: [
		{
			name: 'label',
			type: 'text',
			required: true,
			admin: {
				description: 'Ex. "Secrétariat", "Urbanisme"'
			}
		},
		{
			name: 'numero',
			type: 'text',
			required: true
		}
	]
};
