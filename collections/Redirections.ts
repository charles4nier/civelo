import type { CollectionConfig } from 'payload';
import { isAdminOrAbove, isLoggedIn } from './access';
import { withInfo } from './Pages';

// Décision 98 (chantier « fiches », §5) — redirections 301 d'une ancienne
// adresse vers une page ou une fiche du site : reprise du site existant
// d'une mairie (ses anciennes URL restent valides) et renommage d'une page
// (redirection créée automatiquement, voir le hook `afterChange` de
// `Pages.ts`). Résolues dans la route générique
// `app/(frontend)/[...slug]/page.tsx`, juste avant la 404 — pas dans
// `middleware.ts`, qui tourne en Edge sans accès à Postgres (décision 97).
//
// Acte structurel : gérées par l'admin de la commune et le super-admin, pas
// par les éditeurs.

// « https://www.mairie-x.fr/Vie-municipale/?id=3 » → « /Vie-municipale?id=3 » :
// on ne garde que le chemin (et la requête), sans barre finale.
export function normaliserChemin(valeur: string): string {
	let v = valeur.trim();
	try {
		v = decodeURI(v);
	} catch {
		// Adresse mal encodée : gardée telle quelle.
	}
	v = v.replace(/^[a-z]+:\/\/[^/]+/i, '');
	if (!v.startsWith('/')) v = `/${v}`;
	const [chemin, requete] = v.split('?');
	const cheminPropre = chemin.length > 1 ? chemin.replace(/\/+$/, '') : chemin;
	return requete ? `${cheminPropre}?${requete}` : cheminPropre;
}

export const Redirections: CollectionConfig = {
	slug: 'redirections',
	labels: { singular: 'Redirection', plural: 'Redirections' },
	indexes: [{ fields: ['tenant', 'de'], unique: true }],
	admin: {
		useAsTitle: 'de',
		defaultColumns: ['de', 'cible', 'origine', 'updatedAt'],
		description:
			"Une ancienne adresse du site renvoie vers une page ou une fiche d'aujourd'hui (redirection définitive, dite 301). Utile pour les liens de l'ancien site de la mairie."
	},
	access: {
		create: isAdminOrAbove,
		update: isAdminOrAbove,
		delete: isAdminOrAbove,
		read: isLoggedIn
	},
	fields: [
		withInfo(
			{ name: 'de', type: 'text', required: true, label: 'Ancienne adresse' },
			"Le chemin de l'ancienne adresse, ex. /vie-municipale/conseil.html (une adresse complète collée est raccourcie)."
		),
		withInfo(
			{ name: 'cible', type: 'relationship', relationTo: ['pages', 'fiches'], required: true, label: 'Vers' },
			'La page ou la fiche où envoyer le visiteur.'
		),
		{
			name: 'origine',
			type: 'select',
			defaultValue: 'manuelle',
			options: [
				{ label: 'Saisie à la main', value: 'manuelle' },
				{ label: "Changement d'adresse d'une page", value: 'renommage' }
			],
			admin: { readOnly: true, position: 'sidebar' }
		}
	],
	hooks: {
		beforeValidate: [
			({ data }) => {
				if (data?.de) data.de = normaliserChemin(String(data.de));
				return data;
			}
		]
	}
};
