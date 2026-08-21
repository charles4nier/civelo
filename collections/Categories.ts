import type { CollectionConfig } from 'payload';
import { isSuperAdmin, isLoggedIn } from './access';
import { withInfo } from './Pages';

// Décision 10 — catégories verrouillées PAR PAGE (pas une liste globale
// partagée). Chaque catégorie appartient à une page précise, et porte son
// icône + sa couleur, fixées au setup par le dev — jamais un choix de
// l'éditeur mairie. Sert aussi de pioche pour l'échappatoire "liste
// universelle" (décision 10, point 4) et de seed pour l'inventaire de la
// décision 24.
export const Categories: CollectionConfig = {
	slug: 'categories',
	admin: {
		useAsTitle: 'nom'
	},
	access: {
		// Fixé au setup du projet (décision 10) — jamais un choix de l'éditeur,
		// ni même de l'admin mairie.
		create: isSuperAdmin,
		update: isSuperAdmin,
		delete: isSuperAdmin,
		read: isLoggedIn
	},
	fields: [
		withInfo(
			{
				name: 'nom',
				type: 'text',
				required: true
			},
			'Le nom de la catégorie, affiché dans les filtres et les fiches.'
		),
		{
			name: 'page',
			type: 'relationship',
			relationTo: 'pages',
			required: true,
			admin: {
				description:
					'La page à laquelle cette catégorie est verrouillée. Vide (aucune page unique) pour une liste "universelle" — voir décision 10.'
			}
		},
		{
			// Décision 55 — texte libre remplacé par une relation vers la
			// collection `icones` (liste gérée, avec aperçu visuel du glyphe).
			// Décision 56 — `admin/IconPickerField` affiche le glyphe DANS la
			// liste de choix (le menu déroulant natif d'un `relationship` ne
			// montre que le nom).
			name: 'icone',
			type: 'relationship',
			relationTo: 'icones',
			label: 'Icône',
			admin: { components: { Field: '/admin/IconPickerField' } }
		},
		{
			// Palette complète du site (shared/styles/variables.scss), pas
			// seulement les 5 variantes de ContactCard — découvert en migrant
			// les données réelles (item 10) : Documents utilise "terracotta",
			// absent de la liste précédente.
			name: 'couleur',
			type: 'select',
			admin: { description: 'La couleur utilisée pour cette catégorie sur le site.' },
			options: [
				{ label: 'Primary', value: 'primary' },
				{ label: 'Coral', value: 'coral' },
				{ label: 'Leaf', value: 'leaf' },
				{ label: 'Terracotta', value: 'terracotta' },
				{ label: 'Sky', value: 'sky' },
				{ label: 'Berry', value: 'berry' },
				{ label: 'Muted', value: 'muted' },
				{ label: 'Sunshine', value: 'sunshine' }
			]
		}
	]
};
