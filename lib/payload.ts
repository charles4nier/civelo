import { getPayload } from 'payload';
import { draftMode } from 'next/headers';
import config from '../payload.config';
import type { AnnuaireCardData } from '@themes/edito/components/AnnuaireLayout';
import type { ContactItem, IconVariant } from '@themes/edito/components/ContactCard';
import type { EditorialSection } from '@themes/edito/components/EditorialLayout/Sections';
import { getCurrentTenant } from '@shared/lib/tenant';

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

// Étape 8 du plan multi-tenant — chaque fonction ci-dessous résout le
// tenant courant (domaine de la requête) et l'ajoute à ses requêtes. Un
// tenant non résolu lève une erreur volontairement : chaque fonction a déjà
// un `try/catch` qui retombe sur son repli statique/`null` existant — pas
// de nouveau chemin d'erreur à gérer, et surtout jamais de requête non
// scopée qui pourrait renvoyer le contenu d'une autre commune par défaut.
async function requireTenant(payload: Awaited<ReturnType<typeof getPayloadClient>>) {
	const tenant = await getCurrentTenant(payload);
	if (!tenant) throw new Error('Tenant introuvable pour ce domaine.');
	return tenant;
}

// Variante de disposition de la page d'accueil ("defaut"/"tourisme",
// `Tenants.variante`) — pour l'instant seul le thème édito en tient compte
// (voir `themes/edito/features/home/index.tsx`). Même pattern de repli que
// `getCurrentTheme()` (`shared/lib/theme.ts`) : jamais d'exception qui
// casserait le rendu, retombe sur la variante par défaut.
export type Variant = 'defaut' | 'tourisme';
export const DEFAULT_VARIANT: Variant = 'defaut';

export async function getCurrentVariant(): Promise<Variant> {
	try {
		const payload = await getPayloadClient();
		const tenant = await getCurrentTenant(payload);
		return tenant?.variante === 'tourisme' ? 'tourisme' : DEFAULT_VARIANT;
	} catch (err) {
		console.warn('[payload] getCurrentVariant() : base injoignable, repli sur la variante par défaut.', err);
		return DEFAULT_VARIANT;
	}
}

// Mode brouillon/preview (roadmap 2026-09-14) — reflète le Draft Mode posé
// par `app/(payload)/api/preview` (jamais activable autrement qu'en passant
// par cette route, qui revérifie l'utilisateur et le tenant). Utilisé par
// toutes les fonctions ci-dessous qui lisent `pages` : en dehors d'un aperçu,
// `pages` a `versions.drafts` activé donc Payload continue de renvoyer la
// dernière version PUBLIÉE de lui-même, sans que ce booléen n'ait besoin
// d'être vrai.
async function isPreviewing() {
	return (await draftMode()).isEnabled;
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
		// Étape 5 du plan multi-tenant — était "Vivre à Saint-Hilaire" (nom de
		// commune en dur dans un repli censé s'appliquer à n'importe quelle
		// commune une fois multi-tenant). Aligné sur le libellé générique de
		// `MENU_SECTIONS` ci-dessus.
		label: 'Ma commune',
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
		label: 'Tourisme & découverte',
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
		const tenant = await requireTenant(payload);
		const { docs } = await payload.find({
			collection: 'pages',
			draft: await isPreviewing(),
			where: { tenant: { equals: tenant.id } },
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

// Item 14 — utilisée par la route générique `app/[...slug]/page.tsx`. Pas de
// donnée statique de repli possible ici (une page purement dynamique n'a par
// définition pas de fichier de route en dur) — Payload injoignable est donc
// traité comme "page introuvable", pas comme une erreur qui casse le rendu.
export async function getPageBySlug(slug: string) {
	try {
		const payload = await getPayloadClient();
		const tenant = await requireTenant(payload);
		const { docs } = await payload.find({
			collection: 'pages',
			draft: await isPreviewing(),
			where: { and: [{ slug: { equals: slug } }, { tenant: { equals: tenant.id } }] },
			limit: 1
		});
		return docs[0] ?? null;
	} catch (err) {
		console.warn(`[payload] getPageBySlug("${slug}") : base injoignable.`, err);
		return null;
	}
}

const ICON_VARIANTS: IconVariant[] = ['primary', 'coral', 'leaf', 'muted', 'sunshine'];
function toIconVariant(value: string | undefined): IconVariant {
	return (ICON_VARIANTS as string[]).includes(value ?? '') ? (value as IconVariant) : 'muted';
}

// Décision 55 — `icone` est désormais une relation vers la collection
// `icones` (texte libre jugé pas intuitif, même logique que la décision 49
// sur téléphones/emails), pas un nom de composant lucide-react en clair.
type PayloadIconRelation = { icone?: string; nom?: string } | string;
function resolveIconName(rel: PayloadIconRelation | undefined, fallback: string): string;
function resolveIconName(rel: PayloadIconRelation | undefined): string | undefined;
function resolveIconName(rel: PayloadIconRelation | undefined, fallback?: string): string | undefined {
	return (typeof rel === 'object' ? rel?.icone : undefined) ?? fallback;
}

type PayloadCategory = { id: string; nom: string; icone?: PayloadIconRelation; couleur?: string };
// Décision 48 (annule décision 22) — plus de tableau type+valeur : un seul
// jeu adresse/téléphone/email direct, tous optionnels. Décision 49 (annule
// décision 22) — `telephone`/`email` redeviennent des chaînes directes, plus
// une relation vers une collection `telephones`/`emails` (jugée pas
// intuitive à l'usage, surtout dans les fiches).
type PayloadContactGroup = {
	adresse?: string;
	telephone?: string;
	email?: string;
	siteWeb?: string;
};
// Décision 50 — plus de sous-groupe `contacts` : adresse/téléphone/email
// mis à plat directement sur la fiche, pour suivre le flux normal des
// champs (plus de `group-field--within-group` visuel dans l'admin).
type PayloadAnnuaireItem = PayloadContactGroup & {
	nom: string;
	categorie: PayloadCategory | string;
	badge?: string;
	description?: string;
};

function mapContactGroup(group: PayloadContactGroup | undefined): ContactItem[] {
	if (!group) return [];
	const items: ContactItem[] = [];
	if (group.adresse) items.push({ type: 'address', value: group.adresse });
	if (group.telephone) items.push({ type: 'phone', value: group.telephone });
	if (group.email) items.push({ type: 'email', value: group.email });
	if (group.siteWeb) items.push({ type: 'website', value: group.siteWeb });
	return items;
}

// Item 11 — utilisé par les 4 pages Annuaire (Commerces, Vie associative,
// Enfance & jeunesse, Sports & loisirs). Retourne `null` si Payload est
// injoignable OU si la page n'existe pas encore côté base : dans les deux
// cas, l'appelant retombe sur ses données statiques (voir chaque page).
export async function getAnnuaireItems(slug: string): Promise<AnnuaireCardData[] | null> {
	try {
		const payload = await getPayloadClient();
		const tenant = await requireTenant(payload);
		const { docs } = await payload.find({
			collection: 'pages',
			draft: await isPreviewing(),
			where: { and: [{ slug: { equals: slug } }, { tenant: { equals: tenant.id } }] },
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
				icon: resolveIconName(cat?.icone, 'HelpCircle'),
				iconVariant: toIconVariant(cat?.couleur),
				category: cat?.nom ?? '',
				name: item.nom,
				badge: item.badge,
				description: item.description,
				contacts: mapContactGroup(item)
			};
		});
	} catch (err) {
		console.warn(`[payload] getAnnuaireItems("${slug}") : base injoignable, repli sur les données statiques.`, err);
		return null;
	}
}

type PayloadAgendaItem = {
	titre: string;
	categorie: PayloadCategory | string;
	date: string;
	horaire?: string;
	lieu: string;
	description?: string;
};

// Item 13 — même pattern que getAnnuaireItems, pour la carte "agenda" du
// gabarit Liste. `categorie.couleur` (décision 24) fournit directement la
// variante visuelle, plus besoin d'un mapping en dur par catégorie.
export async function getAgendaItems(slug: string) {
	try {
		const payload = await getPayloadClient();
		const tenant = await requireTenant(payload);
		const { docs } = await payload.find({
			collection: 'pages',
			draft: await isPreviewing(),
			where: { and: [{ slug: { equals: slug } }, { tenant: { equals: tenant.id } }] },
			depth: 2,
			limit: 1
		});
		const page = docs[0] as unknown as { liste?: { itemsAgenda?: PayloadAgendaItem[] } } | undefined;
		const items = page?.liste?.itemsAgenda;
		if (!items || items.length === 0) return null;

		return items.map((item, i) => {
			const cat = typeof item.categorie === 'object' ? item.categorie : undefined;
			return {
				key: String(i),
				title: item.titre,
				category: cat?.nom ?? '',
				categoryVariant: toIconVariant(cat?.couleur),
				date: item.date,
				time: item.horaire,
				location: item.lieu,
				desc: item.description
			};
		});
	} catch (err) {
		console.warn(`[payload] getAgendaItems("${slug}") : base injoignable, repli sur les données statiques.`, err);
		return null;
	}
}

type PayloadActualiteItem = {
	titre: string;
	categorie: PayloadCategory | string;
	date: string;
	extrait: string;
	epinglee?: boolean;
	lienDocument?: { slug?: string } | string;
};

// Item 13 — carte "actualites" du gabarit Liste. `epinglee` est lue ici
// (utile pour la page elle-même comme pour le futur bloc Accueil, décision
// 16/36) même si cette fonction ne l'exploite pas encore côté tri.
export async function getActualitesItems(slug: string) {
	try {
		const payload = await getPayloadClient();
		const tenant = await requireTenant(payload);
		const { docs } = await payload.find({
			collection: 'pages',
			draft: await isPreviewing(),
			where: { and: [{ slug: { equals: slug } }, { tenant: { equals: tenant.id } }] },
			depth: 2,
			limit: 1
		});
		const page = docs[0] as unknown as { liste?: { itemsActualites?: PayloadActualiteItem[] } } | undefined;
		const items = page?.liste?.itemsActualites;
		if (!items || items.length === 0) return null;

		return items.map((item, i) => {
			const cat = typeof item.categorie === 'object' ? item.categorie : undefined;
			return {
				key: String(i),
				title: item.titre,
				category: cat?.nom ?? '',
				categoryVariant: toIconVariant(cat?.couleur),
				date: item.date,
				excerpt: item.extrait,
				epinglee: item.epinglee ?? false,
				documentHref: resolvePageHref(item.lienDocument)
			};
		});
	} catch (err) {
		console.warn(`[payload] getActualitesItems("${slug}") : base injoignable, repli sur les données statiques.`, err);
		return null;
	}
}

type PayloadDocumentUpload = { url?: string } | string;
type PayloadDocumentItem = {
	titre: string;
	type: PayloadCategory | string;
	date: string;
	fichier?: PayloadDocumentUpload;
};

// Item 13 — carte "document" du gabarit Liste. `fichier` est un champ
// `upload` (décision 25) : peuplé, c'est un objet avec `url`.
export async function getDocumentItems(slug: string) {
	try {
		const payload = await getPayloadClient();
		const tenant = await requireTenant(payload);
		const { docs } = await payload.find({
			collection: 'pages',
			draft: await isPreviewing(),
			where: { and: [{ slug: { equals: slug } }, { tenant: { equals: tenant.id } }] },
			depth: 2,
			limit: 1
		});
		const page = docs[0] as unknown as { liste?: { itemsDocument?: PayloadDocumentItem[] } } | undefined;
		const items = page?.liste?.itemsDocument;
		if (!items || items.length === 0) return null;

		return items.map((item, i) => {
			const type = typeof item.type === 'object' ? item.type : undefined;
			const fichier = typeof item.fichier === 'object' ? item.fichier : undefined;
			return {
				key: String(i),
				title: item.titre,
				type: type?.nom ?? '',
				typeVariant: toIconVariant(type?.couleur),
				date: item.date,
				href: fichier?.url
			};
		});
	} catch (err) {
		console.warn(`[payload] getDocumentItems("${slug}") : base injoignable, repli sur les données statiques.`, err);
		return null;
	}
}

type PayloadBudgetProjetItem = {
	nature: 'budget' | 'projet';
	titre: string;
	date: string;
	fichier?: PayloadDocumentUpload;
	statut?: 'a-venir' | 'en-cours' | 'termine';
	description?: string;
};

const STATUT_LABELS: Record<NonNullable<PayloadBudgetProjetItem['statut']>, 'À venir' | 'En cours' | 'Terminé'> = {
	'a-venir': 'À venir',
	'en-cours': 'En cours',
	termine: 'Terminé'
};

// Item 13 — carte "budget-projet" du gabarit Liste. Pas de catégorie
// (décision 24) — `nature` est le seul discriminant.
export async function getBudgetProjetItems(slug: string) {
	try {
		const payload = await getPayloadClient();
		const tenant = await requireTenant(payload);
		const { docs } = await payload.find({
			collection: 'pages',
			draft: await isPreviewing(),
			where: { and: [{ slug: { equals: slug } }, { tenant: { equals: tenant.id } }] },
			depth: 2,
			limit: 1
		});
		const page = docs[0] as unknown as { liste?: { itemsBudgetProjet?: PayloadBudgetProjetItem[] } } | undefined;
		const items = page?.liste?.itemsBudgetProjet;
		if (!items || items.length === 0) return null;

		return items.map((item, i) => {
			if (item.nature === 'budget') {
				const fichier = typeof item.fichier === 'object' ? item.fichier : undefined;
				return { key: String(i), kind: 'budget' as const, title: item.titre, date: item.date, href: fichier?.url };
			}
			return {
				key: String(i),
				kind: 'projet' as const,
				title: item.titre,
				date: item.date,
				status: STATUT_LABELS[item.statut ?? 'a-venir'],
				desc: item.description
			};
		});
	} catch (err) {
		console.warn(`[payload] getBudgetProjetItems("${slug}") : base injoignable, repli sur les données statiques.`, err);
		return null;
	}
}

type PayloadDemarcheItem = {
	titre: string;
	categorie: PayloadCategory | string;
	icone?: PayloadIconRelation;
	resume: string;
	// JSON Lexical brut (SerializedEditorState) — pas typé finement ici,
	// laissé à l'appelant de le passer à <RichText> (voir
	// features/demarches/index.tsx). Reste `undefined` tant que le contenu
	// n'a pas été rédigé dans l'admin (décision 32, JSX→Lexical hors scope).
	contenu?: unknown;
};

// Item 13 — carte "demarches" du gabarit Liste. Contrairement aux autres
// cartes, `contenu` est un champ richText (Lexical), pas du texte simple —
// cette fonction reste une couche de données pures (comme les autres),
// le rendu <RichText> se fait côté appelant.
export async function getDemarchesItems(slug: string) {
	try {
		const payload = await getPayloadClient();
		const tenant = await requireTenant(payload);
		const { docs } = await payload.find({
			collection: 'pages',
			draft: await isPreviewing(),
			where: { and: [{ slug: { equals: slug } }, { tenant: { equals: tenant.id } }] },
			depth: 2,
			limit: 1
		});
		const page = docs[0] as unknown as { liste?: { itemsDemarches?: PayloadDemarcheItem[] } } | undefined;
		const items = page?.liste?.itemsDemarches;
		if (!items || items.length === 0) return null;

		return items.map((item, i) => {
			const cat = typeof item.categorie === 'object' ? item.categorie : undefined;
			return {
				key: String(i),
				category: cat?.nom ?? '',
				icon: resolveIconName(item.icone, 'HelpCircle'),
				title: item.titre,
				summary: item.resume,
				contenu: item.contenu
			};
		});
	} catch (err) {
		console.warn(`[payload] getDemarchesItems("${slug}") : base injoignable, repli sur les données statiques.`, err);
		return null;
	}
}

type PayloadTrombinoscopeMember = {
	nom: string;
	fonction: string;
	role: 'maire' | 'adjoint' | 'delegue' | 'conseiller';
	commissions?: { nom: string }[];
	note?: string;
};

// Item 13 — gabarit Trombinoscope (décision 38 : `role` explicite ajouté au
// schéma pour regrouper l'affichage sans deviner à partir de `fonction`).
export async function getTrombinoscopeData(slug: string) {
	try {
		const payload = await getPayloadClient();
		const tenant = await requireTenant(payload);
		const { docs } = await payload.find({
			collection: 'pages',
			draft: await isPreviewing(),
			where: { and: [{ slug: { equals: slug } }, { tenant: { equals: tenant.id } }] },
			depth: 1,
			limit: 1
		});
		const page = docs[0] as unknown as
			| { trombinoscope?: { membres?: PayloadTrombinoscopeMember[]; infosReunion?: string } }
			| undefined;
		const membres = page?.trombinoscope?.membres;
		if (!membres || membres.length === 0) return null;

		return {
			members: membres.map((m, i) => ({
				key: String(i),
				nom: m.nom,
				fonction: m.fonction,
				role: m.role,
				commissions: m.commissions?.map((c) => c.nom),
				note: m.note
			})),
			meetingInfo: page?.trombinoscope?.infosReunion
		};
	} catch (err) {
		console.warn(`[payload] getTrombinoscopeData("${slug}") : base injoignable, repli sur les données statiques.`, err);
		return null;
	}
}

// Décision 82 — gabarit Éditorial (Histoire, La commune), auparavant
// entièrement en dur (décision 41). `sections` reprend telle quelle la forme
// des blocs Payload (`EditorialSection`, `shared/components/EditorialLayout/
// Sections.tsx`) — pas de retraitement ici, juste la lecture.
type PayloadEditorial = {
	eyebrowText?: string;
	sousTitre?: string;
	sections?: EditorialSection[];
};

export async function getEditorialData(slug: string) {
	try {
		const payload = await getPayloadClient();
		const tenant = await requireTenant(payload);
		const { docs } = await payload.find({
			collection: 'pages',
			draft: await isPreviewing(),
			where: { and: [{ slug: { equals: slug } }, { tenant: { equals: tenant.id } }] },
			depth: 2,
			limit: 1
		});
		const page = docs[0] as unknown as { title?: string; editorial?: PayloadEditorial } | undefined;
		const sections = page?.editorial?.sections;
		if (!sections || sections.length === 0) return null;

		return {
			title: page?.title,
			eyebrowText: page?.editorial?.eyebrowText,
			sousTitre: page?.editorial?.sousTitre,
			sections
		};
	} catch (err) {
		console.warn(`[payload] getEditorialData("${slug}") : base injoignable, repli sur les données statiques.`, err);
		return null;
	}
}

type PayloadCatalogueLigne = { public: string; prix: string; caution?: string };
type PayloadCatalogueGroupe = { label: string; lignes?: PayloadCatalogueLigne[] };
type PayloadCatalogueNote = { texte: string; type?: 'info' | 'condition' };
type PayloadCatalogueSalle = {
	nom: string;
	description?: string;
	icone?: PayloadIconRelation;
	groupesTarifs?: PayloadCatalogueGroupe[];
	notes?: PayloadCatalogueNote[];
};

// Item 13 — gabarit Catalogue de lieux (décision 38 : schéma étoffé pour
// coller au contenu réel de Location de salles).
export async function getCatalogueLieuxItems(slug: string) {
	try {
		const payload = await getPayloadClient();
		const tenant = await requireTenant(payload);
		const { docs } = await payload.find({
			collection: 'pages',
			draft: await isPreviewing(),
			where: { and: [{ slug: { equals: slug } }, { tenant: { equals: tenant.id } }] },
			limit: 1
		});
		const page = docs[0] as unknown as { catalogueLieux?: { salles?: PayloadCatalogueSalle[] } } | undefined;
		const salles = page?.catalogueLieux?.salles;
		if (!salles || salles.length === 0) return null;

		return salles.map((s, i) => ({
			key: String(i),
			nom: s.nom,
			description: s.description,
			icone: resolveIconName(s.icone),
			groupesTarifs: (s.groupesTarifs ?? []).map((g) => ({ label: g.label, lignes: g.lignes ?? [] })),
			notes: (s.notes ?? []).map((n) => ({ texte: n.texte, type: n.type ?? 'info' }))
		}));
	} catch (err) {
		console.warn(`[payload] getCatalogueLieuxItems("${slug}") : base injoignable, repli sur les données statiques.`, err);
		return null;
	}
}

// Décision 50 — plus de sous-groupe `coordonnees` : adresse/téléphone/email
// mis à plat directement sur `contact`, pour suivre le flux normal des
// champs de la section. `precision` (était `coordonnees.description`)
// renommé pour ne pas entrer en collision avec la description de page.
type PayloadContact = PayloadContactGroup & { description?: string; precision?: string; formulaireActif?: boolean };

// Item 13 — gabarit Contact. Décision 48 : un seul jeu de coordonnées par
// page (plus de tableau) — une carte par champ rempli (adresse/téléphone/
// email), au lieu d'une carte par ligne de tableau.
export async function getContactData(slug: string) {
	try {
		const payload = await getPayloadClient();
		const tenant = await requireTenant(payload);
		const { docs } = await payload.find({
			collection: 'pages',
			draft: await isPreviewing(),
			where: { and: [{ slug: { equals: slug } }, { tenant: { equals: tenant.id } }] },
			depth: 1,
			limit: 1
		});
		const page = docs[0] as unknown as { contact?: PayloadContact } | undefined;
		const coord = page?.contact;
		if (!coord) return null;

		const cards: {
			key: string;
			icon: string;
			iconVariant: IconVariant;
			category: string;
			name: string;
			description?: string;
			contacts: ContactItem[];
		}[] = [];

		if (coord.telephone) {
			cards.push({
				key: 'phone',
				icon: 'Phone',
				iconVariant: 'primary',
				category: 'Par téléphone',
				name: coord.telephone,
				description: coord.precision,
				contacts: [{ type: 'phone', value: coord.telephone }]
			});
		}

		if (coord.email) {
			cards.push({
				key: 'email',
				icon: 'Mail',
				iconVariant: 'leaf',
				category: 'Par email',
				name: coord.email,
				description: coord.precision,
				contacts: [{ type: 'email', value: coord.email }]
			});
		}

		if (coord.adresse) {
			cards.push({
				key: 'address',
				icon: 'MapPin',
				iconVariant: 'coral',
				category: 'En personne',
				name: coord.adresse,
				description: coord.precision,
				contacts: [{ type: 'address', value: coord.adresse }]
			});
		}

		if (coord.siteWeb) {
			cards.push({
				key: 'website',
				icon: 'Globe',
				iconVariant: 'sunshine',
				category: 'Sur le web',
				name: coord.siteWeb,
				description: coord.precision,
				contacts: [{ type: 'website', value: coord.siteWeb }]
			});
		}

		if (cards.length === 0) return null;
		return { cards, formulaireActif: page?.contact?.formulaireActif ?? true };
	} catch (err) {
		console.warn(`[payload] getContactData("${slug}") : base injoignable, repli sur les données statiques.`, err);
		return null;
	}
}

type PayloadUrgence = { numero: string; label: string; description?: string; couleur?: 'red' | 'blue' | 'muted' };
type PayloadContactLocal = { label: string; detail?: string; telephone?: string };

// Item 13 — gabarit Numéros utiles.
export async function getNumerosUtilesData(slug: string) {
	try {
		const payload = await getPayloadClient();
		const tenant = await requireTenant(payload);
		const { docs } = await payload.find({
			collection: 'pages',
			draft: await isPreviewing(),
			where: { and: [{ slug: { equals: slug } }, { tenant: { equals: tenant.id } }] },
			depth: 1,
			limit: 1
		});
		const page = docs[0] as unknown as
			| { numerosUtiles?: { urgences?: PayloadUrgence[]; contactsLocaux?: PayloadContactLocal[] } }
			| undefined;
		const urgences = page?.numerosUtiles?.urgences;
		const locaux = page?.numerosUtiles?.contactsLocaux;
		if ((!urgences || urgences.length === 0) && (!locaux || locaux.length === 0)) return null;

		return {
			urgences: (urgences ?? []).map((u, i) => ({
				key: String(i),
				number: u.numero,
				label: u.label,
				desc: u.description,
				color: u.couleur ?? 'muted'
			})),
			locaux: (locaux ?? []).map((l, i) => ({
				key: String(i),
				label: l.label,
				number: l.telephone ?? '',
				detail: l.detail,
				href: l.telephone ? `tel:${l.telephone.replace(/\s/g, '')}` : '#'
			}))
		};
	} catch (err) {
		console.warn(`[payload] getNumerosUtilesData("${slug}") : base injoignable, repli sur les données statiques.`, err);
		return null;
	}
}

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'] as const;
const JOUR_LABELS: Record<(typeof JOURS)[number], string> = {
	lundi: 'Lundi',
	mardi: 'Mardi',
	mercredi: 'Mercredi',
	jeudi: 'Jeudi',
	vendredi: 'Vendredi',
	samedi: 'Samedi',
	dimanche: 'Dimanche'
};

type PayloadJourHoraire = { matin?: string; apresMidi?: string };
// Décision 50 — plus de sous-groupe `contacts` : mis à plat directement.
type PayloadContactPratique = PayloadContactGroup & {
	icone?: PayloadIconRelation;
	label: string;
	nom: string;
	description?: string;
};
type PayloadHoraires = Partial<Record<(typeof JOURS)[number], PayloadJourHoraire>> & {
	fermetures?: { libelle: string }[];
	contactsPratiques?: PayloadContactPratique[];
};

const CONTACT_VARIANTS: IconVariant[] = ['primary', 'leaf', 'muted', 'coral', 'sunshine'];

// Item 13 — gabarit Horaires (singleton, décision 23).
export async function getHorairesData(slug: string) {
	try {
		const payload = await getPayloadClient();
		const tenant = await requireTenant(payload);
		const { docs } = await payload.find({
			collection: 'pages',
			draft: await isPreviewing(),
			where: { and: [{ slug: { equals: slug } }, { tenant: { equals: tenant.id } }] },
			depth: 2,
			limit: 1
		});
		const page = docs[0] as unknown as { horaires?: PayloadHoraires } | undefined;
		const horaires = page?.horaires;
		if (!horaires) return null;

		const schedule = JOURS.map((jour) => ({
			day: JOUR_LABELS[jour],
			morning: horaires[jour]?.matin || 'Fermé',
			afternoon: horaires[jour]?.apresMidi || 'Fermé'
		}));

		return {
			schedule,
			fermetures: (horaires.fermetures ?? []).map((f) => f.libelle),
			contacts: (horaires.contactsPratiques ?? []).map((c, i) => ({
				key: String(i),
				icon: resolveIconName(c.icone, 'HelpCircle'),
				iconVariant: CONTACT_VARIANTS[i % CONTACT_VARIANTS.length],
				category: c.label,
				name: c.nom,
				description: c.description,
				contacts: mapContactGroup(c)
			}))
		};
	} catch (err) {
		console.warn(`[payload] getHorairesData("${slug}") : base injoignable, repli sur les données statiques.`, err);
		return null;
	}
}

type PayloadUpload = { url?: string } | string;
type PayloadPoi = {
	id: string;
	nom: string;
	description: string;
	categorie: 'hebergement' | 'site-visite';
	latitude: number;
	longitude: number;
	image?: PayloadUpload;
};
type PayloadSentier = {
	id: string;
	nom: string;
	description: string;
	distance?: string;
	duree?: string;
	trace?: { lat: number; lng: number }[];
	image?: PayloadUpload;
};

// Item 13 — gabarit Carte interactive. `pois`/`sentiers` sont des
// collections séparées (décision 23), pas des champs de la page elle-même.
export async function getCarteData() {
	try {
		const payload = await getPayloadClient();
		const tenant = await requireTenant(payload);
		const [poisRes, sentiersRes] = await Promise.all([
			payload.find({ collection: 'pois', where: { tenant: { equals: tenant.id } }, limit: 0, pagination: false }),
			payload.find({ collection: 'sentiers', where: { tenant: { equals: tenant.id } }, limit: 0, pagination: false })
		]);
		const poisDocs = poisRes.docs as unknown as PayloadPoi[];
		const sentiersDocs = sentiersRes.docs as unknown as PayloadSentier[];
		if (poisDocs.length === 0 && sentiersDocs.length === 0) return null;

		return {
			pois: poisDocs.map((p) => ({
				id: String(p.id),
				name: p.nom,
				description: p.description,
				category: p.categorie,
				lat: p.latitude,
				lng: p.longitude,
				image: (typeof p.image === 'object' ? p.image?.url : undefined) || '/saint-hilaire-bonneval-village.jpg'
			})),
			sentiers: sentiersDocs.map((s) => ({
				id: String(s.id),
				name: s.nom,
				description: s.description,
				distance: s.distance ?? '',
				duration: s.duree ?? '',
				coordinates: (s.trace ?? []).map((c): [number, number] => [c.lat, c.lng]),
				image: (typeof s.image === 'object' ? s.image?.url : undefined) || '/saint-hilaire-bonneval-forest.jpg'
			}))
		};
	} catch (err) {
		console.warn('[payload] getCarteData() : base injoignable, repli sur les données statiques.', err);
		return null;
	}
}

type PayloadPageRelation = { slug?: string } | string;
type PayloadPoiRelation = { id?: string | number } | string;
type PayloadAccueil = {
	hero?: {
		image?: PayloadUpload;
		titre?: string;
		description?: string;
		boutonPrincipalLabel?: string;
		boutonPrincipalLien?: PayloadPageRelation;
		boutonSecondaireLabel?: string;
		boutonSecondaireLien?: PayloadPageRelation;
	};
	quickAccessItems?: { icone?: PayloadIconRelation; titre: string; description?: string; lien?: PayloadPageRelation }[];
	mayorWord?: {
		image?: PayloadUpload;
		citation: string;
		nomSignataire?: string;
		afficherEncart?: boolean;
		statNombre?: string;
		statLibelle?: string;
	};
	discoverCards?: {
		etiquette?: string;
		titre: string;
		description?: string;
		image?: PayloadUpload;
		lienPoi?: PayloadPoiRelation;
		lienSentier?: PayloadPoiRelation;
	}[];
	afficherSlideshow?: boolean;
	// Variante « tourisme » (`Tenants.variante`) — slideshow de mise en avant,
	// nombre de diapositives libre (pas de min/maxRows côté Pages.ts).
	slideshow?: {
		image?: PayloadUpload;
		etiquette?: string;
		titre: string;
		description?: string;
		badgeNombre?: string;
		badgeLibelle?: string;
		boutonLabel?: string;
		lien?: PayloadPageRelation;
	}[];
	// Décision 50 — plus de sous-groupe `coordonnees` : mis à plat directement.
	cta?: PayloadContactGroup & { titre?: string; description?: string; boutonLabel?: string };
};

// Repli sur `fallback` (jamais une chaîne vide) — `<Image src="">` déclenche
// une vraie erreur React/Next, pas juste un visuel dégradé. Découvert en
// testant contre la vraie base (item 10) : les champs `image` laissés vides
// au seed (décision 32, pas de vrai fichier disponible) produisaient
// exactement ce cas.
function uploadUrl(u: PayloadUpload | undefined, fallback: string): string {
	return (typeof u === 'object' ? u?.url : undefined) || fallback;
}

// Item 13 — gabarit Accueil (singleton, décision 9) : recherché par `gabarit`
// plutôt que par `slug` — un singleton est garanti unique par gabarit
// (décision 9), pas besoin de connaître son slug exact pour le trouver.
export async function getAccueilData() {
	try {
		const payload = await getPayloadClient();
		const tenant = await requireTenant(payload);
		const { docs } = await payload.find({
			collection: 'pages',
			draft: await isPreviewing(),
			where: { and: [{ gabarit: { equals: 'accueil' } }, { tenant: { equals: tenant.id } }] },
			depth: 2,
			limit: 1
		});
		const page = docs[0] as unknown as { accueil?: PayloadAccueil } | undefined;
		const accueil = page?.accueil;
		if (!accueil) return null;

		return {
			hero: accueil.hero
				? {
						image: uploadUrl(accueil.hero.image, '/saint-hilaire-bonneval-hero.jpg'),
						titre: accueil.hero.titre ?? '',
						description: accueil.hero.description,
						boutonPrincipal: accueil.hero.boutonPrincipalLabel
							? { label: accueil.hero.boutonPrincipalLabel, href: resolvePageHref(accueil.hero.boutonPrincipalLien) }
							: undefined,
						boutonSecondaire: accueil.hero.boutonSecondaireLabel
							? {
									label: accueil.hero.boutonSecondaireLabel,
									href: resolvePageHref(accueil.hero.boutonSecondaireLien)
								}
							: undefined
					}
				: null,
			quickAccessItems: (accueil.quickAccessItems ?? []).map((it, i) => ({
				key: String(i),
				icon: resolveIconName(it.icone, 'HelpCircle'),
				title: it.titre,
				desc: it.description,
				href: resolvePageHref(it.lien) ?? '#'
			})),
			mayorWord: accueil.mayorWord
				? {
						image: uploadUrl(accueil.mayorWord.image, '/saint-hilaire-bonneval-village.jpg'),
						citation: accueil.mayorWord.citation,
						nomSignataire: accueil.mayorWord.nomSignataire,
						// Champ ajouté après coup (2026-09-16) : les pages existantes n'ont
						// pas encore cette valeur en base tant qu'elles n'ont pas été
						// resauvegardées — `!== false` plutôt que la valeur brute pour ne
						// pas masquer l'encart de tout le monde le jour de la migration.
						afficherEncart: accueil.mayorWord.afficherEncart !== false,
						statNombre: accueil.mayorWord.statNombre,
						statLibelle: accueil.mayorWord.statLibelle
					}
				: null,
			discoverCards: (accueil.discoverCards ?? []).map((c, i) => {
				const poiId = typeof c.lienPoi === 'object' ? c.lienPoi?.id : undefined;
				const sentierId = typeof c.lienSentier === 'object' ? c.lienSentier?.id : undefined;
				const id = poiId ?? sentierId;
				const DISCOVER_FALLBACK_IMAGES = [
					'/saint-hilaire-bonneval-lake.jpg',
					'/saint-hilaire-bonneval-forest.jpg',
					'/saint-hilaire-bonneval-village.jpg'
				];
				return {
					key: String(i),
					etiquette: c.etiquette,
					titre: c.titre,
					description: c.description,
					image: uploadUrl(c.image, DISCOVER_FALLBACK_IMAGES[i % DISCOVER_FALLBACK_IMAGES.length]),
					href: id ? `/tourisme/carte-interactive?id=${id}` : '/tourisme/carte-interactive'
				};
			}),
			afficherSlideshow: accueil.afficherSlideshow !== false,
		slideshow: (accueil.slideshow ?? []).map((s, i) => ({
			key: String(i),
			image: uploadUrl(s.image, '/saint-hilaire-bonneval-village.jpg'),
			etiquette: s.etiquette,
			titre: s.titre,
			description: s.description,
			badgeNombre: s.badgeNombre,
			badgeLibelle: s.badgeLibelle,
			boutonLabel: s.boutonLabel,
			href: resolvePageHref(s.lien)
		})),
		cta: accueil.cta
				? {
						titre: accueil.cta.titre,
						description: accueil.cta.description,
						boutonLabel: accueil.cta.boutonLabel,
						contacts: mapContactGroup(accueil.cta)
					}
				: null
		};
	} catch (err) {
		console.warn('[payload] getAccueilData() : base injoignable, repli sur les données statiques.', err);
		return null;
	}
}

// Décision 16/36 — bloc Actus de l'Accueil : 3 dernières par défaut, la plus
// récente actu épinglée passe en premier si il y en a une (ou plusieurs).
export function pickHomeActus<T extends { date: string; epinglee?: boolean }>(items: T[], count = 3): T[] {
	const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date));
	const pinned = sorted.filter((i) => i.epinglee).sort((a, b) => b.date.localeCompare(a.date))[0];
	if (!pinned) return sorted.slice(0, count);
	const rest = sorted.filter((i) => i !== pinned).slice(0, count - 1);
	return [pinned, ...rest];
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

// Décision 61 — en-tête/pied de page du site (jusqu'ici en dur). Repli sur
// les valeurs qui étaient codées en dur (même logique que DEFAULT_NAV_LINKS)
// si Payload est injoignable, pour ne jamais casser le rendu du site.

export type IdentiteData = { titre: string; sousTitre?: string; logoUrl: string };

export async function getIdentiteData(): Promise<IdentiteData> {
	try {
		const payload = await getPayloadClient();
		// Étape 5 du plan multi-tenant — `identite` était un `Global` Payload
		// (singleton en base), converti en collection classique tenant-scopée
		// (étape 8 : filtre `tenant` maintenant branché).
		const tenant = await requireTenant(payload);
		const { docs } = await payload.find({
			collection: 'identite',
			where: { tenant: { equals: tenant.id } },
			depth: 1,
			limit: 1
		});
		const identite = docs[0] as unknown as
			| { titre?: string; sousTitre?: string; logo?: PayloadUpload }
			| undefined;
		if (!identite) throw new Error('Aucune identité en base pour ce tenant.');
		return {
			titre: identite.titre || 'Votre commune',
			sousTitre: identite.sousTitre,
			// Pas d'image de repli générique disponible dans `public/` pour
			// l'instant (seule celle de Saint-Hilaire-Bonneval existe) — à
			// remplacer par un vrai blason par défaut quand une commune n'a
			// pas encore uploadé le sien.
			logoUrl: uploadUrl(identite.logo, '/saint-hilaire-bonneval-logo.png')
		};
	} catch (err) {
		console.warn('[payload] getIdentiteData() : base injoignable, repli sur les données par défaut.', err);
		return { titre: 'Votre commune', sousTitre: undefined, logoUrl: '/saint-hilaire-bonneval-logo.png' };
	}
}

export type BoutonEnteteData = { label: string; href: string };

export async function getBoutonEnteteData(): Promise<BoutonEnteteData> {
	try {
		const payload = await getPayloadClient();
		// Même conversion Global → collection tenant-scopée que
		// `getIdentiteData`.
		const tenant = await requireTenant(payload);
		const { docs } = await payload.find({
			collection: 'bouton-entete',
			where: { tenant: { equals: tenant.id } },
			depth: 1,
			limit: 1
		});
		const bouton = docs[0] as unknown as { boutonLabel?: string; boutonLien?: PayloadPageRelation } | undefined;
		if (!bouton) throw new Error('Aucun bouton d\'en-tête en base pour ce tenant.');
		return {
			label: bouton.boutonLabel || 'En savoir plus',
			href: resolvePageHref(bouton.boutonLien) || '/'
		};
	} catch (err) {
		console.warn('[payload] getBoutonEnteteData() : base injoignable, repli sur les données par défaut.', err);
		return { label: 'En savoir plus', href: '/' };
	}
}

export type FooterData = {
	description: string;
	adresse?: string;
	telephone?: string;
	email?: string;
	siteWeb?: string;
	joursOuverture?: string;
	horaires?: string;
	facebook?: string;
	instagram?: string;
};

// Étape 5 du plan multi-tenant — repli neutralisé (était spécifique à
// Saint-Hilaire-Bonneval : une commune B fraîchement onboardée, dont le
// document `footer` n'existe pas encore, aurait sinon montré l'adresse et
// les horaires d'une autre commune à ses visiteurs).
const FOOTER_FALLBACK: FooterData = {
	description: 'Site officiel de la mairie. Retrouvez ici toutes les informations relatives à la vie municipale, aux services publics et au territoire communal.',
	adresse: undefined,
	joursOuverture: undefined,
	horaires: undefined
};

export async function getFooterData(): Promise<FooterData> {
	try {
		const payload = await getPayloadClient();
		// Même conversion Global → collection tenant-scopée que
		// `getIdentiteData`/`getBoutonEnteteData`.
		const tenant = await requireTenant(payload);
		const { docs } = await payload.find({
			collection: 'footer',
			where: { tenant: { equals: tenant.id } },
			depth: 0,
			limit: 1
		});
		const footer = (docs[0] as unknown as FooterData | undefined) ?? ({} as FooterData);
		return {
			description: footer.description || FOOTER_FALLBACK.description,
			adresse: footer.adresse || FOOTER_FALLBACK.adresse,
			telephone: footer.telephone,
			email: footer.email,
			siteWeb: footer.siteWeb,
			joursOuverture: footer.joursOuverture || FOOTER_FALLBACK.joursOuverture,
			horaires: footer.horaires || FOOTER_FALLBACK.horaires,
			facebook: footer.facebook,
			instagram: footer.instagram
		};
	} catch (err) {
		console.warn('[payload] getFooterData() : base injoignable, repli sur les données statiques.', err);
		return FOOTER_FALLBACK;
	}
}
