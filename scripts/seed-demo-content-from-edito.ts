/**
 * Remplit un tenant de démo (App, Accueillant) avec le contenu réel d'edito
 * (Saint-Hilaire-Bonneval) sur toutes les pages SAUF Accueil, pour que les
 * démos App/Accueillant montrent de vraies données plutôt que le texte
 * générique posé par `lib/seedDefaultPages.ts`.
 *
 * Ne duplique PAS les relations (`categorie`, `lien`, `lienDocument`,
 * `image`/`fichier`) : elles restent des IDs pointant vers les documents
 * d'edito. Ça fonctionne pour l'affichage — `resolvePageHref` ne lit que le
 * `slug` de la page liée (identique sur toutes les communes, seedées avec
 * les mêmes 18 pages), et les relations `categorie`/média sont peuplées en
 * lecture sans filtre de tenant (Local API, `overrideAccess: true`). Seule
 * exception : `pois`/`sentiers`, dont `getCarteData()` filtre explicitement
 * par tenant — ceux-là sont dupliqués en vraies lignes appartenant au
 * tenant cible.
 *
 * Exception à la règle "aucune duplication" : les catégories (gabarit
 * `liste` — `itemsAnnuaire`/`itemsDemarches`/`itemsActualites`/`itemsAgenda`
 * `.categorie`, `itemsDocument.type`) sont verrouillées PAR PAGE
 * (`categoryField().filterOptions`), validé au `beforeChange` — réutiliser
 * l'id d'une catégorie d'edito échoue donc la validation sur la page cible.
 * Dupliquées par page copiée, avec remap des références.
 *
 * Usage :
 *   node --experimental-loader=./scripts/_resolve-ts.mjs scripts/seed-demo-content-from-edito.ts <domaineCible> [domaineSource]
 *   (domaineSource par défaut : edito.civelo.fr — en local, passer saint-hilaire-bonneval.fr)
 */
import { getPayload } from 'payload';
import config from '../payload.config';

const GABARIT_GROUP_FIELD: Record<string, string> = {
	liste: 'liste',
	editorial: 'editorial',
	trombinoscope: 'trombinoscope',
	'catalogue-lieux': 'catalogueLieux',
	contact: 'contact',
	'numeros-utiles': 'numerosUtiles',
	horaires: 'horaires',
	'carte-interactive': 'carteInteractive'
};

// Retire récursivement les clés `id` (lignes d'array/blocks Payload) —
// réutiliser l'id d'une ligne source créerait un conflit de clé primaire
// sur la page cible (table de sous-array partagée entre tous les documents
// de la collection `pages`). Laisse intactes les relations (`categorie`,
// `lien`...), qui ne portent jamais ce nom de clé.
function stripIds(value: unknown): unknown {
	if (Array.isArray(value)) return value.map(stripIds);
	if (value && typeof value === 'object') {
		const out: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
			if (k === 'id') continue;
			out[k] = stripIds(v);
		}
		return out;
	}
	return value;
}

const CATEGORY_ARRAY_FIELDS: { array: string; field: string }[] = [
	{ array: 'itemsAnnuaire', field: 'categorie' },
	{ array: 'itemsDemarches', field: 'categorie' },
	{ array: 'itemsActualites', field: 'categorie' },
	{ array: 'itemsAgenda', field: 'categorie' },
	{ array: 'itemsDocument', field: 'type' }
];

async function duplicateCategoriesForPage(
	payload: Awaited<ReturnType<typeof getPayload>>,
	sourcePageId: number,
	targetPageId: number,
	targetTenantId: number
): Promise<Record<string, number>> {
	const { docs: cats } = await payload.find({
		collection: 'categories',
		where: { page: { equals: sourcePageId } },
		limit: 200,
		depth: 0,
		overrideAccess: true
	});
	const idMap: Record<string, number> = {};
	for (const c of cats as any[]) {
		const created = await payload.create({
			collection: 'categories',
			overrideAccess: true,
			data: { nom: c.nom, icone: c.icone, couleur: c.couleur, page: targetPageId, tenant: targetTenantId }
		});
		idMap[String(c.id)] = created.id as number;
	}
	return idMap;
}

function remapCategories(listeGroup: any, idMap: Record<string, number>): any {
	const out = { ...listeGroup };
	for (const { array, field } of CATEGORY_ARRAY_FIELDS) {
		if (!Array.isArray(out[array])) continue;
		out[array] = out[array].map((item: any) => {
			const rawId = item[field];
			if (rawId == null) return item;
			const mapped = idMap[String(rawId)];
			return { ...item, [field]: mapped ?? rawId };
		});
	}
	return out;
}

async function main() {
	const targetDomain = process.argv[2];
	const sourceDomain = process.argv[3] || 'edito.civelo.fr';
	if (!targetDomain) {
		console.error('Usage: seed-demo-content-from-edito.ts <domaineCible> [domaineSource]');
		process.exit(1);
	}

	const payload = await getPayload({ config });

	const { docs: sourceTenants } = await payload.find({
		collection: 'tenants',
		where: { domaine: { equals: sourceDomain } },
		overrideAccess: true
	});
	const source = sourceTenants[0];
	if (!source) throw new Error(`Tenant source introuvable (${sourceDomain})`);

	const { docs: targetTenants } = await payload.find({
		collection: 'tenants',
		where: { domaine: { equals: targetDomain } },
		overrideAccess: true
	});
	const target = targetTenants[0];
	if (!target) throw new Error(`Tenant cible introuvable (${targetDomain})`);

	console.log(`Source: ${source.nom} (id ${source.id}) → Cible: ${target.nom} (id ${target.id})`);

	const { docs: sourcePages } = await payload.find({
		collection: 'pages',
		where: { tenant: { equals: source.id } },
		depth: 0,
		limit: 100,
		overrideAccess: true
	});
	const { docs: targetPages } = await payload.find({
		collection: 'pages',
		where: { tenant: { equals: target.id } },
		depth: 0,
		limit: 100,
		overrideAccess: true
	});

	const { docs: existingTargetCategories } = await payload.find({
		collection: 'categories',
		where: { tenant: { equals: target.id } },
		limit: 1,
		overrideAccess: true
	});
	if (existingTargetCategories.length > 0) {
		throw new Error(
			`Le tenant cible (${target.nom}) a déjà des catégories — abandon pour éviter un double seed. Nettoyer manuellement avant de relancer.`
		);
	}

	let updated = 0;
	for (const sp of sourcePages as any[]) {
		if (sp.slug === 'accueil') continue;
		const groupField = GABARIT_GROUP_FIELD[sp.gabarit];
		if (!groupField) {
			console.warn(`  gabarit "${sp.gabarit}" non géré, ignoré (slug "${sp.slug}")`);
			continue;
		}
		const tp = (targetPages as any[]).find((p) => p.slug === sp.slug);
		if (!tp) {
			console.warn(`  page cible manquante pour le slug "${sp.slug}", ignorée`);
			continue;
		}
		let groupData = stripIds(sp[groupField]) as any;
		if (sp.gabarit === 'liste') {
			const idMap = await duplicateCategoriesForPage(payload, sp.id, tp.id, target.id as number);
			groupData = remapCategories(groupData, idMap);
		}
		await payload.update({
			collection: 'pages',
			id: tp.id,
			overrideAccess: true,
			data: { [groupField]: groupData }
		});
		console.log(`  ✓ ${sp.slug} (${sp.gabarit})`);
		updated++;
	}
	console.log(`${updated} pages mises à jour.`);

	// ---- Pois / Sentiers — dupliqués (filtrés par tenant à la lecture) ----
	const { docs: sourcePois } = await payload.find({
		collection: 'pois',
		where: { tenant: { equals: source.id } },
		limit: 0,
		pagination: false,
		depth: 0,
		overrideAccess: true
	});
	const { docs: existingTargetPois } = await payload.find({
		collection: 'pois',
		where: { tenant: { equals: target.id } },
		limit: 1,
		overrideAccess: true
	});
	if (existingTargetPois.length > 0) {
		console.log('Des POI existent déjà pour le tenant cible — pas de duplication (pas de double seed).');
	} else {
		for (const p of sourcePois as any[]) {
			const { id, tenant, createdAt, updatedAt, ...rest } = p;
			await payload.create({ collection: 'pois', overrideAccess: true, data: { ...(stripIds(rest) as object), tenant: target.id } as any });
		}
		console.log(`${sourcePois.length} POI dupliqués.`);
	}

	const { docs: sourceSentiers } = await payload.find({
		collection: 'sentiers',
		where: { tenant: { equals: source.id } },
		limit: 0,
		pagination: false,
		depth: 0,
		overrideAccess: true
	});
	const { docs: existingTargetSentiers } = await payload.find({
		collection: 'sentiers',
		where: { tenant: { equals: target.id } },
		limit: 1,
		overrideAccess: true
	});
	if (existingTargetSentiers.length > 0) {
		console.log('Des sentiers existent déjà pour le tenant cible — pas de duplication (pas de double seed).');
	} else {
		for (const s of sourceSentiers as any[]) {
			const { id, tenant, createdAt, updatedAt, ...rest } = s;
			await payload.create({ collection: 'sentiers', overrideAccess: true, data: { ...(stripIds(rest) as object), tenant: target.id } as any });
		}
		console.log(`${sourceSentiers.length} sentiers dupliqués.`);
	}

	console.log('Terminé.');
	process.exit(0);
}

main().catch((err) => {
	console.error('ÉCHEC:', err);
	process.exit(1);
});
