/**
 * Copie INTÉGRALE d'un tenant vers un autre : blason et coordonnées du
 * tenant, identité/pied de page/bouton d'en-tête, TOUTES les pages (Accueil
 * comprise — volontairement exclue par `seed-demo-content-from-edito.ts`),
 * catégories, POI/sentiers, et tous les médias/documents référencés
 * téléchargés et ré-uploadés comme propriété du tenant cible (jamais de
 * simple référence croisée vers ceux du tenant source).
 *
 * Différence avec le duo `seed-demo-content-from-edito.ts` +
 * `localize-media-for-tenant.ts` : ceux-là alimentent un tenant de démo en
 * laissant sa page Accueil intacte (elle a déjà son propre contenu de démo).
 * Ce script-ci vise un remplacement complet et autonome du tenant cible,
 * Accueil comprise — usage ponctuel, pas pensé pour tourner deux fois sur le
 * même couple de tenants sans nettoyage (mêmes garde-fous anti-double-seed
 * que les deux scripts d'origine, dont la logique est reprise ici).
 *
 * Usage :
 *   node --experimental-loader=./scripts/_resolve-ts.mjs scripts/full-copy-tenant.ts <domaineCible> [domaineSource] [baseUrlSource]
 *   (domaineSource par défaut : edito.civelo.fr ; baseUrlSource par défaut : https://edito.civelo.fr — en local, passer http://localhost:3000)
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
	'carte-interactive': 'carteInteractive',
	accueil: 'accueil'
};

const CATEGORY_ARRAY_FIELDS: { array: string; field: string }[] = [
	{ array: 'itemsAnnuaire', field: 'categorie' },
	{ array: 'itemsDemarches', field: 'categorie' },
	{ array: 'itemsActualites', field: 'categorie' },
	{ array: 'itemsAgenda', field: 'categorie' },
	{ array: 'itemsDocument', field: 'type' }
];

// Retire récursivement les clés `id` (lignes d'array/blocks Payload) —
// réutiliser l'id d'une ligne source créerait un conflit de clé primaire sur
// le document cible. Laisse intactes les relations (`categorie`, `lien`...).
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

type Payload = Awaited<ReturnType<typeof getPayload>>;

async function duplicateCategoriesForPage(
	payload: Payload,
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

// ---- Duplication POI / sentiers (nécessaire : `getCarteData()` filtre par
// tenant, contrairement aux pages/médias/documents) ----
async function duplicateCollection(
	payload: Payload,
	collection: 'pois' | 'sentiers',
	sourceTenantId: number,
	targetTenantId: number
): Promise<Record<string, number>> {
	const { docs: existing } = await payload.find({ collection, where: { tenant: { equals: targetTenantId } }, depth: 0, limit: 1, overrideAccess: true });
	if (existing.length > 0) {
		console.log(`  ${collection} : le tenant cible en a déjà — pas de duplication (pas de double seed).`);
		const { docs: already } = await payload.find({ collection, where: { tenant: { equals: targetTenantId } }, limit: 0, pagination: false, depth: 0, overrideAccess: true });
		// Pas d'id map fiable dans ce cas (run précédent) — les nouvelles
		// pages ne pourront pas remapper lienPoi/lienSentier automatiquement.
		console.warn(`  ⚠ ${already.length} ${collection} déjà présents côté cible : le remap lienPoi/lienSentier d'Accueil sera incomplet si les ids source ne correspondent plus.`);
		return {};
	}
	const { docs: source } = await payload.find({ collection, where: { tenant: { equals: sourceTenantId } }, limit: 0, pagination: false, depth: 0, overrideAccess: true });
	const idMap: Record<string, number> = {};
	for (const doc of source as any[]) {
		const { id, tenant, createdAt, updatedAt, ...rest } = doc;
		const created = await payload.create({ collection, overrideAccess: true, data: { ...(stripIds(rest) as object), tenant: targetTenantId } as any });
		idMap[String(id)] = created.id as number;
	}
	console.log(`  ${source.length} ${collection} dupliqués.`);
	return idMap;
}

// ---- Localisation média/document (téléchargement + ré-upload propre au
// tenant cible) ----
async function localizeOne(
	payload: Payload,
	collection: 'media' | 'documents',
	id: string | number,
	targetTenantId: number,
	baseUrl: string,
	extraData: (src: any) => Record<string, unknown>,
	cache: Map<string, number>
): Promise<number> {
	const key = `${collection}:${id}`;
	if (cache.has(key)) return cache.get(key)!;
	const src = await payload.findByID({ collection, id, overrideAccess: true, depth: 0 });
	if (String((src as any).tenant) === String(targetTenantId)) {
		cache.set(key, Number(id));
		return Number(id);
	}
	const res = await fetch(`${baseUrl}${(src as any).url}`);
	if (!res.ok) throw new Error(`Téléchargement échoué (${res.status}) : ${baseUrl}${(src as any).url}`);
	const buf = Buffer.from(await res.arrayBuffer());
	const created = await payload.create({
		collection,
		overrideAccess: true,
		data: { tenant: targetTenantId, ...extraData(src) },
		file: { data: buf, mimetype: (src as any).mimeType, name: (src as any).filename, size: buf.length }
	});
	cache.set(key, created.id as number);
	return created.id as number;
}

function collectMediaIds(sp: any, mediaIds: Set<string>, docIds: Set<string>) {
	switch (sp.gabarit) {
		case 'liste':
			for (const item of sp.liste?.itemsDocument ?? []) if (item.fichier) docIds.add(String(item.fichier));
			for (const item of sp.liste?.itemsBudgetProjet ?? []) if (item.fichier) docIds.add(String(item.fichier));
			break;
		case 'trombinoscope':
			for (const m of sp.trombinoscope?.membres ?? []) if (m.photo) mediaIds.add(String(m.photo));
			break;
		case 'catalogue-lieux':
			for (const s of sp.catalogueLieux?.salles ?? []) for (const img of s.images ?? []) mediaIds.add(String(img));
			break;
		case 'editorial':
			for (const block of sp.editorial?.sections ?? []) {
				if (block.blockType === 'intro') {
					[block.imagePrincipale, block.imageSecondaire1, block.imageSecondaire2].forEach((v: any) => v && mediaIds.add(String(v)));
				} else if (block.blockType === 'imagePleineLargeur') {
					[block.imageDesktop, block.imageMobile].forEach((v: any) => v && mediaIds.add(String(v)));
				} else if (block.blockType === 'grilleImages') {
					[block.image1, block.image2, block.image3].forEach((v: any) => v && mediaIds.add(String(v)));
				}
			}
			break;
		case 'accueil':
			if (sp.accueil?.hero?.image) mediaIds.add(String(sp.accueil.hero.image));
			if (sp.accueil?.mayorWord?.image) mediaIds.add(String(sp.accueil.mayorWord.image));
			for (const c of sp.accueil?.discoverCards ?? []) if (c.image) mediaIds.add(String(c.image));
			for (const s of sp.accueil?.slideshow ?? []) if (s.image) mediaIds.add(String(s.image));
			break;
	}
}

function remapMediaIds(sp: any, mediaMap: Record<string, number>, docMap: Record<string, number>) {
	const m = (id: any) => (id != null ? (mediaMap[String(id)] ?? id) : id);
	const d = (id: any) => (id != null ? (docMap[String(id)] ?? id) : id);
	switch (sp.gabarit) {
		case 'liste':
			if (sp.liste?.itemsDocument) sp.liste.itemsDocument = sp.liste.itemsDocument.map((it: any) => ({ ...it, fichier: it.fichier ? d(it.fichier) : it.fichier }));
			if (sp.liste?.itemsBudgetProjet)
				sp.liste.itemsBudgetProjet = sp.liste.itemsBudgetProjet.map((it: any) => ({ ...it, fichier: it.fichier ? d(it.fichier) : it.fichier }));
			break;
		case 'trombinoscope':
			if (sp.trombinoscope?.membres) sp.trombinoscope.membres = sp.trombinoscope.membres.map((mem: any) => ({ ...mem, photo: mem.photo ? m(mem.photo) : mem.photo }));
			break;
		case 'catalogue-lieux':
			if (sp.catalogueLieux?.salles) sp.catalogueLieux.salles = sp.catalogueLieux.salles.map((s: any) => ({ ...s, images: (s.images ?? []).map(m) }));
			break;
		case 'editorial':
			if (sp.editorial?.sections)
				sp.editorial.sections = sp.editorial.sections.map((block: any) => {
					if (block.blockType === 'intro')
						return { ...block, imagePrincipale: m(block.imagePrincipale), imageSecondaire1: m(block.imageSecondaire1), imageSecondaire2: m(block.imageSecondaire2) };
					if (block.blockType === 'imagePleineLargeur') return { ...block, imageDesktop: m(block.imageDesktop), imageMobile: m(block.imageMobile) };
					if (block.blockType === 'grilleImages') return { ...block, image1: m(block.image1), image2: m(block.image2), image3: m(block.image3) };
					return block;
				});
			break;
		case 'accueil':
			if (sp.accueil?.hero?.image) sp.accueil.hero.image = m(sp.accueil.hero.image);
			if (sp.accueil?.mayorWord?.image) sp.accueil.mayorWord.image = m(sp.accueil.mayorWord.image);
			if (sp.accueil?.discoverCards) sp.accueil.discoverCards = sp.accueil.discoverCards.map((c: any) => ({ ...c, image: c.image ? m(c.image) : c.image }));
			if (sp.accueil?.slideshow) sp.accueil.slideshow = sp.accueil.slideshow.map((s: any) => ({ ...s, image: s.image ? m(s.image) : s.image }));
			break;
	}
}

// discoverCards[].lienPoi/lienSentier : seule référence tenant-filtrée
// (pois/sentiers) en dehors de media/documents — remappée séparément avec
// les id maps construites à la duplication des pois/sentiers.
function remapAccueilPoiSentier(sp: any, poiIdMap: Record<string, number>, sentierIdMap: Record<string, number>) {
	if (sp.gabarit !== 'accueil' || !sp.accueil?.discoverCards) return;
	sp.accueil.discoverCards = sp.accueil.discoverCards.map((c: any) => ({
		...c,
		lienPoi: c.lienPoi != null ? poiIdMap[String(c.lienPoi)] ?? c.lienPoi : c.lienPoi,
		lienSentier: c.lienSentier != null ? sentierIdMap[String(c.lienSentier)] ?? c.lienSentier : c.lienSentier
	}));
}

async function main() {
	const targetDomain = process.argv[2];
	const sourceDomain = process.argv[3] || 'edito.civelo.fr';
	const baseUrl = process.argv[4] || 'https://edito.civelo.fr';
	if (!targetDomain) {
		console.error('Usage: full-copy-tenant.ts <domaineCible> [domaineSource] [baseUrlSource]');
		process.exit(1);
	}

	const payload = await getPayload({ config });

	const { docs: sourceTenants } = await payload.find({ collection: 'tenants', where: { domaine: { equals: sourceDomain } }, depth: 0, overrideAccess: true });
	const source = sourceTenants[0] as any;
	if (!source) throw new Error(`Tenant source introuvable (${sourceDomain})`);

	const { docs: targetTenants } = await payload.find({ collection: 'tenants', where: { domaine: { equals: targetDomain } }, depth: 0, overrideAccess: true });
	const target = targetTenants[0] as any;
	if (!target) throw new Error(`Tenant cible introuvable (${targetDomain})`);

	console.log(`Source: ${source.nom} (id ${source.id}) → Cible: ${target.nom} (id ${target.id})`);

	const mediaCache = new Map<string, number>();
	const localizeMedia = (id: string | number, extra: (src: any) => Record<string, unknown> = () => ({})) =>
		localizeOne(payload, 'media', id, target.id, baseUrl, extra, mediaCache);

	// ---- 1. Blason + coordonnées du tenant ----
	console.log('→ Blason et coordonnées du tenant…');
	const tenantUpdate: Record<string, unknown> = { coordonnees: source.coordonnees };
	if (source.blason) tenantUpdate.blason = await localizeMedia(source.blason, () => ({}));
	await payload.update({ collection: 'tenants', id: target.id, overrideAccess: true, data: tenantUpdate });
	console.log('  ✓ fait.');

	// ---- 2. Identité / pied de page / bouton d'en-tête ----
	console.log('→ Identité, pied de page, bouton d’en-tête…');
	for (const slug of ['identite', 'footer', 'bouton-entete'] as const) {
		const { docs: sourceDocs } = await payload.find({ collection: slug, where: { tenant: { equals: source.id } }, depth: 0, limit: 1, overrideAccess: true });
		const sourceDoc = sourceDocs[0] as any;
		if (!sourceDoc) {
			console.warn(`  ⚠ pas de document "${slug}" côté source, ignoré.`);
			continue;
		}
		const { id, tenant, createdAt, updatedAt, ...rest } = sourceDoc;
		const data: any = stripIds(rest);
		if (slug === 'identite' && data.logo) data.logo = await localizeMedia(data.logo);

		const { docs: targetDocs } = await payload.find({ collection: slug, where: { tenant: { equals: target.id } }, depth: 0, limit: 1, overrideAccess: true });
		const targetDoc = targetDocs[0] as any;
		if (targetDoc) {
			await payload.update({ collection: slug, id: targetDoc.id, overrideAccess: true, data });
		} else {
			await payload.create({ collection: slug, overrideAccess: true, data: { ...data, tenant: target.id } });
		}
		console.log(`  ✓ ${slug}`);
	}

	// ---- 3. POI / sentiers (avant les pages : Accueil référence des POI) ----
	console.log('→ POI / sentiers…');
	const poiIdMap = await duplicateCollection(payload, 'pois', source.id, target.id);
	const sentierIdMap = await duplicateCollection(payload, 'sentiers', source.id, target.id);

	// ---- 4. Toutes les pages, Accueil comprise ----
	console.log('→ Contenu des pages (Accueil comprise)…');
	const { docs: sourcePages } = await payload.find({ collection: 'pages', where: { tenant: { equals: source.id } }, depth: 0, limit: 100, overrideAccess: true });
	const { docs: targetPages } = await payload.find({ collection: 'pages', where: { tenant: { equals: target.id } }, depth: 0, limit: 100, overrideAccess: true });

	const { docs: existingTargetCategories } = await payload.find({ collection: 'categories', where: { tenant: { equals: target.id } }, depth: 0, limit: 1, overrideAccess: true });
	if (existingTargetCategories.length > 0) {
		throw new Error(`Le tenant cible (${target.nom}) a déjà des catégories — abandon pour éviter un double seed. Nettoyer manuellement avant de relancer.`);
	}

	let updated = 0;
	for (const sp of sourcePages as any[]) {
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
		const wrapped = { gabarit: sp.gabarit, [groupField]: groupData };

		if (sp.gabarit === 'liste') {
			const idMap = await duplicateCategoriesForPage(payload, sp.id, tp.id, target.id);
			wrapped[groupField] = remapCategories(wrapped[groupField], idMap);
		}
		if (sp.gabarit === 'accueil') {
			remapAccueilPoiSentier(wrapped, poiIdMap, sentierIdMap);
		}

		const mediaIds = new Set<string>();
		const docIds = new Set<string>();
		collectMediaIds({ gabarit: sp.gabarit, [groupField]: wrapped[groupField] }, mediaIds, docIds);
		const mediaMap: Record<string, number> = {};
		for (const id of mediaIds) mediaMap[id] = await localizeMedia(id, (src) => ({ alt: src.alt, credit: src.credit }));
		const docMap: Record<string, number> = {};
		for (const id of docIds) docMap[id] = await localizeOne(payload, 'documents', id, target.id, baseUrl, (src) => ({ titre: src.titre }), mediaCache);
		remapMediaIds({ gabarit: sp.gabarit, [groupField]: wrapped[groupField] }, mediaMap, docMap);

		await payload.update({ collection: 'pages', id: tp.id, overrideAccess: true, data: { [groupField]: wrapped[groupField] } });
		console.log(`  ✓ ${sp.slug} (${sp.gabarit})`);
		updated++;
	}
	console.log(`${updated} pages mises à jour.`);
	console.log('Terminé.');
	process.exit(0);
}

main().catch((err) => {
	console.error('ÉCHEC:', err);
	process.exit(1);
});
