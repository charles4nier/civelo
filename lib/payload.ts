import { getPayload } from 'payload';
import config from '../payload.config';
import type { AnnuaireCardData } from '@shared/components/AnnuaireLayout';
import type { ContactItem, IconVariant } from '@shared/components/ContactCard';

// Item 11/12 de la feuille de route — couche de récupération de données
// Payload, utilisée par les Server Components (app/**/page.tsx,
// app/layout.tsx) à la place des imports directs de `data.ts`.
//
// Types volontairement minimaux et écrits à la main ici plutôt qu'importés
// depuis `types/payload-types.ts` : ce fichier n'existe pas encore (généré
// par Payload uniquement au premier vrai démarrage connecté à une base,
// item 5). Une fois généré, ces types locaux pourront être remplacés par les
// types réels sans changer la forme des fonctions ci-dessous.

export type MenuSection = 'essentiel' | 'mairie' | 'commune' | 'tourisme';

export type NavPage = {
	id: string;
	title: string;
	slug: string;
	menu: MenuSection;
};

// Décision 15 — les 4 sections sont fixes, dev-only, jamais éditables côté
// client. Labels affichés dans le Header.
export const MENU_SECTIONS: { key: MenuSection; label: string }[] = [
	{ key: 'essentiel', label: "L'essentiel" },
	{ key: 'mairie', label: 'Votre mairie' },
	{ key: 'commune', label: 'Ma commune' },
	{ key: 'tourisme', label: 'Tourisme & découverte' }
];

let cached: Awaited<ReturnType<typeof getPayload>> | null = null;

export async function getPayloadClient() {
	if (!cached) {
		cached = await getPayload({ config });
	}
	return cached;
}

// Menu figé, tel qu'il existait avant Payload — sert de filet de sécurité
// (voir getNavLinks ci-dessous). Le site reste utilisable sans base
// connectée : le brancher directement sur Payload sans repli aurait rendu
// TOUT le site (chaque page passe par ce layout) indisponible tant qu'aucune
// base n'est configurée, ce qui aurait cassé le fonctionnement autonome que
// le projet a gardé jusqu'ici (décision explicite de l'item 5).
const DEFAULT_NAV_LINKS = [
	{
		label: "L'essentiel",
		href: '#',
		children: [
			{ label: 'Mes démarches', href: '/demarches' },
			{ label: 'Agenda', href: '/agenda' },
			{ label: 'Contact', href: '/contact' },
			{ label: 'Numéros utiles', href: '/numeros-utiles' }
		]
	},
	{
		label: 'Votre mairie',
		href: '#',
		children: [
			{ label: 'Actualités', href: '/mairie/actualites' },
			{ label: 'Le maire & les élus', href: '/mairie/maire-elus' },
			{ label: 'Documents & publications', href: '/mairie/publications' },
			{ label: 'Horaires & informations', href: '/mairie/horaires' },
			{ label: 'Budget & projets', href: '/mairie/budget-projets' }
		]
	},
	{
		label: 'Vivre à Saint-Hilaire',
		href: '#',
		children: [
			{ label: 'La commune', href: '/vivre/la-commune' },
			{ label: 'Services & vie pratique', href: '/commerces' },
			{ label: 'Enfance & jeunesse', href: '/vivre/enfance-jeunesse' },
			{ label: 'Vie associative', href: '/vivre/vie-associative' },
			{ label: 'Sports & loisirs', href: '/vivre/sports-loisirs' }
		]
	},
	{
		label: 'Tourisme & découvertes',
		href: '#',
		children: [
			{ label: 'Histoire', href: '/histoire' },
			{ label: 'Carte interactive', href: '/tourisme/carte-interactive' }
		]
	}
];

// Décisions 1 à 5 — construit le menu dynamiquement à partir de la
// collection `pages`, groupé par section, trié par `_order` (décision 5,
// tri par défaut de la collection `orderable`). Repli sur le menu figé si
// Payload n'est pas joignable (pas de base connectée) — voir le commentaire
// sur DEFAULT_NAV_LINKS.
export async function getNavLinks() {
	try {
		const payload = await getPayloadClient();
		const { docs } = await payload.find({
			collection: 'pages',
			limit: 0,
			pagination: false,
			select: { title: true, slug: true, menu: true }
		});

		const pages = docs as unknown as NavPage[];

		return MENU_SECTIONS.map((section) => ({
			label: section.label,
			href: '#',
			children: pages
				.filter((p) => p.menu === section.key)
				.map((p) => ({ label: p.title, href: `/${p.slug}` }))
		}));
	} catch (err) {
		console.warn('[payload] getNavLinks : base injoignable, repli sur le menu figé.', err);
		return DEFAULT_NAV_LINKS;
	}
}

export async function getPageBySlug(slug: string) {
	const payload = await getPayloadClient();
	const { docs } = await payload.find({
		collection: 'pages',
		where: { slug: { equals: slug } },
		limit: 1
	});
	return docs[0] ?? null;
}

const ICON_VARIANTS: IconVariant[] = ['primary', 'coral', 'leaf', 'muted', 'sunshine'];
function toIconVariant(value: string | undefined): IconVariant {
	return (ICON_VARIANTS as string[]).includes(value ?? '') ? (value as IconVariant) : 'muted';
}

type PayloadCategory = { id: string; nom: string; icone?: string; couleur?: string };
type PayloadContactItem = {
	type: 'address' | 'hours' | 'phone' | 'email';
	valeur?: string;
	telephone?: { numero: string } | string;
	email?: { adresse: string } | string;
};
type PayloadAnnuaireItem = {
	nom: string;
	categorie: PayloadCategory | string;
	badge?: string;
	description?: string;
	contacts?: PayloadContactItem[];
};

function mapContacts(contacts: PayloadContactItem[] | undefined): ContactItem[] {
	if (!contacts) return [];
	const mapped: (ContactItem | null)[] = contacts.map((c) => {
		if (c.type === 'address' || c.type === 'hours') {
			return c.valeur ? { type: c.type, value: c.valeur } : null;
		}
		if (c.type === 'phone') {
			const numero = typeof c.telephone === 'object' ? c.telephone?.numero : undefined;
			return numero ? { type: 'phone', value: numero } : null;
		}
		if (c.type === 'email') {
			const adresse = typeof c.email === 'object' ? c.email?.adresse : undefined;
			return adresse ? { type: 'email', value: adresse } : null;
		}
		return null;
	});
	return mapped.filter((c): c is ContactItem => c !== null);
}

// Item 11 — utilisé par les 4 pages Annuaire (Commerces, Vie associative,
// Enfance & jeunesse, Sports & loisirs). Retourne `null` si Payload est
// injoignable OU si la page n'existe pas encore côté base : dans les deux
// cas, l'appelant retombe sur ses données statiques (voir chaque page).
export async function getAnnuaireItems(slug: string): Promise<AnnuaireCardData[] | null> {
	try {
		const payload = await getPayloadClient();
		const { docs } = await payload.find({
			collection: 'pages',
			where: { slug: { equals: slug } },
			depth: 2,
			limit: 1
		});
		const page = docs[0] as unknown as { liste?: { itemsAnnuaire?: PayloadAnnuaireItem[] } } | undefined;
		const items = page?.liste?.itemsAnnuaire;
		if (!items || items.length === 0) return null;

		return items.map((item) => {
			const cat = typeof item.categorie === 'object' ? item.categorie : undefined;
			return {
				key: item.nom,
				icon: cat?.icone ?? 'HelpCircle',
				iconVariant: toIconVariant(cat?.couleur),
				category: cat?.nom ?? '',
				name: item.nom,
				badge: item.badge,
				description: item.description,
				contacts: mapContacts(item.contacts)
			};
		});
	} catch (err) {
		console.warn(`[payload] getAnnuaireItems("${slug}") : base injoignable, repli sur les données statiques.`, err);
		return null;
	}
}

// Décision 14 — un champ `relationship` vers `pages` doit être résolu en
// href réel au rendu, jamais présumé à partir d'une URL recopiée. Accepte
// soit un id (relation non peuplée), soit un document déjà peuplé (depth > 0).
export function resolvePageHref(
	relation: string | { slug?: string } | null | undefined
): string | undefined {
	if (!relation) return undefined;
	if (typeof relation === 'string') return undefined; // non peuplé, à dépth>0 côté requête
	return relation.slug ? `/${relation.slug}` : undefined;
}
