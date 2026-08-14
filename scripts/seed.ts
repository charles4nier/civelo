/**
 * Item 10 de la feuille de route — migration du contenu en dur du site
 * (saint-hilaire-demo) vers Payload. Sert de premier jeu de données réel et
 * de test du modèle (décisions 19 à 27).
 *
 * Ce script IMPORTE les données existantes depuis les fichiers `data.ts` du
 * site plutôt que de les retranscrire à la main — évite les erreurs de
 * transcription sur ~150 entrées.
 *
 * Limites connues, assumées explicitement plutôt que masquées :
 * - Aucun fichier binaire réel n'est disponible ici (images Unsplash en URL,
 *   PDF en `href: '#'` placeholder) : tous les champs `upload` (`image`,
 *   `fichier`) sont laissés vides. À compléter manuellement dans l'admin
 *   après ce seed, ou par un script d'import d'assets séparé.
 * - Le contenu riche en JSX (démarches, pages éditoriales Histoire/La
 *   commune) n'est PAS converti automatiquement en Lexical — un
 *   convertisseur JSX → Lexical fiable est hors scope ici. Les pages sont
 *   créées avec leur structure (titre, catégorie, résumé) mais `contenu`
 *   reste vide, à compléter dans l'éditeur riche texte de l'admin.
 * - Coordonnées (téléphones/emails) divergentes dans le code actuel selon
 *   l'endroit (ex. CTA Accueil vs page Contact, cf. décision 22) : ce script
 *   ne tranche PAS arbitrairement lequel est "le bon" — voir le commentaire
 *   dans `seedTelephonesEmails()`.
 *
 * Non exécuté dans cette session (pas de base connectée, choix explicite de
 * l'item 5). À lancer avec `DATABASE_URI` renseigné : `npx tsx scripts/seed.ts`.
 */

import { getPayload } from 'payload';
import config from '../payload.config';

import { commerces } from '../features/commerces/data';
import { associations } from '../features/vie-associative/data';
import { services } from '../features/enfance-jeunesse/data';
import { activities } from '../features/sports-loisirs/data';
import { events } from '../features/agenda/data';
import { articles } from '../features/actualites/data';
import { docs } from '../features/documents/data';
import { entries as budgetProjetEntries } from '../features/budget-projets/data';
import { pois, sentiers } from '../features/carte/data';
import { maire, adjoints, delegues, conseillers } from '../features/elus/data';
import { urgences, locaux } from '../features/numeros-utiles/data';

type CategoryMap = Record<string, string>;

const FRENCH_MONTHS: Record<string, string> = {
	janvier: '01',
	février: '02',
	mars: '03',
	avril: '04',
	mai: '05',
	juin: '06',
	juillet: '07',
	août: '08',
	septembre: '09',
	octobre: '10',
	novembre: '11',
	décembre: '12'
};

// Actualités stocke ses dates en texte libre ("12 Mai 2026") — converti en
// ISO pour le champ `date` de Payload.
function toISODate(frenchDate: string): string {
	const [day, monthName, year] = frenchDate.toLowerCase().split(' ');
	const month = FRENCH_MONTHS[monthName] ?? '01';
	return `${year}-${month}-${day.padStart(2, '0')}`;
}

// Icône/couleur par catégorie, reprises telles quelles des `categoryMeta` en
// dur dans chaque page statique d'origine (commerces/index.tsx,
// vie-associative/index.tsx, etc.) — pour que le seed produise les mêmes
// icônes/couleurs que le rendu statique, pas des valeurs par défaut.
const COMMERCES_CATEGORY_META: Record<string, { icone: string; couleur: string }> = {
	Alimentation: { icone: 'ShoppingBasket', couleur: 'leaf' },
	Restauration: { icone: 'UtensilsCrossed', couleur: 'coral' },
	'Cafés - Bars': { icone: 'Coffee', couleur: 'sunshine' },
	Beauté: { icone: 'Sparkles', couleur: 'coral' },
	Santé: { icone: 'Stethoscope', couleur: 'primary' },
	'Garages - mécanique': { icone: 'Wrench', couleur: 'muted' },
	'Artisans & entreprises': { icone: 'Hammer', couleur: 'leaf' },
	Autres: { icone: 'Store', couleur: 'primary' }
};

const VIE_ASSOCIATIVE_CATEGORY_META: Record<string, { icone: string; couleur: string }> = {
	'Éducation & famille': { icone: 'GraduationCap', couleur: 'primary' },
	Sports: { icone: 'Trophy', couleur: 'coral' },
	'Culture & patrimoine': { icone: 'Leaf', couleur: 'leaf' },
	'Mémoire & solidarités': { icone: 'Flame', couleur: 'muted' },
	'Engagement civique': { icone: 'Scale', couleur: 'sunshine' },
	Nature: { icone: 'TreePine', couleur: 'leaf' }
};

const ENFANCE_JEUNESSE_CATEGORY_META: Record<string, { icone: string; couleur: string }> = {
	École: { icone: 'School', couleur: 'coral' },
	'Petite enfance': { icone: 'Star', couleur: 'sunshine' },
	'Centre de loisirs': { icone: 'Users', couleur: 'primary' },
	'Assistantes maternelles': { icone: 'Baby', couleur: 'leaf' }
};

const SPORTS_LOISIRS_CATEGORY_META: Record<string, { icone: string; couleur: string }> = {
	'Équipements sportifs': { icone: 'Dumbbell', couleur: 'primary' },
	'Sports collectifs': { icone: 'Trophy', couleur: 'coral' },
	'Sports individuels': { icone: 'Medal', couleur: 'leaf' },
	'Loisirs & plein air': { icone: 'TreePine', couleur: 'sunshine' }
};

const AGENDA_CATEGORY_META: Record<string, { couleur: string }> = {
	'Conseil municipal': { couleur: 'primary' },
	Manifestation: { couleur: 'coral' },
	'Vie associative': { couleur: 'leaf' },
	Cérémonie: { couleur: 'muted' }
};

const ACTUALITES_CATEGORY_META: Record<string, { couleur: string }> = {
	Mairie: { couleur: 'primary' },
	'Vie locale': { couleur: 'leaf' },
	Travaux: { couleur: 'coral' },
	Événements: { couleur: 'sunshine' }
};

const DOCUMENTS_CATEGORY_META: Record<string, { couleur: string }> = {
	'Comptes-rendus': { couleur: 'primary' },
	'Bulletins municipaux': { couleur: 'coral' },
	Budget: { couleur: 'leaf' },
	Arrêtés: { couleur: 'muted' },
	Urbanisme: { couleur: 'muted' }
};

async function seed() {
	const payload = await getPayload({ config });

	console.log('--- Téléphones & emails ---');
	const { telephones, emails } = await seedTelephonesEmails(payload);

	console.log('--- Annuaire (4 pages) ---');
	await seedAnnuairePage(payload, {
		title: 'Commerces & artisans',
		slug: 'commerces',
		menu: 'commune',
		items: commerces,
		nameKey: 'name',
		categoryKey: 'category',
		categoryMeta: COMMERCES_CATEGORY_META
	});
	await seedAnnuairePage(payload, {
		title: 'Vie associative',
		slug: 'vivre/vie-associative',
		menu: 'commune',
		items: associations,
		nameKey: 'name',
		categoryKey: 'category',
		badgeKey: 'shortName',
		categoryMeta: VIE_ASSOCIATIVE_CATEGORY_META
	});
	await seedAnnuairePage(payload, {
		title: 'Enfance & jeunesse',
		slug: 'vivre/enfance-jeunesse',
		menu: 'commune',
		items: services,
		nameKey: 'name',
		categoryKey: 'category',
		categoryMeta: ENFANCE_JEUNESSE_CATEGORY_META
	});
	await seedAnnuairePage(payload, {
		title: 'Sports & loisirs',
		slug: 'vivre/sports-loisirs',
		menu: 'commune',
		items: activities,
		nameKey: 'name',
		categoryKey: 'category',
		categoryMeta: SPORTS_LOISIRS_CATEGORY_META
	});

	console.log('--- Agenda ---');
	await seedAgenda(payload);

	console.log('--- Actualités ---');
	await seedActualites(payload);

	console.log('--- Documents & publications ---');
	await seedDocuments(payload);

	console.log('--- Budget & projets ---');
	await seedBudgetProjets(payload);

	console.log('--- Numéros utiles ---');
	await seedNumerosUtiles(payload, telephones);

	console.log('--- Trombinoscope (élus) ---');
	await seedTrombinoscope(payload);

	console.log('--- Catalogue de lieux (location de salles) ---');
	await seedCatalogueLieux(payload);

	console.log('--- Carte interactive : POI & sentiers ---');
	await seedPoisSentiers(payload);

	console.log('--- Pages structurelles sans contenu riche (à compléter manuellement) ---');
	await seedPageShells(payload);

	console.log('Seed terminé.');
}

// ---------------------------------------------------------------------------
// Téléphones & emails
// ---------------------------------------------------------------------------

async function seedTelephonesEmails(payload: Awaited<ReturnType<typeof getPayload>>) {
	// JUGEMENT NON TRANCHÉ : le code actuel a deux numéros/emails différents
	// pour "la mairie" selon l'endroit (CTA Accueil vs page Contact — déjà
	// noté comme incohérence en décision 22). Ce script seed les DEUX comme
	// entrées distinctes avec des libellés explicites plutôt que d'en
	// arbitrer un — à l'utilisateur de dire lequel est le vrai numéro et de
	// supprimer/fusionner l'autre après le seed.
	const telephoneData = [
		{ label: 'Secrétariat mairie (page Horaires)', numero: '05 55 00 60 15' },
		{ label: 'Secrétariat mairie (page Contact)', numero: '05 55 00 62 00' },
		{ label: 'Secrétariat mairie (ancien CTA Accueil — doublon à vérifier)', numero: '05 55 00 61 65' },
		{ label: 'Service urbanisme', numero: '05 55 00 60 20' },
		{ label: 'Police municipale / Gendarmerie', numero: '05 55 00 60 17' },
		{ label: 'CHU de Limoges', numero: '05 55 05 55 55' }
	];
	const emailData = [
		{ label: 'Contact général (page Contact)', adresse: 'mairie@saint-hilaire-bonneval.fr' },
		{ label: 'Contact général (ancien CTA Accueil — doublon à vérifier)', adresse: 'contact@saint-hilaire-bonneval.fr' }
	];

	const telephones: CategoryMap = {};
	for (const t of telephoneData) {
		const doc = await payload.create({ collection: 'telephones', data: t });
		telephones[t.label] = String(doc.id);
	}
	const emails: CategoryMap = {};
	for (const e of emailData) {
		const doc = await payload.create({ collection: 'emails', data: e });
		emails[e.label] = String(doc.id);
	}
	return { telephones, emails };
}

// ---------------------------------------------------------------------------
// Annuaire — Commerces, Vie associative, Enfance & jeunesse, Sports & loisirs
// ---------------------------------------------------------------------------

type AnnuaireSourceItem = {
	desc?: string;
	address?: string;
	hours?: string;
	phone?: string;
	email?: string;
	[key: string]: unknown;
};

async function seedAnnuairePage<T extends AnnuaireSourceItem>(
	payload: Awaited<ReturnType<typeof getPayload>>,
	opts: {
		title: string;
		slug: string;
		menu: string;
		items: T[];
		nameKey: keyof T;
		categoryKey: keyof T;
		badgeKey?: keyof T;
		// Icône/couleur par catégorie (décision 10) — reprises du `categoryMeta`
		// de chaque page statique d'origine. Sans ça, `categorie.icone`/`couleur`
		// restent vides et tout s'affiche avec l'icône/couleur par défaut
		// ("muted") — trouvé en testant contre la vraie base, pas en relisant.
		categoryMeta?: Record<string, { icone?: string; couleur?: string }>;
	}
) {
	const page = await payload.create({
		collection: 'pages',
		data: {
			title: opts.title,
			slug: opts.slug,
			menu: opts.menu,
			gabarit: 'liste',
			liste: { layoutType: 'annuaire' }
		}
	});

	const categoryNames = Array.from(new Set(opts.items.map((i) => String(i[opts.categoryKey]))));
	const categories: CategoryMap = {};
	for (const nom of categoryNames) {
		const meta = opts.categoryMeta?.[nom];
		const cat = await payload.create({
			collection: 'categories',
			data: { nom, page: page.id, icone: meta?.icone, couleur: meta?.couleur }
		});
		categories[nom] = String(cat.id);
	}

	const itemsAnnuaire = opts.items.map((item) => ({
		nom: String(item[opts.nameKey]),
		categorie: categories[String(item[opts.categoryKey])],
		badge: opts.badgeKey ? (item[opts.badgeKey] as string | undefined) : undefined,
		description: item.desc,
		contacts: buildContacts(item)
	}));

	await payload.update({
		collection: 'pages',
		id: page.id,
		data: { liste: { itemsAnnuaire } }
	});
}

function buildContacts(item: AnnuaireSourceItem) {
	const contacts: { type: string; valeur?: string }[] = [];
	if (item.address) contacts.push({ type: 'address', valeur: item.address });
	if (item.hours) contacts.push({ type: 'hours', valeur: item.hours });
	// Téléphone/email réels non liés à la collection `telephones` ici : ces
	// numéros sont spécifiques à chaque commerçant/association, pas des
	// coordonnées mairie réutilisables (décision 22 concerne les numéros de
	// la mairie elle-même, pas ceux des tiers listés dans l'annuaire). Stockés
	// en `valeur` texte via le type "address"/"hours" existant serait
	// incorrect ; le schéma actuel de `contactItemFields` suppose une
	// relation pour phone/email, ce qui ne convient pas ici. Laissé de côté
	// volontairement — voir note dans le .md après ce script.
	return contacts;
}

// ---------------------------------------------------------------------------
// Agenda
// ---------------------------------------------------------------------------

async function seedAgenda(payload: Awaited<ReturnType<typeof getPayload>>) {
	const page = await payload.create({
		collection: 'pages',
		data: {
			title: 'Agenda',
			slug: 'agenda',
			menu: 'essentiel',
			gabarit: 'liste',
			liste: { layoutType: 'agenda' }
		}
	});

	const categoryNames = Array.from(new Set(events.map((e) => e.category)));
	const categories: CategoryMap = {};
	for (const nom of categoryNames) {
		const cat = await payload.create({
			collection: 'categories',
			data: { nom, page: page.id, couleur: AGENDA_CATEGORY_META[nom]?.couleur }
		});
		categories[nom] = String(cat.id);
	}

	const itemsAgenda = events.map((e) => ({
		titre: e.title,
		categorie: categories[e.category],
		date: e.date,
		horaire: e.time,
		lieu: e.location,
		description: e.desc
	}));

	await payload.update({ collection: 'pages', id: page.id, data: { liste: { itemsAgenda } } });
}

// ---------------------------------------------------------------------------
// Actualités
// ---------------------------------------------------------------------------

async function seedActualites(payload: Awaited<ReturnType<typeof getPayload>>) {
	const page = await payload.create({
		collection: 'pages',
		data: {
			title: 'Actualités',
			slug: 'mairie/actualites',
			menu: 'mairie',
			gabarit: 'liste',
			liste: { layoutType: 'actualites' }
		}
	});

	const categoryNames = Array.from(new Set(articles.map((a) => a.cat)));
	const categories: CategoryMap = {};
	for (const nom of categoryNames) {
		const cat = await payload.create({
			collection: 'categories',
			data: { nom, page: page.id, couleur: ACTUALITES_CATEGORY_META[nom]?.couleur }
		});
		categories[nom] = String(cat.id);
	}

	// Décision 36 (annule décision 35) — les actus vivent dans un `array` de
	// la page, comme les autres layoutType.
	const itemsActualites = articles.map((a) => ({
		titre: a.title,
		categorie: categories[a.cat],
		date: toISODate(a.date),
		extrait: a.excerpt
		// `lienDocument` (décision 14) : les entrées `type: 'document'`
		// pointaient vers `/mairie/publications` en dur — non repris ici, la
		// relation doit cibler un document précis une fois `documents`
		// seedée, pas juste la page. À faire manuellement pour les 1-2
		// entrées concernées.
	}));

	await payload.update({ collection: 'pages', id: page.id, data: { liste: { itemsActualites } } });
}

// ---------------------------------------------------------------------------
// Documents & publications
// ---------------------------------------------------------------------------

async function seedDocuments(payload: Awaited<ReturnType<typeof getPayload>>) {
	const page = await payload.create({
		collection: 'pages',
		data: {
			title: 'Documents & publications',
			slug: 'mairie/publications',
			menu: 'mairie',
			gabarit: 'liste',
			liste: { layoutType: 'document' }
		}
	});

	const categoryNames = Array.from(new Set(docs.map((d) => d.type)));
	const categories: CategoryMap = {};
	for (const nom of categoryNames) {
		const cat = await payload.create({
			collection: 'categories',
			data: { nom, page: page.id, couleur: DOCUMENTS_CATEGORY_META[nom]?.couleur }
		});
		categories[nom] = String(cat.id);
	}

	// `fichier` (upload) laissé vide : les `href` actuels sont des placeholders
	// ('#') sans vrai fichier — rien à uploader depuis ce script.
	const itemsDocument = docs.map((d) => ({
		titre: d.title,
		type: categories[d.type],
		date: d.date
	}));

	await payload.update({ collection: 'pages', id: page.id, data: { liste: { itemsDocument } } });
}

// ---------------------------------------------------------------------------
// Budget & projets
// ---------------------------------------------------------------------------

async function seedBudgetProjets(payload: Awaited<ReturnType<typeof getPayload>>) {
	const page = await payload.create({
		collection: 'pages',
		data: {
			title: 'Budget & projets',
			slug: 'mairie/budget-projets',
			menu: 'mairie',
			gabarit: 'liste',
			liste: { layoutType: 'budget-projet' }
		}
	});

	// Pas de catégorie pour cette carte (décision 24) — `nature`/`statut`
	// suffisent, déjà portés par chaque entrée.
	const itemsBudgetProjet = budgetProjetEntries.map((e) =>
		e.kind === 'budget'
			? { nature: 'budget' as const, titre: e.title, date: e.date }
			: {
					nature: 'projet' as const,
					titre: e.title,
					date: e.date,
					statut:
						e.status === 'À venir' ? 'a-venir' : e.status === 'En cours' ? 'en-cours' : 'termine',
					description: e.desc
				}
	);

	await payload.update({ collection: 'pages', id: page.id, data: { liste: { itemsBudgetProjet } } });
}

// ---------------------------------------------------------------------------
// Numéros utiles
// ---------------------------------------------------------------------------

async function seedNumerosUtiles(
	payload: Awaited<ReturnType<typeof getPayload>>,
	telephones: CategoryMap
) {
	const urgencesItems = urgences.map((u) => ({
		numero: u.number,
		label: u.label,
		description: u.desc,
		couleur: u.color
	}));

	// `locaux` référence des numéros déjà seedés dans `telephones` quand la
	// correspondance est évidente (mairie, gendarmerie) ; sinon on en crée un
	// nouveau (ex. CHU de Limoges, déjà seedé plus haut).
	const localToTelephoneLabel: Record<string, string> = {
		'Mairie de Saint-Hilaire-Bonneval': 'Secrétariat mairie (page Horaires)',
		'Gendarmerie de Saint-Hilaire-Bonneval': 'Police municipale / Gendarmerie',
		'Centre hospitalier universitaire de Limoges': 'CHU de Limoges'
	};

	const contactsLocaux = locaux.map((l) => ({
		label: l.label,
		detail: l.detail ?? undefined,
		telephone: telephones[localToTelephoneLabel[l.label]]
	}));

	await payload.create({
		collection: 'pages',
		data: {
			title: 'Numéros utiles',
			slug: 'numeros-utiles',
			menu: 'essentiel',
			gabarit: 'numeros-utiles',
			numerosUtiles: { urgences: urgencesItems, contactsLocaux }
		}
	});
}

// ---------------------------------------------------------------------------
// Trombinoscope — Le maire & les élus
// ---------------------------------------------------------------------------

async function seedTrombinoscope(payload: Awaited<ReturnType<typeof getPayload>>) {
	// Schéma étoffé en décision 38 : `role` (discriminant de regroupement),
	// `commissions` (liste structurée), `note` — plus besoin de tout replier
	// dans `fonction` en texte libre.
	const toCommissions = (e: { commissions?: string[] }) => (e.commissions ?? []).map((nom) => ({ nom }));

	const membres = [
		{ nom: maire.name, fonction: maire.role, role: 'maire', note: maire.note },
		...adjoints.map((e) => ({ nom: e.name, fonction: e.role, role: 'adjoint', commissions: toCommissions(e) })),
		...delegues.map((e) => ({ nom: e.name, fonction: e.role, role: 'delegue', commissions: toCommissions(e) })),
		...conseillers.map((e) => ({
			nom: e.name,
			fonction: e.role,
			role: 'conseiller',
			commissions: toCommissions(e)
		}))
	];

	await payload.create({
		collection: 'pages',
		data: {
			title: 'Le maire & les élus',
			slug: 'mairie/maire-elus',
			menu: 'mairie',
			gabarit: 'trombinoscope',
			trombinoscope: {
				membres,
				infosReunion: 'Conseil municipal — vendredi 21 février, 19 h. Séances publiques, ouvertes à tous les habitants.'
			}
		}
	});
}

// ---------------------------------------------------------------------------
// Catalogue de lieux — Location de salles
// ---------------------------------------------------------------------------

async function seedCatalogueLieux(payload: Awaited<ReturnType<typeof getPayload>>) {
	// Retranscrit à la main (pas de data.ts source, contenu JSX à structure
	// tabulaire simple — faible risque contrairement aux pages tout-prose).
	// Schéma étoffé en décision 38 (groupesTarifs + notes + caution dédiée) :
	// plus besoin de replier la caution dans le texte du prix.
	await payload.create({
		collection: 'pages',
		data: {
			title: 'Location de salles',
			slug: 'location-salle',
			menu: 'commune',
			gabarit: 'catalogue-lieux',
			catalogueLieux: {
				salles: [
					{
						nom: 'Salle polyvalente',
						description: 'Location à caractère associatif ou familial.',
						icone: 'Building2',
						groupesTarifs: [
							{
								label: 'Manifestations',
								lignes: [
									{ public: 'Associations de la commune', prix: 'Gratuit', caution: 'Caution 160 €' },
									{ public: 'Habitants de la commune', prix: '260 €', caution: 'Caution 260 €' },
									{ public: 'Personnes extérieures', prix: '350 €', caution: 'Caution 350 €' }
								]
							},
							{
								label: "Vins d'honneur",
								lignes: [
									{ public: 'Habitants de la commune', prix: '110 €', caution: 'Caution 250 €' },
									{ public: 'Personnes extérieures', prix: '160 €', caution: 'Caution 350 €' }
								]
							}
						],
						notes: [
							{
								texte: 'Assurance obligatoire · État des lieux avant et après utilisation',
								type: 'info'
							}
						]
					},
					{
						nom: 'Salle du restaurant scolaire',
						description:
							'Disponible uniquement le week-end pour les associations et particuliers, pour des manifestations à caractère familial ou associatif.',
						icone: 'UtensilsCrossed',
						groupesTarifs: [
							{
								label: 'Location',
								lignes: [
									{ public: 'Habitants de la commune', prix: '650 €', caution: '+ cautions' },
									{ public: 'Personnes extérieures', prix: '750 €', caution: '+ cautions' }
								]
							},
							{
								label: 'Cautions',
								lignes: [
									{ public: 'Dégradation des locaux ou du matériel', prix: '1 000 €' },
									{ public: 'Nettoyage insuffisant ou mobilier non remis en place', prix: '120 €' }
								]
							}
						],
						notes: [
							{
								texte:
									'Traiteur obligatoire — lui seul et son personnel sont autorisés à utiliser le réfrigérateur, le four, la cuisinière à gaz et le lave-vaisselle.',
								type: 'condition'
							}
						]
					}
				]
			}
		}
	});
}

// ---------------------------------------------------------------------------
// Carte interactive — POI & sentiers
// ---------------------------------------------------------------------------

async function seedPoisSentiers(payload: Awaited<ReturnType<typeof getPayload>>) {
	// `image` (upload) laissé vide : les sources actuelles sont des URL
	// Unsplash externes, pas des fichiers à uploader depuis ce script.
	for (const p of pois) {
		await payload.create({
			collection: 'pois',
			data: {
				nom: p.name,
				description: p.description,
				categorie: p.category,
				latitude: p.lat,
				longitude: p.lng
			}
		});
	}
	for (const s of sentiers) {
		await payload.create({
			collection: 'sentiers',
			data: {
				nom: s.name,
				description: s.description,
				distance: s.distance,
				duree: s.duration,
				trace: s.coordinates.map(([lat, lng]) => ({ lat, lng }))
			}
		});
	}
}

// ---------------------------------------------------------------------------
// Pages structurelles sans contenu riche — créées vides, à compléter dans
// l'éditeur de l'admin (pas de conversion JSX → Lexical automatisée)
// ---------------------------------------------------------------------------

async function seedPageShells(payload: Awaited<ReturnType<typeof getPayload>>) {
	const demarchesPage = await payload.create({
		collection: 'pages',
		data: { title: 'Mes démarches', slug: 'demarches', menu: 'essentiel', gabarit: 'liste', liste: { layoutType: 'demarches' } }
	});
	await payload.create({
		collection: 'pages',
		data: { title: 'Histoire', slug: 'histoire', menu: 'tourisme', gabarit: 'editorial' }
	});
	const communePage = await payload.create({
		collection: 'pages',
		data: { title: 'La commune', slug: 'vivre/la-commune', menu: 'commune', gabarit: 'editorial' }
	});
	await payload.create({
		collection: 'pages',
		data: { title: 'Contact', slug: 'contact', menu: 'essentiel', gabarit: 'contact' }
	});
	await payload.create({
		collection: 'pages',
		data: { title: 'Horaires & informations', slug: 'mairie/horaires', menu: 'mairie', gabarit: 'horaires' }
	});
	const numerosUtilesPage = await payload.find({
		collection: 'pages',
		where: { slug: { equals: 'numeros-utiles' } },
		limit: 1
	});

	// Accueil (décision 9, singleton) — contenu réel plutôt qu'une coquille
	// vide : `hero.titre`/`mayorWord.citation` etc. sont `required` (pas de
	// cas particulier pour l'Accueil, cohérent avec décision 2/3), une
	// coquille vide échoue à la validation. Seuls les champs `image` restent
	// vides (aucun vrai fichier disponible, décision 32).
	await payload.create({
		collection: 'pages',
		// slug 'accueil' (pas '/') — la résolution slug→href ('/') se fait au
		// niveau du routage (item 14), pas ici.
		data: {
			title: 'Accueil',
			slug: 'accueil',
			menu: 'essentiel',
			gabarit: 'accueil',
			accueil: {
				hero: {
					titre: 'Bienvenue sur le site de la Mairie de Saint-Hilaire-Bonneval, au cœur de la Haute-Vienne.',
					description:
						"Entre rivières, forêts et patrimoine vivant, la commune vous accueille. Retrouvez ici vos démarches, l'actualité municipale et toutes les informations utiles à la vie locale.",
					boutonPrincipalLabel: 'Effectuer une démarche',
					boutonPrincipalLien: demarchesPage.id,
					boutonSecondaireLabel: 'Découvrir la commune',
					boutonSecondaireLien: communePage.id
				},
				quickAccessItems: [
					{
						icone: 'FileText',
						titre: 'Démarches administratives',
						description: 'État civil, urbanisme, demandes en quelques clics.',
						lien: demarchesPage.id
					},
					{
						icone: 'Gavel',
						titre: 'Délibérations & Actes',
						description: 'Comptes-rendus du conseil municipal et arrêtés.',
						lien: demarchesPage.id
					},
					{
						icone: 'Phone',
						titre: 'Services & Urgences',
						description: 'Numéros utiles et services publics à proximité.',
						lien: numerosUtilesPage.docs[0]?.id ?? demarchesPage.id
					}
				],
				mayorWord: {
					citation:
						"Saint-Hilaire-Bonneval, c'est l'histoire d'un village qui avance sans renier ses racines. Un lieu où la nature dicte le tempo, où les liens se tissent autour de projets partagés.",
					nomSignataire: 'Monsieur le Maire',
					statNombre: '1 022',
					statLibelle: 'Habitants au cœur du Limousin'
				},
				discoverCards: [
					{
						etiquette: 'Nature',
						titre: "Nos étangs et plans d'eau",
						description: "Pêche, baignade et balades au fil de l'eau dans un cadre préservé."
					},
					{
						etiquette: 'Randonnée',
						titre: 'Sentiers du Limousin',
						description: 'Plus de 40 km de chemins balisés à travers forêts et bocages.'
					},
					{
						etiquette: 'Patrimoine',
						titre: "L'âme du village",
						description: 'Église, lavoirs, croix de chemin : un héritage qui se raconte.'
					}
				],
				cta: {
					titre: 'Nous contacter',
					description:
						'La mairie vous accueille du lundi au vendredi, de 9h à 12h et de 14h à 17h. Le secrétariat reste à votre disposition pour toute démarche.',
					boutonLabel: 'Prendre rendez-vous'
				}
			}
		}
	});
	await payload.create({
		collection: 'pages',
		data: { title: 'Carte interactive', slug: 'tourisme/carte-interactive', menu: 'tourisme', gabarit: 'carte-interactive' }
	});

	console.log(
		'Démarches, Histoire, La commune, Contact, Horaires, Carte interactive : structure créée, contenu riche à compléter manuellement dans l’admin. Accueil : contenu réel (sauf images, aucun fichier disponible).'
	);
}

seed()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
