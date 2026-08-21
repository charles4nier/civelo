import type { CollectionConfig } from 'payload';
import { isLoggedIn } from './access';
import { withInfo } from './Pages';

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
		withInfo({ name: 'nom', type: 'text', required: true }, 'Le nom de ce sentier, affiché sur la carte interactive.'),
		withInfo(
			{ name: 'description', type: 'textarea', required: true },
			'Quelques lignes qui présentent ce sentier.'
		),
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
		withInfo(
			{
				name: 'trace',
				type: 'array',
				label: 'Tracé (coordonnées)',
				fields: [
					{ name: 'lat', type: 'number', required: true },
					{ name: 'lng', type: 'number', required: true }
				]
			},
			'Les points GPS qui dessinent le sentier sur la carte, dans l\'ordre du parcours.'
		),
		withInfo(
			{
				// Pas `required` — même raison que `Pois.image`.
				name: 'image',
				type: 'upload',
				relationTo: 'media'
			},
			'Une photo de ce sentier (optionnel).'
		)
	]
};
