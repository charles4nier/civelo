/**
 * Étape 11 du plan multi-tenant — bascule des données réelles de
 * Saint-Hilaire-Bonneval (MongoDB, source de vérité jusqu'ici) vers la
 * nouvelle base Postgres multi-tenant, taguées avec le tenant créé pour
 * cette commune. Lecture SEULE côté Mongo (driver brut, `mongodb`, pas
 * l'API Payload — évite tout conflit avec le nouveau schéma) ; écriture via
 * l'API locale Payload côté Postgres (validation réelle du nouveau schéma).
 *
 * Rejouable : chaque étape cherche d'abord si le document existe déjà
 * (par un critère naturel — domaine, slug+tenant, email...) avant de créer.
 *
 * Les IDs changent de forme (ObjectId Mongo → entier Postgres) : toutes les
 * relations sont remappées via des tables de correspondance construites au
 * fil de la migration, PAS par recopie brute des anciens IDs. Dépendance
 * circulaire connue entre `categories.page` et `pages.liste.itemsAnnuaire[].
 * categorie` : résolue en 2 passes (créer sans relations, puis mettre à
 * jour une fois les 2 tables de correspondance disponibles).
 *
 * `nvm use 22 && node --env-file=.env --experimental-loader=./scripts/_resolve-ts.mjs scripts/migrate-mongo-to-postgres.ts`
 */
import { MongoClient, ObjectId, type Db } from 'mongodb';
import { getPayload, type Payload, type Field } from 'payload';
import config from '../payload.config';

const TENANT_DOMAINE = 'saint-hilaire-bonneval.fr';
const TENANT_NOM = 'Saint-Hilaire-Bonneval';
const MEDIA_DIR = new URL('../media/', import.meta.url).pathname;

type IdMaps = Record<string, Map<string, unknown>>;

function toId(v: unknown): string | undefined {
	if (v == null) return undefined;
	// Un `ObjectId` du driver Mongo a en interne une propriété `id` (les
	// octets bruts, pas le hex) — le check générique juste en dessous
	// matcherait dessus et produirait un `String(Buffer)` illisible au lieu
	// du vrai hex. Doit être vérifié en premier.
	if (v instanceof ObjectId) return v.toHexString();
	if (typeof v === 'object' && 'id' in (v as Record<string, unknown>)) return String((v as { id: unknown }).id);
	if (typeof v === 'object' && '_id' in (v as Record<string, unknown>)) return String((v as { _id: unknown })._id);
	return String(v);
}

// --- Remapping générique piloté par la config des champs Payload ---
// Marche pour n'importe quelle profondeur d'imbrication (group/array/
// blocks) sans avoir à connaître à la main chaque chemin de relation —
// le schéma de `collections/Pages.ts` en a des dizaines, éparpillées dans
// les 9 gabarits.
function remapRelationValue(relationTo: string | string[], value: unknown, maps: IdMaps): unknown {
	if (value == null) return value;
	if (Array.isArray(relationTo)) {
		// Relation polymorphe — non utilisée dans ce schéma pour l'instant,
		// gérée par précaution avec la forme {relationTo, value}.
		const v = value as { relationTo?: string; value?: unknown };
		if (v && typeof v === 'object' && v.relationTo) {
			const newId = maps[v.relationTo]?.get(toId(v.value) ?? '');
			return newId != null ? { relationTo: v.relationTo, value: newId } : null;
		}
		return null;
	}
	const oldId = toId(value);
	if (!oldId) return null;
	const newId = maps[relationTo]?.get(oldId);
	return newId ?? null;
}

function remapFieldValue(field: Field, value: unknown, maps: IdMaps): unknown {
	if (value == null) return value;

	if (field.type === 'relationship' || field.type === 'upload') {
		if (field.hasMany) {
			const arr = Array.isArray(value) ? value : [value];
			return arr.map((v) => remapRelationValue(field.relationTo, v, maps)).filter((v) => v != null);
		}
		return remapRelationValue(field.relationTo, value, maps);
	}

	if (field.type === 'group') {
		return remapFields(field.fields, (value ?? {}) as Record<string, unknown>, maps);
	}

	if (field.type === 'array') {
		if (!Array.isArray(value)) return value;
		// `id` de chaque ligne : un ID Mongo (hex), pas un entier Postgres —
		// jamais réutilisable tel quel, retiré pour laisser Payload en
		// attribuer un nouveau à la création.
		return value.map((row) => {
			const remappedRow = remapFields(field.fields, row as Record<string, unknown>, maps);
			delete remappedRow.id;
			return remappedRow;
		});
	}

	if (field.type === 'blocks') {
		if (!Array.isArray(value)) return value;
		return value.map((block) => {
			const b = block as Record<string, unknown>;
			const blockConfig = field.blocks.find((bl) => bl.slug === b.blockType);
			if (!blockConfig) return b;
			const remappedBlock = remapFields(blockConfig.fields, b, maps);
			delete remappedBlock.id;
			return { ...remappedBlock, blockType: b.blockType };
		});
	}

	return value;
}

// Version "squelette" du remap ci-dessus, pour la création initiale des
// pages (passe 1) : garde les champs simples tels quels (nécessaire pour
// que les champs requis conditionnels comme `liste.layoutType` passent la
// validation), vide les `array`/`blocks` (leurs entrées internes peuvent
// avoir des relations obligatoires — ex. `itemsAnnuaire[].categorie` — vers
// des catégories qui n'existent pas encore à ce stade) et ignore les
// relations/uploads (résolus en passe 2, une fois toutes les tables de
// correspondance prêtes).
function skeletonizeFieldValue(field: Field, value: unknown): unknown {
	if (field.type === 'relationship' || field.type === 'upload') return undefined;
	if (field.type === 'array' || field.type === 'blocks') return [];
	if (field.type === 'group') return skeletonizeFields(field.fields, (value ?? {}) as Record<string, unknown>);
	return value;
}

function skeletonizeFields(fields: Field[], data: Record<string, unknown>): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	for (const field of fields) {
		if (!('name' in field) || typeof field.name !== 'string') continue;
		if (!(field.name in data)) continue;
		out[field.name] = skeletonizeFieldValue(field, data[field.name]);
	}
	return out;
}

function remapFields(fields: Field[], data: Record<string, unknown>, maps: IdMaps): Record<string, unknown> {
	const out: Record<string, unknown> = { ...data };
	for (const field of fields) {
		if (!('name' in field) || typeof field.name !== 'string') continue;
		if (!(field.name in out)) continue;
		out[field.name] = remapFieldValue(field, out[field.name], maps);
	}
	return out;
}

// --- Helpers de migration par collection ---

// `tenantId: null` pour les collections volontairement partagées entre
// communes (`icones`) — pas de champ `tenant` du tout sur ces collections
// (décision étape 4), donc ni filtre ni valeur à poser à la création. Le
// critère de "déjà migré" est une clé naturelle par collection (jamais
// l'ancien ID Mongo, qui ne survit jamais tel quel côté Postgres) —
// nécessaire pour que le script soit rejouable sans tout dupliquer.
async function migrateSimple(
	payload: Payload,
	db: Db,
	mongoCollection: string,
	payloadCollection: string,
	tenantId: unknown,
	mapRow: (doc: Record<string, unknown>) => Record<string, unknown>,
	naturalKeyField: string
): Promise<Map<string, unknown>> {
	const map = new Map<string, unknown>();
	const rows = await db.collection(mongoCollection).find({}).toArray();
	for (const row of rows) {
		const oldId = String(row._id);
		const data = mapRow(row as Record<string, unknown>);
		const keyValue = data[naturalKeyField];
		const whereClauses: Record<string, unknown>[] = [{ [naturalKeyField]: { equals: keyValue } }];
		if (tenantId != null) whereClauses.push({ tenant: { equals: tenantId } });
		const { docs } = await payload.find({
			collection: payloadCollection,
			where: (whereClauses.length > 1 ? { and: whereClauses } : whereClauses[0]) as never,
			limit: 1,
			overrideAccess: true
		});
		if (docs[0]) {
			map.set(oldId, docs[0].id);
			continue;
		}
		const created = await payload.create({
			collection: payloadCollection,
			data: (tenantId != null ? { ...data, tenant: tenantId } : data) as never,
			overrideAccess: true
		});
		map.set(oldId, created.id);
	}
	console.log(`${payloadCollection} : ${map.size} document(s).`);
	return map;
}

async function main() {
	const mongoUri = process.env.MONGO_LEGACY_URI || '';
	const client = new MongoClient(mongoUri);
	await client.connect();
	const db = client.db();

	const payload = await getPayload({ config });

	// --- Tenant ---
	const { docs: existingTenant } = await payload.find({
		collection: 'tenants',
		where: { domaine: { equals: TENANT_DOMAINE } },
		limit: 1,
		overrideAccess: true
	});
	const tenant =
		existingTenant[0] ??
		(await payload.create({
			collection: 'tenants',
			data: {
				nom: TENANT_NOM,
				domaine: TENANT_DOMAINE,
				theme: 'edito',
				palette: 'defaut',
				typographie: 'defaut',
				statutContrat: 'actif'
			},
			overrideAccess: true
		}));
	const tenantId = tenant.id;
	console.log('Tenant :', tenantId, TENANT_DOMAINE);

	const maps: IdMaps = {};

	// --- Passe 1 : collections sans dépendance circulaire ---
	maps.icones = await migrateSimple(payload, db, 'icones', 'icones', null, (r) => ({ nom: r.nom, icone: r.icone }), 'icone');

	// Media — vrai upload de fichier (le disque local du projet, pas
	// d'invention : ce sont les 5 fichiers réellement présents).
	{
		const map = new Map<string, unknown>();
		const rows = await db.collection('media').find({}).toArray();
		for (const row of rows) {
			const oldId = String(row._id);
			const filename = row.filename as string;
			const altText = (row.alt as string) ?? filename;
			// Recherche par `alt`, pas `filename` : Payload/le plugin S3
			// renomment le fichier ("-1", "-2"...) en cas de collision avec un
			// objet déjà présent dans le bucket — le nom stocké en base
			// diverge alors du nom d'origine côté Mongo, et une recherche par
			// nom de fichier ne retrouve plus jamais le doublon existant (bug
			// trouvé en pratique : 7 copies du même fichier après autant de
			// relances pendant la mise au point de ce script).
			const { docs } = await payload.find({
				collection: 'media',
				where: { and: [{ tenant: { equals: tenantId } }, { alt: { equals: altText } }] },
				limit: 1,
				overrideAccess: true
			});
			if (docs[0]) {
				map.set(oldId, docs[0].id);
				continue;
			}
			const created = await payload.create({
				collection: 'media',
				data: { alt: row.alt ?? filename, tenant: tenantId } as never,
				filePath: `${MEDIA_DIR}${filename}`,
				overrideAccess: true
			});
			map.set(oldId, created.id);
		}
		console.log(`media : ${map.size} document(s).`);
		maps.media = map;
	}

	maps.documents = await migrateSimple(payload, db, 'documents', 'documents', tenantId, (r) => ({ titre: r.titre }), 'titre');

	maps.pois = await migrateSimple(
		payload,
		db,
		'pois',
		'pois',
		tenantId,
		(r) => ({
			nom: r.nom,
			description: r.description,
			categorie: r.categorie,
			latitude: r.latitude,
			longitude: r.longitude,
			image: r.image ? maps.media?.get(String(r.image)) : undefined
		}),
		'nom'
	);

	maps.sentiers = await migrateSimple(
		payload,
		db,
		'sentiers',
		'sentiers',
		tenantId,
		(r) => ({
			nom: r.nom,
			description: r.description,
			distance: r.distance,
			duree: r.duree,
			trace: r.trace,
			image: r.image ? maps.media?.get(String(r.image)) : undefined
		}),
		'nom'
	);

	// Pages — SKELETTE seulement (title/slug/menu/gabarit), sans contenu.
	// `Categories.page` est un champ requis pointant vers `pages` : il faut
	// que les pages existent (même vides) AVANT de créer les catégories, pas
	// l'inverse — pas de vraie dépendance circulaire une fois dans ce sens,
	// juste un ordre à respecter. Le contenu complet des pages (qui, lui,
	// référence des catégories) est remis à plus tard, une fois les
	// catégories prêtes.
	const pagesFieldConfig = (payload.collections.pages.config.fields ?? []) as Field[];
	{
		const rows = await db.collection('pages').find({}).toArray();
		const map = new Map<string, unknown>();
		for (const row of rows) {
			const oldId = String(row._id);
			const slug = row.slug as string;
			const { docs } = await payload.find({
				collection: 'pages',
				where: { and: [{ tenant: { equals: tenantId } }, { slug: { equals: slug } }] },
				limit: 1,
				overrideAccess: true
			});
			if (docs[0]) {
				map.set(oldId, docs[0].id);
				continue;
			}
			const skeleton = skeletonizeFields(pagesFieldConfig, row as Record<string, unknown>);
			const created = await payload.create({
				collection: 'pages',
				data: { ...skeleton, title: row.title, slug, menu: row.menu, gabarit: row.gabarit, tenant: tenantId } as never,
				overrideAccess: true
			});
			map.set(oldId, created.id);
		}
		console.log(`pages (créées, contenu pas encore remappé) : ${map.size} document(s).`);
		maps.pages = map;
	}

	// Categories — `page` résolu directement, les pages existent déjà
	// (squelette) à ce stade.
	maps.categories = await migrateSimple(
		payload,
		db,
		'categories',
		'categories',
		tenantId,
		(r) => ({
			nom: r.nom,
			page: r.page ? maps.pages?.get(String(r.page)) : undefined,
			icone: r.icone ? maps.icones?.get(String(r.icone)) : undefined,
			couleur: r.couleur
		}),
		'nom'
	);

	// --- Passe 2 : contenu des pages, remappé maintenant que toutes les
	// tables de correspondance existent (categories comprise) ---

	// Pages — contenu complet remappé (gabarit-spécifique, tous les champs
	// de relation/upload à n'importe quelle profondeur).
	{
		const rows = await db.collection('pages').find({}).toArray();
		for (const row of rows) {
			const newId = maps.pages.get(String(row._id));
			if (!newId) continue;
			const remapped = remapFields(pagesFieldConfig, row as Record<string, unknown>, maps);
			// Champs structurels déjà posés à la création, `id`/`_id`/`tenant`
			// exclus du remappage générique.
			delete remapped.id;
			delete remapped._id;
			delete remapped.tenant;
			delete remapped.createdAt;
			delete remapped.updatedAt;
			delete remapped._order;
			await payload.update({
				collection: 'pages',
				id: newId as string | number,
				data: remapped as never,
				overrideAccess: true
			});
		}
		console.log('pages : contenu remappé et mis à jour.');
	}

	// --- Users (métadonnées seulement — mot de passe à réinitialiser, pas
	// de tentative de recopier le hash/sel de l'ancienne base) ---
	{
		const rows = await db.collection('users').find({}).toArray();
		for (const row of rows) {
			const email = row.email as string;
			const { docs } = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1, overrideAccess: true });
			if (docs[0]) continue;
			await payload.create({
				collection: 'users',
				data: {
					email,
					password: 'ChangeMoiApresMigration!2026',
					prenom: (row.prenom as string) || 'À',
					nom: (row.nom as string) || 'renseigner',
					role: row.role,
					tenants: [{ tenant: tenantId }]
				} as never,
				overrideAccess: true
			});
			console.log(`Utilisateur migré : ${email} — mot de passe temporaire à changer.`);
		}
	}

	// --- Identité / Bouton d'en-tête / Footer (ex-globals, discriminés par
	// `globalType` côté Mongo) ---
	{
		const globalsRows = await db.collection('globals').find({}).toArray();
		const byType = new Map(globalsRows.map((g) => [g.globalType as string, g]));

		const identite = byType.get('identite');
		if (identite) {
			const { docs } = await payload.find({ collection: 'identite', where: { tenant: { equals: tenantId } }, limit: 1, overrideAccess: true });
			const data = {
				titre: identite.titre,
				sousTitre: identite.sousTitre,
				logo: identite.logo ? maps.media.get(String(identite.logo)) : undefined,
				tenant: tenantId
			};
			if (docs[0]) await payload.update({ collection: 'identite', id: docs[0].id, data: data as never, overrideAccess: true });
			else await payload.create({ collection: 'identite', data: data as never, overrideAccess: true });
		}

		const bouton = byType.get('bouton-entete');
		if (bouton) {
			const { docs } = await payload.find({ collection: 'bouton-entete', where: { tenant: { equals: tenantId } }, limit: 1, overrideAccess: true });
			const data = {
				boutonLabel: bouton.boutonLabel,
				boutonLien: bouton.boutonLien ? maps.pages.get(String(bouton.boutonLien)) : undefined,
				tenant: tenantId
			};
			if (docs[0]) await payload.update({ collection: 'bouton-entete', id: docs[0].id, data: data as never, overrideAccess: true });
			else await payload.create({ collection: 'bouton-entete', data: data as never, overrideAccess: true });
		}

		const footer = byType.get('footer');
		if (footer) {
			const { docs } = await payload.find({ collection: 'footer', where: { tenant: { equals: tenantId } }, limit: 1, overrideAccess: true });
			const data = {
				description: footer.description,
				adresse: footer.adresse,
				telephone: footer.telephone,
				email: footer.email,
				siteWeb: footer.siteWeb,
				joursOuverture: footer.joursOuverture,
				horaires: footer.horaires,
				facebook: footer.facebook,
				instagram: footer.instagram,
				tenant: tenantId
			};
			if (docs[0]) await payload.update({ collection: 'footer', id: docs[0].id, data: data as never, overrideAccess: true });
			else await payload.create({ collection: 'footer', data: data as never, overrideAccess: true });
		}
		console.log('Identité / Bouton d\'en-tête / Pied de page : migrés.');
	}

	await client.close();
	console.log('\nMigration terminée.');
}

main()
	.then(() => process.exit(0))
	.catch((err) => {
		if (err?.data?.errors) console.error(JSON.stringify(err.data.errors, null, 2).slice(0, 3000));
		console.error(err);
		process.exit(1);
	});
