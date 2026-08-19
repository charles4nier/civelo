import type { CollectionConfig } from 'payload';
import { isSuperAdmin, isLoggedIn } from './access';

// Décision 55 — jusqu'ici, tous les champs "icône" (catégories, démarches,
// salles, tuiles d'accès rapide, contacts pratiques) étaient du texte libre :
// l'éditeur devait connaître et taper le nom exact d'un composant
// lucide-react ("MapPinned", "HelpCircle"...), sans repère visuel ni liste —
// jugé pas du tout intuitif (même logique que la décision 49 sur
// téléphones/emails : remplacer une saisie libre par une vraie liste
// gérée). Cette collection centralise les icônes disponibles ; les champs
// "icône" ailleurs deviennent des relations vers `icones` (menu déroulant,
// comme les pages) au lieu de texte libre.
export const Icones: CollectionConfig = {
	slug: 'icones',
	labels: { singular: 'Icône', plural: 'Icônes' },
	admin: {
		useAsTitle: 'nom',
		defaultColumns: ['nom', 'icone'],
		description:
			"Liste des icônes disponibles dans tout le site (catégories, démarches, salles, tuiles d'accès rapide...). Le nom de l'icône doit correspondre exactement à un composant de la bibliothèque lucide-react (lucide.dev/icons)."
	},
	access: {
		// Fixé au setup, même logique que les catégories (décision 10) : le
		// choix des icônes disponibles reste au dev/super-admin, pas à
		// l'éditeur mairie au quotidien.
		create: isSuperAdmin,
		update: isSuperAdmin,
		delete: isSuperAdmin,
		read: isLoggedIn
	},
	fields: [
		{
			name: 'nom',
			type: 'text',
			required: true,
			label: 'Nom',
			admin: {
				description: 'Le nom affiché dans les listes de choix (ex. "Téléphone", "Localisation").'
			}
		},
		{
			name: 'icone',
			type: 'text',
			required: true,
			label: 'Composant lucide-react',
			admin: {
				description: 'Nom exact du composant lucide-react (ex. "Phone", "MapPinned") — voir lucide.dev/icons.',
				components: {
					// `afterInput` plutôt que remplacer tout le champ (`Field`) :
					// l'input texte natif de Payload continue de fonctionner tel
					// quel (validation, focus...), seul un aperçu du glyphe est
					// ajouté à côté — moins risqué qu'une réimplémentation complète.
					afterInput: ['/admin/IconPreviewField'],
					// Colonne de la liste `/collections/icones` : glyphe + nom, pas
					// juste le texte brut.
					Cell: '/admin/IconCell'
				}
			}
		}
	]
};
