import type { GlobalConfig } from 'payload';
import { isLoggedIn } from '../collections/access';
import { contactFields, withInfo } from '../collections/Pages';

// Décision 61 — pied de page entièrement en dur jusqu'ici (adresse,
// horaires, réseaux sociaux, texte de présentation). Réutilise
// `contactFields` (adresse/téléphone/email, décision 48/49/50) pour rester
// cohérent avec le reste du site — mêmes libellés, même comportement.
export const Footer: GlobalConfig = {
	slug: 'footer',
	label: 'Pied de page',
	access: {
		read: () => true,
		update: isLoggedIn
	},
	fields: [
		{
			name: 'description',
			type: 'textarea',
			label: 'Texte de présentation',
			admin: { description: 'Le texte affiché en haut du pied de page, sous le nom de la commune.' }
		},
		...contactFields,
		{
			name: 'joursOuverture',
			type: 'text',
			label: "Jours d'ouverture",
			admin: { description: 'Ex. "Lundi – Vendredi".' }
		},
		{
			name: 'horaires',
			type: 'text',
			label: 'Horaires',
			admin: { description: 'Ex. "9h–12h / 14h–17h".' }
		},
		withInfo(
			{ name: 'facebook', type: 'text', label: 'Lien Facebook' },
			'Le lien vers la page Facebook de la commune (optionnel).'
		),
		withInfo(
			{ name: 'instagram', type: 'text', label: 'Lien Instagram' },
			'Le lien vers le compte Instagram de la commune (optionnel).'
		)
	]
};
