/**
 * Suite de `seed-demo-content-from-edito.ts` — ce dernier copie le CONTENU
 * (texte, catégories) mais réutilise les `Media`/`Documents` d'edito tels
 * quels (voir son commentaire d'en-tête). Résultat : ces fichiers
 * s'affichent bien sur le site public, mais n'apparaissent pas dans la
 * bibliothèque média du tenant cible (le plugin multi-tenant filtre les
 * collections par `tenant` côté admin) — impossible de les gérer depuis
 * son propre back-office.
 *
 * Ce script télécharge chaque image/PDF référencé par les pages/POI/
 * sentiers déjà copiés (hors Accueil, jamais touché par la copie de
 * contenu) et le ré-uploade comme un fichier `media`/`documents` propre au
 * tenant cible, puis remplace les références. Idempotent : un média déjà
 * possédé par le tenant cible (créé par un run précédent) n'est pas re-tiré.
 *
 * Usage :
 *   node --experimental-loader=./scripts/_resolve-ts.mjs scripts/localize-media-for-tenant.ts <domaineCible> [baseUrlSource]
 *   (baseUrlSource par défaut : https://edito.civelo.fr — en local, passer http://localhost:3000)
 */
import { getPayload } from 'payload';
import config from '../payload.config';

const GABARIT_GROUP_FIELD: Record<string, string> = {
	liste: 'liste',
	trombinoscope: 'trombinoscope',
	'catalogue-lieux': 'catalogueLieux',
	editorial: 'editorial'
};

function collectIds(sp: any, mediaIds: Set<string>, docIds: Set<string>) {
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
					[block.imagePrincipale, block.imageSecondaire1, block.imageSecondaire2].forEach((v) => v && mediaIds.add(String(v)));
				} else if (block.blockType === 'imagePleineLargeur') {
					[block.imageDesktop, block.imageMobile].forEach((v) => v && mediaIds.add(String(v)));
				} else if (block.blockType === 'grilleImages') {
					[block.image1, block.image2, block.image3].forEach((v) => v && mediaIds.add(String(v)));
				}
			}
			break;
	}
}

function remapIds(sp: any, mediaMap: Record<string, number>, docMap: Record<string, number>) {
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
	}
}

async function localizeOne(
	payload: Awaited<ReturnType<typeof getPayload>>,
	collection: 'media' | 'documents',
	id: string,
	targetTenantId: number,
	baseUrl: string,
	extraData: (src: any) => Record<string, unknown>
): Promise<number> {
	const src = await payload.findByID({ collection, id, overrideAccess: true, depth: 0 });
	if (String((src as any).tenant) === String(targetTenantId)) return Number(id); // déjà localisé (run précédent)

	const res = await fetch(`${baseUrl}${(src as any).url}`);
	if (!res.ok) throw new Error(`Téléchargement échoué (${res.status}) : ${baseUrl}${(src as any).url}`);
	const buf = Buffer.from(await res.arrayBuffer());

	const created = await payload.create({
		collection,
		overrideAccess: true,
		data: { tenant: targetTenantId, ...extraData(src) },
		file: { data: buf, mimetype: (src as any).mimeType, name: (src as any).filename, size: buf.length }
	});
	return created.id as number;
}

async function main() {
	const targetDomain = process.argv[2];
	const baseUrl = process.argv[3] || 'https://edito.civelo.fr';
	if (!targetDomain) {
		console.error('Usage: localize-media-for-tenant.ts <domaineCible> [baseUrlSource]');
		process.exit(1);
	}

	const payload = await getPayload({ config });

	const { docs: targetTenants } = await payload.find({ collection: 'tenants', where: { domaine: { equals: targetDomain } }, overrideAccess: true });
	const target = targetTenants[0];
	if (!target) throw new Error(`Tenant cible introuvable (${targetDomain})`);
	console.log(`Cible : ${target.nom} (id ${target.id})`);

	const { docs: pages } = await payload.find({ collection: 'pages', where: { tenant: { equals: target.id } }, depth: 0, limit: 100, overrideAccess: true });
	const { docs: pois } = await payload.find({ collection: 'pois', where: { tenant: { equals: target.id } }, depth: 0, limit: 0, pagination: false, overrideAccess: true });
	const { docs: sentiers } = await payload.find({ collection: 'sentiers', where: { tenant: { equals: target.id } }, depth: 0, limit: 0, pagination: false, overrideAccess: true });

	const mediaIds = new Set<string>();
	const docIds = new Set<string>();
	const relevantPages = (pages as any[]).filter((p) => p.slug !== 'accueil' && GABARIT_GROUP_FIELD[p.gabarit]);
	for (const p of relevantPages) collectIds(p, mediaIds, docIds);
	for (const poi of pois as any[]) if (poi.image) mediaIds.add(String(poi.image));
	for (const s of sentiers as any[]) if (s.image) mediaIds.add(String(s.image));

	console.log(`${mediaIds.size} médias et ${docIds.size} documents référencés.`);

	const mediaMap: Record<string, number> = {};
	for (const id of mediaIds) {
		mediaMap[id] = await localizeOne(payload, 'media', id, target.id as number, baseUrl, (src) => ({ alt: src.alt, credit: src.credit }));
		console.log(`  media ${id} → ${mediaMap[id]}`);
	}
	const docMap: Record<string, number> = {};
	for (const id of docIds) {
		docMap[id] = await localizeOne(payload, 'documents', id, target.id as number, baseUrl, (src) => ({ titre: src.titre }));
		console.log(`  document ${id} → ${docMap[id]}`);
	}

	for (const p of relevantPages) {
		remapIds(p, mediaMap, docMap);
		const groupField = GABARIT_GROUP_FIELD[p.gabarit];
		await payload.update({ collection: 'pages', id: p.id, overrideAccess: true, data: { [groupField]: p[groupField] } });
		console.log(`  ✓ page ${p.slug} mise à jour`);
	}
	for (const poi of pois as any[]) {
		if (!poi.image) continue;
		const newId = mediaMap[String(poi.image)];
		if (newId != null) await payload.update({ collection: 'pois', id: poi.id, overrideAccess: true, data: { image: newId } });
	}
	for (const s of sentiers as any[]) {
		if (!s.image) continue;
		const newId = mediaMap[String(s.image)];
		if (newId != null) await payload.update({ collection: 'sentiers', id: s.id, overrideAccess: true, data: { image: newId } });
	}

	console.log('Terminé.');
	process.exit(0);
}

main().catch((err) => {
	console.error('ÉCHEC:', err);
	process.exit(1);
});
