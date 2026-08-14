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
import { articles } from '../features/actualites';
import { docs } from '../features/documents';
import { entries as budgetProjetEntries } from '../features/budget-projets/data';
import { pois, sentiers } from '../features/carte/data';
import { maire, adjoints, delegues, conseillers } from '../features/elus';
import { urgences, locaux } from '../features/numeros-utiles';

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
		categoryKey: 'category'
	});
	await seedAnnuairePage(payload, {
		title: 'Vie associative',
		slug: 'vivre/vie-associative',
		menu: 'commune',
		items: associations,
		nameKey: 'name',
		categoryKey: 'category',
		badgeKey: 'shortName'
	});
	await seedAnnuairePage(payload, {
		title: 'Enfance & jeunesse',
		slug: 'vivre/enfance-jeunesse',
		menu: 'commune',
		items: services,
		nameKey: 'name',
		categoryKey: 'category'
	});
	await seedAnnuairePage(payload, {
		title: 'Sports & loisirs',
		slug: 'vivre/sports-loisirs',
		menu: 'commune',
		items: activities,
		nameKey: 'name',
		categoryKey: 'category'
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
	}
) {
	const page = await payload.create({
		collection: 'pages',
		data: {
			title: opts.title,
			slug: opts.slug,
			menu: opts.menu,
			gabarit: 'liste',
			liste: { carte: 'annuaire' }
		}
	});

	const categoryNames = Array.from(new Set(opts.items.map((i) => String(i[opts.categoryKey]))));
	const categories: CategoryMap = {};
	for (const nom of categoryNames) {
		const cat = await payload.create({ collection: 'categories', data: { nom, page: page.id } });
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
			liste: { carte: 'agenda' }
		}
	});

	const categoryNames = Array.from(new Set(events.map((e) => e.category)));
	const categories: CategoryMap = {};
	for (const nom of categoryNames) {
		const cat = await payload.create({ collection: 'categories', data: { nom, page: page.id } });
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
			liste: { carte: 'actualites' }
		}
	});

	const categoryNames = Array.from(new Set(articles.map((a) => a.cat)));
	const categories: CategoryMap = {};
	for (const nom of categoryNames) {
		const cat = await payload.create({ collection: 'categories', data: { nom, page: page.id } });
		categories[nom] = String(cat.id);
	}

	const itemsActualites = articles.map((a) => ({
		titre: a.title,
		categorie: categories[a.cat],
		date: toISODate(a.date),
		extrait: a.excerpt
		// `lienDocument` (décision 14) : les entrées `type: 'document'`
		// pointaient vers `/mairie/publications` en dur — non repris ici, la
		// relation doit cibler un document précis une fois `documents` seedée,
		// pas juste la page. À faire manuellement pour les 1-2 entrées
		// concernées.
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
			liste: { carte: 'document' }
		}
	});

	const categoryNames = Array.from(new Set(docs.map((d) => d.type)));
	const categories: CategoryMap = {};
	for (const nom of categoryNames) {
		const cat = await payload.create({ collection: 'categories', data: { nom, page: page.id } });
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
			liste: { carte: 'budget-projet' }
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
	// Simplification assumée : le schéma `membres` (décision 23) n'a pas de
	// sous-liste "commissions" dédiée — jointes dans `fonction` en texte.
	// À revoir si on veut un vrai champ structuré pour les commissions.
	const membres = [
		{ nom: `M. ${maire.name}`, fonction: `${maire.role}${maire.note ? ` — ${maire.note}` : ''}` },
		...adjoints.map((e) => ({ nom: e.name, fonction: formatFonction(e) })),
		...delegues.map((e) => ({ nom: e.name, fonction: formatFonction(e) })),
		...conseillers.map((e) => ({ nom: e.name, fonction: formatFonction(e) }))
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

function formatFonction(e: { role: string; commissions?: string[] }) {
	if (!e.commissions?.length) return e.role;
	return `${e.role} — ${e.commissions.join(', ')}`;
}

// ---------------------------------------------------------------------------
// Catalogue de lieux — Location de salles
// ---------------------------------------------------------------------------

async function seedCatalogueLieux(payload: Awaited<ReturnType<typeof getPayload>>) {
	// Retranscrit à la main (pas de data.ts source, contenu JSX à structure
	// tabulaire simple — faible risque contrairement aux pages tout-prose).
	// Simplification assumée : la caution est foldée dans `prix` en texte,
	// le schéma actuel n'a pas de champ caution dédié.
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
						tarifs: [
							{ public: 'Associations de la commune (manifestations)', prix: 'Gratuit — caution 160 €' },
							{ public: 'Habitants de la commune (manifestations)', prix: '260 € — caution 260 €' },
							{ public: 'Personnes extérieures (manifestations)', prix: '350 € — caution 350 €' },
							{ public: 'Habitants de la commune (vin d’honneur)', prix: '110 € — caution 250 €' },
							{ public: 'Personnes extérieures (vin d’honneur)', prix: '160 € — caution 350 €' }
						]
					},
					{
						nom: 'Salle du restaurant scolaire',
						description:
							'Disponible uniquement le week-end pour les associations et particuliers, pour des manifestations à caractère familial ou associatif. Traiteur obligatoire.',
						tarifs: [{ public: 'Habitants de la commune', prix: '650 €' }]
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
	await payload.create({
		collection: 'pages',
		data: { title: 'Mes démarches', slug: 'demarches', menu: 'essentiel', gabarit: 'liste', liste: { carte: 'demarches' } }
	});
	await payload.create({
		collection: 'pages',
		data: { title: 'Histoire', slug: 'histoire', menu: 'tourisme', gabarit: 'editorial' }
	});
	await payload.create({
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
	await payload.create({
		collection: 'pages',
		data: { title: 'Accueil', slug: '/', gabarit: 'accueil' }
	});
	await payload.create({
		collection: 'pages',
		data: { title: 'Carte interactive', slug: 'tourisme/carte-interactive', menu: 'tourisme', gabarit: 'carte-interactive' }
	});

	console.log(
		'Démarches, Histoire, La commune, Contact, Horaires, Accueil, Carte interactive : structure créée, contenu riche à compléter manuellement dans l’admin.'
	);
}

seed()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
