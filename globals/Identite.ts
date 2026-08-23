import type { CollectionConfig } from 'payload';
import { isLoggedIn } from '../collections/access';
import { withInfo } from '../collections/Pages';

// Décision 61 — logo/titre/sous-titre du site étaient dupliqués en dur dans
// `Header` ET `Footer` (même blason, même nom de commune répétés dans les
// deux composants). Un seul document, lu par les deux composants au rendu —
// une seule saisie, jamais de désynchronisation entre l'en-tête et le pied
// de page.
//
// Étape 5 du plan multi-tenant — était un `Global` Payload (singleton en
// base par construction, une seule ligne possible pour toute l'appli).
// Incompatible avec le multi-tenant (chaque commune a sa propre identité).
// Converti en collection classique, `isGlobal: true` dans la config du
// plugin multi-tenant fait qu'elle se comporte comme un global — mais un
// par tenant. Mêmes champs, même slug, aucun changement de contenu.
export const Identite: CollectionConfig = {
	slug: 'identite',
	labels: { singular: 'Identité du site', plural: 'Identité du site' },
	access: {
		read: () => true,
		update: isLoggedIn
	},
	fields: [
		withInfo(
			{ name: 'titre', type: 'text', required: true, label: 'Titre du site' },
			"Le nom de la commune, affiché dans l'en-tête et le pied de page."
		),
		{
			name: 'sousTitre',
			type: 'text',
			label: 'Sous-titre',
			admin: { description: 'Ex. "Haute-Vienne · 87260" — affiché sous le titre.' }
		},
		{
			name: 'logo',
			type: 'upload',
			relationTo: 'media',
			label: 'Logo',
			admin: { description: "Le blason ou logo affiché dans l'en-tête et le pied de page du site." }
		}
	]
};
