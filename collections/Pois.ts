import type { CollectionConfig } from 'payload';
import { isLoggedIn } from './access';

// Décision 23 — collection séparée (pas un tableau imbriqué dans le
// singleton Carte interactive) pour permettre une vraie relation Payload
// depuis les cards "Découvrir" de l'Accueil (décision 14).
export const Pois: CollectionConfig = {
	slug: 'pois',
	admin: {
		useAsTitle: 'nom'
	},
	access: {
		// Décision 8 — collection "éditable" par la mairie, contrairement aux
		// catégories/coordonnées fixées au setup.
		create: isLoggedIn,
		update: isLoggedIn,
		delete: isLoggedIn,
		read: () => true
	},
	fields: [
		{
			name: 'nom',
			type: 'text',
			required: true
		},
		{
			name: 'description',
			type: 'textarea',
			required: true
		},
		{
			name: 'categorie',
			type: 'select',
			required: true,
			options: [
				{ label: 'Hébergement', value: 'hebergement' },
				{ label: 'Site à visiter', value: 'site-visite' }
			]
		},
		{
			name: 'latitude',
			type: 'number',
			required: true
		},
		{
			name: 'longitude',
			type: 'number',
			required: true
		},
		{
			name: 'image',
			type: 'upload',
			relationTo: 'media',
			required: true
		}
	]
};
