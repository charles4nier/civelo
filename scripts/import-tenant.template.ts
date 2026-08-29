/**
 * Réimporte un export produit par `scripts/export-tenant.ts` dans une base
 * VIERGE, en mode mono-tenant (voir `payload.config.ts`, `SINGLE_TENANT_SLUG`).
 * Ce fichier est le gabarit copié tel quel dans chaque archive livrable —
 * voir `scripts/build-tenant-archive.ts` — sous le nom `scripts/import.ts`.
 * Ne dépend d'aucun autre fichier de notre dépôt : autonome par conception.
 *
 * Usage : node --env-file=.env --experimental-loader=./scripts/_resolve-ts.mjs scripts/import.ts
 * (lit `data/*.json` et `medias/` à côté de ce script)
 *
 * --- Pourquoi une correspondance d'ids plutôt que les ids d'origine ---
 * L'API locale de Payload ignore silencieusement un `id` explicite passé à
 * `create()` sur cette base (clés entières auto-incrémentées) — vérifié
 * avant d'écrire ce script. Chaque étape construit donc une table
 * ancien→nouvel id au fur et à mesure des créations, et les étapes
 * suivantes l'utilisent pour réécrire leurs propres relations avant de
 * créer leurs documents. Résultat identique pour l'utilisateur final :
 * toutes les relations sont valides à l'arrivée.
 *
 * --- Pourquoi les pages sont importées en 2 passes ---
 * `categories.page` est obligatoire et pointe vers une page ; les items de
 * page (`itemsAnnuaire[].categorie`...) pointent vers des catégories —
 * dépendance circulaire réelle entre les deux collections. Et une page peut
 * pointer vers une AUTRE page (`quickAccessItems[].lien`, boutons...) —
 * circulaire au sein même de la collection. Résolu par le classique
 * "créer la coquille, remplir après" : passe 1 crée toutes les pages avec
 * seulement leurs champs d'identité (titre/slug/gabarit/menu), passe 2 (une
 * fois catégories et pages-coquilles connues) met à jour chaque page avec
 * son contenu complet, relations réécrites.
 */
import { readFile, readdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPayload } from 'payload';
import config from '../app/payload.config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
const mediasDir = path.join(__dirname, '..', 'medias');

async function readJson<T>(name: string): Promise<T> {
	return JSON.parse(await readFile(path.join(dataDir, `${name}.json`), 'utf-8'));
}

type IdMap = Map<string | number, string | number>;
const remap = (map: IdMap, id: unknown): unknown => {
	if (id === null || id === undefined) return id;
	return map.get(id as string | number) ?? id;
};
const remapArray = (map: IdMap, ids: unknown): unknown => (Array.isArray(ids) ? ids.map((id) => remap(map, id)) : ids);

const CATEGORY_FIELDS: { array: string; field: string }[] = [
	{ array: 'itemsAnnuaire', field: 'categorie' },
	{ array: 'itemsDemarches', field: 'categorie' },
	{ array: 'itemsActualites', field: 'categorie' },
	{ array: 'itemsAgenda', field: 'categorie' },
	{ array: 'itemsDocument', field: 'type' }
];

function remapListe(liste: any, maps: { categories: IdMap; documents: IdMap; icones: IdMap; pages: IdMap }): any {
	if (!liste) return liste;
	const out = { ...liste };
	for (const { array, field } of CATEGORY_FIELDS) {
		if (Array.isArray(out[array])) out[array] = out[array].map((it: any) => ({ ...it, [field]: remap(maps.categories, it[field]) }));
	}
	if (Array.isArray(out.itemsDemarches)) out.itemsDemarches = out.itemsDemarches.map((it: any) => ({ ...it, icone: remap(maps.icones, it.icone) }));
	if (Array.isArray(out.itemsDocument)) out.itemsDocument = out.itemsDocument.map((it: any) => ({ ...it, fichier: remap(maps.documents, it.fichier) }));
	if (Array.isArray(out.itemsBudgetProjet))
		out.itemsBudgetProjet = out.itemsBudgetProjet.map((it: any) => (it.fichier ? { ...it, fichier: remap(maps.documents, it.fichier) } : it));
	if (Array.isArray(out.itemsActualites))
		out.itemsActualites = out.itemsActualites.map((it: any) => (it.lienDocument ? { ...it, lienDocument: remap(maps.pages, it.lienDocument) } : it));
	return out;
}

function remapTrombinoscope(t: any, maps: { media: IdMap }): any {
	if (!t) return t;
	return { ...t, membres: (t.membres ?? []).map((m: any) => ({ ...m, photo: remap(maps.media, m.photo) })) };
}

function remapCatalogueLieux(c: any, maps: { media: IdMap; icones: IdMap }): any {
	if (!c) return c;
	return {
		...c,
		salles: (c.salles ?? []).map((s: any) => ({ ...s, icone: remap(maps.icones, s.icone), images: remapArray(maps.media, s.images) }))
	};
}

function remapEditorial(e: any, maps: { media: IdMap }): any {
	if (!e) return e;
	return {
		...e,
		sections: (e.sections ?? []).map((block: any) => {
			if (block.blockType === 'intro')
				return {
					...block,
					imagePrincipale: remap(maps.media, block.imagePrincipale),
					imageSecondaire1: remap(maps.media, block.imageSecondaire1),
					imageSecondaire2: remap(maps.media, block.imageSecondaire2)
				};
			if (block.blockType === 'imagePleineLargeur')
				return { ...block, imageDesktop: remap(maps.media, block.imageDesktop), imageMobile: remap(maps.media, block.imageMobile) };
			if (block.blockType === 'grilleImages')
				return { ...block, image1: remap(maps.media, block.image1), image2: remap(maps.media, block.image2), image3: remap(maps.media, block.image3) };
			return block;
		})
	};
}

function remapHoraires(h: any, maps: { icones: IdMap }): any {
	if (!h) return h;
	return { ...h, contactsPratiques: (h.contactsPratiques ?? []).map((c: any) => ({ ...c, icone: remap(maps.icones, c.icone) })) };
}

function remapAccueil(a: any, maps: { media: IdMap; icones: IdMap; pages: IdMap; pois: IdMap; sentiers: IdMap }): any {
	if (!a) return a;
	return {
		...a,
		hero: a.hero
			? {
					...a.hero,
					image: remap(maps.media, a.hero.image),
					boutonPrincipalLien: remap(maps.pages, a.hero.boutonPrincipalLien),
					boutonSecondaireLien: remap(maps.pages, a.hero.boutonSecondaireLien)
				}
			: a.hero,
		quickAccessItems: (a.quickAccessItems ?? []).map((it: any) => ({ ...it, icone: remap(maps.icones, it.icone), lien: remap(maps.pages, it.lien) })),
		mayorWord: a.mayorWord ? { ...a.mayorWord, image: remap(maps.media, a.mayorWord.image) } : a.mayorWord,
		discoverCards: (a.discoverCards ?? []).map((c: any) => ({
			...c,
			image: remap(maps.media, c.image),
			lienPoi: remap(maps.pois, c.lienPoi),
			lienSentier: remap(maps.sentiers, c.lienSentier)
		}))
	};
}

const GABARIT_GROUP_FIELD: Record<string, string> = {
	liste: 'liste',
	trombinoscope: 'trombinoscope',
	'catalogue-lieux': 'catalogueLieux',
	editorial: 'editorial',
	horaires: 'horaires',
	accueil: 'accueil'
	// contact / numeros-utiles / carte-interactive n'ont aucune relation à
	// réécrire (voir l'analyse en tête de fichier) — copiés tels quels par
	// la passe 1, pas besoin d'une passe 2 pour eux.
};

async function main() {
	const payload = await getPayload({ config });
	console.log('Import démarré.');

	// --- Tenant unique ---
	const tenantData = await readJson<any>('tenant');
	const { id: _tenantOldId, updatedAt, createdAt, ...tenantRest } = tenantData;
	const blasonOldId = tenantRest.blason;
	delete tenantRest.blason;
	const tenant = await payload.create({ collection: 'tenants', overrideAccess: true, data: tenantRest });
	console.log(`✓ tenant "${tenant.nom}" (id ${tenant.id})`);

	// --- Icônes (bibliothèque partagée, aucune relation à réécrire) ---
	const iconesData = await readJson<any[]>('icones');
	const iconesMap: IdMap = new Map();
	for (const icone of iconesData) {
		const { id, updatedAt, createdAt, ...rest } = icone;
		const created = await payload.create({ collection: 'icones', overrideAccess: true, data: rest });
		iconesMap.set(id, created.id);
	}
	console.log(`✓ icones (${iconesMap.size})`);

	// --- Médias / documents — fichiers réels lus depuis medias/ ---
	async function importUploads(collection: 'media' | 'documents'): Promise<IdMap> {
		const docs = await readJson<any[]>(collection);
		const map: IdMap = new Map();
		for (const doc of docs) {
			const { id, updatedAt, createdAt, url, thumbnailURL, filesize, width, height, focalX, focalY, sizes, ...rest } = doc;
			const buf = await readFile(path.join(mediasDir, doc.filename));
			const created = await payload.create({
				collection,
				overrideAccess: true,
				data: { ...rest, tenant: tenant.id },
				file: { data: buf, mimetype: doc.mimeType, name: doc.filename, size: buf.length }
			});
			map.set(id, created.id);
		}
		console.log(`✓ ${collection} (${map.size})`);
		return map;
	}
	const mediaMap = await importUploads('media');
	const documentsMap = await importUploads('documents');

	if (blasonOldId) {
		await payload.update({ collection: 'tenants', id: tenant.id, overrideAccess: true, data: { blason: remap(mediaMap, blasonOldId) } });
	}

	// --- Lieux / sentiers (relient seulement des médias) ---
	async function importSimple(collection: 'pois' | 'sentiers'): Promise<IdMap> {
		const docs = await readJson<any[]>(collection);
		const map: IdMap = new Map();
		for (const doc of docs) {
			const { id, updatedAt, createdAt, image, ...rest } = doc;
			const created = await payload.create({ collection, overrideAccess: true, data: { ...rest, tenant: tenant.id, image: remap(mediaMap, image) } });
			map.set(id, created.id);
		}
		console.log(`✓ ${collection} (${map.size})`);
		return map;
	}
	const poisMap = await importSimple('pois');
	const sentiersMap = await importSimple('sentiers');

	// --- Pages, passe 1 : les coquilles existent déjà ---
	// `Tenants.ts` (`afterChange`) sème automatiquement 18 pages génériques
	// dès la création du tenant, PLUS HAUT dans ce script — mêmes 18 slugs
	// que ceux de l'export (`lib/seedDefaultPages.ts`, la source d'origine
	// de la structure du site). Les recréer nous-mêmes provoquerait un
	// doublon de slug (violation de l'index unique tenant+slug) : on
	// réutilise ces pages déjà là comme coquilles, retrouvées par slug —
	// aucun problème de dépendance circulaire avec les catégories/pages,
	// puisqu'elles existent déjà avant même le début de cet import.
	const pagesData = await readJson<any[]>('pages');
	const { docs: seededPages } = await payload.find({ collection: 'pages', where: { tenant: { equals: tenant.id } }, limit: 0, pagination: false, depth: 0, overrideAccess: true });
	const seededBySlug = new Map<string, string | number>(seededPages.map((p: any) => [p.slug, p.id]));
	const pagesMap: IdMap = new Map();
	for (const page of pagesData) {
		const seededId = seededBySlug.get(page.slug);
		if (!seededId) throw new Error(`Slug "${page.slug}" absent du seed par défaut — vérifier lib/seedDefaultPages.ts.`);
		pagesMap.set(page.id, seededId);
	}
	console.log(`✓ pages, coquilles réutilisées (${pagesMap.size})`);

	// --- Catégories (dépendent des pages-coquilles) ---
	const categoriesData = await readJson<any[]>('categories');
	const categoriesMap: IdMap = new Map();
	for (const cat of categoriesData) {
		const { id, updatedAt, createdAt, page, icone, ...rest } = cat;
		const created = await payload.create({
			collection: 'categories',
			overrideAccess: true,
			data: { ...rest, tenant: tenant.id, page: remap(pagesMap, page), icone: remap(iconesMap, icone) }
		});
		categoriesMap.set(id, created.id);
	}
	console.log(`✓ categories (${categoriesMap.size})`);

	// --- Pages, passe 2 : contenu complet, relations réécrites ---
	const relationMaps = { media: mediaMap, documents: documentsMap, icones: iconesMap, pages: pagesMap, pois: poisMap, sentiers: sentiersMap, categories: categoriesMap };
	for (const page of pagesData) {
		const newId = pagesMap.get(page.id)!;
		const groupField = GABARIT_GROUP_FIELD[page.gabarit];
		const updateData: Record<string, unknown> = {};
		if (groupField === 'liste') updateData.liste = remapListe(page.liste, relationMaps);
		else if (groupField === 'trombinoscope') updateData.trombinoscope = remapTrombinoscope(page.trombinoscope, relationMaps);
		else if (groupField === 'catalogueLieux') updateData.catalogueLieux = remapCatalogueLieux(page.catalogueLieux, relationMaps);
		else if (groupField === 'editorial') updateData.editorial = remapEditorial(page.editorial, relationMaps);
		else if (groupField === 'horaires') updateData.horaires = remapHoraires(page.horaires, relationMaps);
		else if (groupField === 'accueil') updateData.accueil = remapAccueil(page.accueil, relationMaps);
		else if (page.gabarit === 'contact') updateData.contact = page.contact;
		else if (page.gabarit === 'numeros-utiles') updateData.numerosUtiles = page.numerosUtiles;
		else if (page.gabarit === 'carte-interactive') updateData.carteInteractive = page.carteInteractive;

		if (Object.keys(updateData).length > 0) {
			await payload.update({ collection: 'pages', id: newId, overrideAccess: true, data: updateData });
		}
	}
	console.log('✓ pages, contenu complet');

	// --- Identité / bouton d'en-tête / pied de page ---
	const identite = await readJson<any>('identite');
	if (identite) {
		const { id, updatedAt, createdAt, logo, ...rest } = identite;
		await payload.create({ collection: 'identite', overrideAccess: true, data: { ...rest, tenant: tenant.id, logo: remap(mediaMap, logo) } });
		console.log('✓ identite');
	}
	const boutonEntete = await readJson<any>('bouton-entete');
	if (boutonEntete) {
		const { id, updatedAt, createdAt, boutonLien, ...rest } = boutonEntete;
		await payload.create({ collection: 'bouton-entete', overrideAccess: true, data: { ...rest, tenant: tenant.id, boutonLien: remap(pagesMap, boutonLien) } });
		console.log('✓ bouton-entete');
	}
	const footer = await readJson<any>('footer');
	if (footer) {
		const { id, updatedAt, createdAt, ...rest } = footer;
		await payload.create({ collection: 'footer', overrideAccess: true, data: { ...rest, tenant: tenant.id } });
		console.log('✓ footer');
	}

	console.log('\nImport terminé avec succès.');
	process.exit(0);
}

main().catch((err) => {
	console.error('ÉCHEC:', err);
	process.exit(1);
});
