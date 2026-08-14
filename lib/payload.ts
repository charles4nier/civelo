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

// Item 14 — utilisée par la route générique `app/[...slug]/page.tsx`. Pas de
// donnée statique de repli possible ici (une page purement dynamique n'a par
// définition pas de fichier de route en dur) — Payload injoignable est donc
// traité comme "page introuvable", pas comme une erreur qui casse le rendu.
export async function getPageBySlug(slug: string) {
	try {
		const payload = await getPayloadClient();
		const { docs } = await payload.find({
			collection: 'pages',
			where: { slug: { equals: slug } },
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
		const { docs } = await payload.find({
			collection: 'pages',
			where: { slug: { equals: slug } },
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
		const { docs } = await payload.find({
			collection: 'pages',
			where: { slug: { equals: slug } },
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
		const { docs } = await payload.find({
			collection: 'pages',
			where: { slug: { equals: slug } },
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
		const { docs } = await payload.find({
			collection: 'pages',
			where: { slug: { equals: slug } },
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
	icone?: string;
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
		const { docs } = await payload.find({
			collection: 'pages',
			where: { slug: { equals: slug } },
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
				icon: item.icone ?? 'HelpCircle',
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
		const { docs } = await payload.find({
			collection: 'pages',
			where: { slug: { equals: slug } },
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

type PayloadCatalogueLigne = { public: string; prix: string; caution?: string };
type PayloadCatalogueGroupe = { label: string; lignes?: PayloadCatalogueLigne[] };
type PayloadCatalogueNote = { texte: string; type?: 'info' | 'condition' };
type PayloadCatalogueSalle = {
	nom: string;
	description?: string;
	icone?: string;
	groupesTarifs?: PayloadCatalogueGroupe[];
	notes?: PayloadCatalogueNote[];
};

// Item 13 — gabarit Catalogue de lieux (décision 38 : schéma étoffé pour
// coller au contenu réel de Location de salles).
export async function getCatalogueLieuxItems(slug: string) {
	try {
		const payload = await getPayloadClient();
		const { docs } = await payload.find({
			collection: 'pages',
			where: { slug: { equals: slug } },
			limit: 1
		});
		const page = docs[0] as unknown as { catalogueLieux?: { salles?: PayloadCatalogueSalle[] } } | undefined;
		const salles = page?.catalogueLieux?.salles;
		if (!salles || salles.length === 0) return null;

		return salles.map((s, i) => ({
			key: String(i),
			nom: s.nom,
			description: s.description,
			icone: s.icone,
			groupesTarifs: (s.groupesTarifs ?? []).map((g) => ({ label: g.label, lignes: g.lignes ?? [] })),
			notes: (s.notes ?? []).map((n) => ({ texte: n.texte, type: n.type ?? 'info' }))
		}));
	} catch (err) {
		console.warn(`[payload] getCatalogueLieuxItems("${slug}") : base injoignable, repli sur les données statiques.`, err);
		return null;
	}
}

type PayloadContactCoordonnee = PayloadContactItem & { description?: string };

const CONTACT_TYPE_META: Record<
	PayloadContactCoordonnee['type'],
	{ icon: string; iconVariant: IconVariant; category: string }
> = {
	phone: { icon: 'Phone', iconVariant: 'primary', category: 'Par téléphone' },
	email: { icon: 'Mail', iconVariant: 'leaf', category: 'Par email' },
	address: { icon: 'MapPin', iconVariant: 'coral', category: 'En personne' },
	hours: { icon: 'Clock', iconVariant: 'muted', category: 'Horaires' }
};

// Item 13 — gabarit Contact. `icon`/`iconVariant`/`category` sont dérivés du
// `type` (décision 38), pas des champs éditeur en plus — évite d'ajouter des
// champs redondants avec une info déjà présente.
export async function getContactData(slug: string) {
	try {
		const payload = await getPayloadClient();
		const { docs } = await payload.find({
			collection: 'pages',
			where: { slug: { equals: slug } },
			depth: 1,
			limit: 1
		});
		const page = docs[0] as unknown as
			| { contact?: { coordonnees?: PayloadContactCoordonnee[]; formulaireActif?: boolean } }
			| undefined;
		const coordonnees = page?.contact?.coordonnees;
		if (!coordonnees || coordonnees.length === 0) return null;

		const cards = coordonnees
			.map((c, i) => {
				const meta = CONTACT_TYPE_META[c.type];
				const value =
					c.type === 'phone'
						? typeof c.telephone === 'object'
							? c.telephone?.numero
							: undefined
						: c.type === 'email'
							? typeof c.email === 'object'
								? c.email?.adresse
								: undefined
							: c.valeur;
				if (!value) return null;
				return {
					key: String(i),
					icon: meta.icon,
					iconVariant: meta.iconVariant,
					category: meta.category,
					name: value,
					description: c.description,
					contacts: mapContacts([{ type: c.type, valeur: c.valeur, telephone: c.telephone, email: c.email }])
				};
			})
			.filter((c): c is NonNullable<typeof c> => c !== null);

		if (cards.length === 0) return null;
		return { cards, formulaireActif: page?.contact?.formulaireActif ?? true };
	} catch (err) {
		console.warn(`[payload] getContactData("${slug}") : base injoignable, repli sur les données statiques.`, err);
		return null;
	}
}

type PayloadUrgence = { numero: string; label: string; description?: string; couleur?: 'red' | 'blue' | 'muted' };
type PayloadContactLocal = { label: string; detail?: string; telephone?: { numero: string } | string };

// Item 13 — gabarit Numéros utiles.
export async function getNumerosUtilesData(slug: string) {
	try {
		const payload = await getPayloadClient();
		const { docs } = await payload.find({
			collection: 'pages',
			where: { slug: { equals: slug } },
			depth: 2,
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
			locaux: (locaux ?? []).map((l, i) => {
				const numero = typeof l.telephone === 'object' ? l.telephone?.numero : undefined;
				return {
					key: String(i),
					label: l.label,
					number: numero ?? '',
					detail: l.detail,
					href: numero ? `tel:${numero.replace(/\s/g, '')}` : '#'
				};
			})
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
type PayloadContactPratique = {
	icone?: string;
	label: string;
	nom: string;
	description?: string;
	contacts?: PayloadContactItem[];
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
		const { docs } = await payload.find({
			collection: 'pages',
			where: { slug: { equals: slug } },
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
				icon: c.icone ?? 'HelpCircle',
				iconVariant: CONTACT_VARIANTS[i % CONTACT_VARIANTS.length],
				category: c.label,
				name: c.nom,
				description: c.description,
				contacts: mapContacts(c.contacts)
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
		const [poisRes, sentiersRes] = await Promise.all([
			payload.find({ collection: 'pois', limit: 0, pagination: false }),
			payload.find({ collection: 'sentiers', limit: 0, pagination: false })
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
				image: (typeof p.image === 'object' ? p.image?.url : undefined) ?? ''
			})),
			sentiers: sentiersDocs.map((s) => ({
				id: String(s.id),
				name: s.nom,
				description: s.description,
				distance: s.distance ?? '',
				duration: s.duree ?? '',
				coordinates: (s.trace ?? []).map((c): [number, number] => [c.lat, c.lng]),
				image: (typeof s.image === 'object' ? s.image?.url : undefined) ?? ''
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
	quickAccessItems?: { icone?: string; titre: string; description?: string; lien?: PayloadPageRelation }[];
	mayorWord?: {
		image?: PayloadUpload;
		citation: string;
		nomSignataire?: string;
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
	cta?: { titre?: string; description?: string; boutonLabel?: string; coordonnees?: PayloadContactItem[] };
};

function uploadUrl(u: PayloadUpload | undefined): string {
	return (typeof u === 'object' ? u?.url : undefined) ?? '';
}

// Item 13 — gabarit Accueil (singleton, décision 9) : recherché par `gabarit`
// plutôt que par `slug` — un singleton est garanti unique par gabarit
// (décision 9), pas besoin de connaître son slug exact pour le trouver.
export async function getAccueilData() {
	try {
		const payload = await getPayloadClient();
		const { docs } = await payload.find({
			collection: 'pages',
			where: { gabarit: { equals: 'accueil' } },
			depth: 2,
			limit: 1
		});
		const page = docs[0] as unknown as { accueil?: PayloadAccueil } | undefined;
		const accueil = page?.accueil;
		if (!accueil) return null;

		return {
			hero: accueil.hero
				? {
						image: uploadUrl(accueil.hero.image),
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
				icon: it.icone ?? 'HelpCircle',
				title: it.titre,
				desc: it.description,
				href: resolvePageHref(it.lien) ?? '#'
			})),
			mayorWord: accueil.mayorWord
				? {
						image: uploadUrl(accueil.mayorWord.image),
						citation: accueil.mayorWord.citation,
						nomSignataire: accueil.mayorWord.nomSignataire,
						statNombre: accueil.mayorWord.statNombre,
						statLibelle: accueil.mayorWord.statLibelle
					}
				: null,
			discoverCards: (accueil.discoverCards ?? []).map((c, i) => {
				const poiId = typeof c.lienPoi === 'object' ? c.lienPoi?.id : undefined;
				const sentierId = typeof c.lienSentier === 'object' ? c.lienSentier?.id : undefined;
				const id = poiId ?? sentierId;
				return {
					key: String(i),
					etiquette: c.etiquette,
					titre: c.titre,
					description: c.description,
					image: uploadUrl(c.image),
					href: id ? `/tourisme/carte-interactive?id=${id}` : '/tourisme/carte-interactive'
				};
			}),
			cta: accueil.cta
				? {
						titre: accueil.cta.titre,
						description: accueil.cta.description,
						boutonLabel: accueil.cta.boutonLabel,
						contacts: mapContacts(accueil.cta.coordonnees)
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
