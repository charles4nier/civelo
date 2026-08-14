import type { CollectionConfig } from 'payload';
import { isLoggedIn } from './access';

// Décision 35 — sortie de `pages.liste.itemsActualites` (un `array`, non
// relatable) vers sa propre collection, pour que l'épinglage d'une actu
// précise sur l'Accueil (décision 16) puisse être une vraie relation Payload.
// Réordonnancement au glisser-déposer conservé via `orderable` (même
// mécanisme que la collection `pages`, décision 5) plutôt qu'un `array`.
export const Actualites: CollectionConfig = {
	slug: 'actualites',
	orderable: true,
	admin: {
		useAsTitle: 'titre',
		defaultColumns: ['titre', 'page', 'date']
	},
	access: {
		// Ajouter/modifier/supprimer une actu reste du contenu quotidien
		// (décision 10) — pas la création/suppression d'une page.
		create: isLoggedIn,
		update: isLoggedIn,
		delete: isLoggedIn,
		read: () => true
	},
	fields: [
		{
			name: 'page',
			type: 'relationship',
			relationTo: 'pages',
			required: true,
			admin: {
				description: 'La page Liste (layoutType "actualites") à laquelle cette actu appartient.'
			}
		},
		{ name: 'titre', type: 'text', required: true },
		{
			name: 'categorie',
			type: 'relationship',
			relationTo: 'categories',
			required: true,
			filterOptions: ({ data }) => ({ page: { equals: (data as { page?: string })?.page } })
		},
		{ name: 'date', type: 'date', required: true },
		{ name: 'extrait', type: 'textarea', required: true },
		{
			name: 'lienDocument',
			type: 'relationship',
			relationTo: 'pages',
			admin: {
				description: 'Optionnel — remplace "Lire la suite" par "Voir le document"'
			}
		}
	]
};
