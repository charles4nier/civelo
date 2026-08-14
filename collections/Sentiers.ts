import type { CollectionConfig } from 'payload';
import { isLoggedIn } from './access';

// Décision 23 — même raisonnement que Pois : collection séparée.
export const Sentiers: CollectionConfig = {
	slug: 'sentiers',
	admin: {
		useAsTitle: 'nom'
	},
	access: {
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
			name: 'distance',
			type: 'text',
			admin: {
				description: 'Ex. "7,5 km"'
			}
		},
		{
			name: 'duree',
			type: 'text',
			admin: {
				description: 'Ex. "2h30"'
			}
		},
		{
			name: 'trace',
			type: 'array',
			label: 'Tracé (coordonnées)',
			fields: [
				{ name: 'lat', type: 'number', required: true },
				{ name: 'lng', type: 'number', required: true }
			]
		},
		{
			name: 'image',
			type: 'upload',
			relationTo: 'media',
			required: true
		}
	]
};
