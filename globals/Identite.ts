import type { GlobalConfig } from 'payload';
import { isLoggedIn } from '../collections/access';

// Décision 61 — logo/titre/sous-titre du site étaient dupliqués en dur dans
// `Header` ET `Footer` (même blason, même nom de commune répétés dans les
// deux composants). Un seul `global` Payload, lu par les deux composants au
// rendu — une seule saisie, jamais de désynchronisation entre l'en-tête et
// le pied de page.
export const Identite: GlobalConfig = {
	slug: 'identite',
	label: 'Identité du site',
	access: {
		read: () => true,
		update: isLoggedIn
	},
	fields: [
		{ name: 'titre', type: 'text', required: true, label: 'Titre du site' },
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
