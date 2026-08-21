import type { CollectionConfig } from 'payload';
import { isLoggedIn } from './access';
import { withInfo } from './Pages';

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
		withInfo({ name: 'nom', type: 'text', required: true }, 'Le nom de ce lieu, affiché sur la carte interactive.'),
		withInfo(
			{ name: 'description', type: 'textarea', required: true },
			'Quelques lignes qui présentent ce lieu.'
		),
		withInfo(
			{
				name: 'categorie',
				type: 'select',
				required: true,
				options: [
					{ label: 'Hébergement', value: 'hebergement' },
					{ label: 'Site à visiter', value: 'site-visite' }
				]
			},
			'Le type de lieu — détermine son icône sur la carte.'
		),
		withInfo(
			{ name: 'latitude', type: 'number', required: true },
			'La coordonnée GPS "latitude" du lieu (ex. via un clic droit sur Google Maps).'
		),
		withInfo(
			{ name: 'longitude', type: 'number', required: true },
			'La coordonnée GPS "longitude" du lieu (ex. via un clic droit sur Google Maps).'
		),
		withInfo(
			{
				// Pas `required` — le seed (item 10) ne dispose d'aucun vrai fichier
				// à uploader (images Unsplash en URL dans les données statiques),
				// laissé vide, à compléter dans l'admin (même logique que
				// `itemsDocument.fichier`, décision 38).
				name: 'image',
				type: 'upload',
				relationTo: 'media'
			},
			'Une photo de ce lieu (optionnel).'
		)
	]
};
