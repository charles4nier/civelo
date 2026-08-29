/**
 * Exporte toutes les données d'un tenant (commune) vers un dossier
 * autonome, prêt à être assemblé en archive livrable — voir
 * `scripts/build-tenant-archive.ts` pour la suite (code + docker-compose +
 * doc + checklist sécurité + zip).
 *
 * Usage :
 *   node --env-file=.env --experimental-loader=./scripts/_resolve-ts.mjs \
 *     scripts/export-tenant.ts --domaine=saint-hilaire-bonneval.fr --out=./exports
 *
 * Écrase le dossier de sortie s'il existe déjà (pas d'accumulation de runs).
 *
 * --- Décision : pas de préservation littérale des IDs d'origine ---
 * Vérifié empiriquement avant d'écrire ce script : l'API locale de Payload
 * IGNORE silencieusement un `id` explicite passé à `create()` sur cette
 * base (clés entières auto-incrémentées, pas UUID) — elle assigne toujours
 * la valeur de séquence suivante. Le script d'import généré (voir
 * `scripts/import-tenant.template.ts`) construit donc une table de
 * correspondance ancien→nouvel id au fur et à mesure des créations, dans
 * l'ordre de dépendance des collections, plutôt que de rejouer les ids
 * d'origine (impossible via l'API locale, que la consigne impose
 * d'utiliser). Le résultat fonctionnel est identique : toutes les relations
 * sont valides à l'arrivée. Les JSON exportés ici gardent les ids
 * D'ORIGINE tels quels (utile pour le débogage / suivre une relation à la
 * main) — c'est l'import qui fait la traduction.
 */
import { mkdir, writeFile, rm } from 'fs/promises';
import path from 'path';
import readline from 'readline';
import { getPayload } from 'payload';
import config from '../payload.config';

// Collections tenant-scoped (voir `payload.config.ts`) — `icones` est
// volontairement exclue de cette liste : bibliothèque partagée, pas liée à
// un tenant, exportée en intégralité séparément (voir `exportIcones`).
const TENANT_COLLECTIONS = ['pages', 'categories', 'media', 'documents', 'pois', 'sentiers'] as const;
const TENANT_GLOBALS = ['identite', 'bouton-entete', 'footer'] as const;

type Args = { domaine?: string; out?: string; 'base-url'?: string };

function parseArgs(): Args {
	const args: Args = {};
	for (const arg of process.argv.slice(2)) {
		const m = arg.match(/^--([^=]+)=(.*)$/);
		if (m) (args as any)[m[1]] = m[2];
	}
	return args;
}

function formatBytes(n: number): string {
	if (n < 1024) return `${n} o`;
	if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} Ko`;
	return `${(n / (1024 * 1024)).toFixed(1)} Mo`;
}

async function confirm(question: string): Promise<boolean> {
	if (process.env.EXPORT_TENANT_YES === '1') return true;
	const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
	const answer = await new Promise<string>((resolve) => rl.question(`${question} (o/N) `, resolve));
	rl.close();
	return answer.trim().toLowerCase() === 'o';
}

async function main() {
	const { domaine, out } = parseArgs();
	const baseUrl = parseArgs()['base-url'] || (domaine ? `https://${domaine}` : undefined);
	if (!domaine || !out) {
		console.error('Usage: export-tenant.ts --domaine=<domaine du tenant> --out=<dossier de sortie> [--base-url=http://localhost:3000]');
		process.exit(1);
	}

	const payload = await getPayload({ config });

	const { docs: tenants } = await payload.find({
		collection: 'tenants',
		where: { domaine: { equals: domaine } },
		overrideAccess: true
	});
	const tenant = tenants[0];
	if (!tenant) {
		console.error(`ÉCHEC : aucun tenant avec le domaine "${domaine}".`);
		process.exit(1);
	}
	console.log(`Tenant trouvé : ${tenant.nom} (id ${tenant.id}, domaine ${tenant.domaine})`);

	// --- a. Aperçu + confirmation ---
	const counts: Record<string, number> = {};
	for (const collection of TENANT_COLLECTIONS) {
		const { totalDocs } = await payload.count({ collection, where: { tenant: { equals: tenant.id } }, overrideAccess: true });
		counts[collection] = totalDocs;
	}
	const { totalDocs: iconesCount } = await payload.count({ collection: 'icones', overrideAccess: true });

	const { docs: mediaDocsForSize } = await payload.find({
		collection: 'media',
		where: { tenant: { equals: tenant.id } },
		limit: 0,
		pagination: false,
		depth: 0,
		overrideAccess: true
	});
	const { docs: documentDocsForSize } = await payload.find({
		collection: 'documents',
		where: { tenant: { equals: tenant.id } },
		limit: 0,
		pagination: false,
		depth: 0,
		overrideAccess: true
	});
	const totalBytes = [...mediaDocsForSize, ...documentDocsForSize].reduce((sum, d: any) => sum + (d.filesize ?? 0), 0);

	console.log('\nCe qui sera exporté :');
	for (const collection of TENANT_COLLECTIONS) console.log(`  ${collection}: ${counts[collection]}`);
	console.log(`  icones (bibliothèque partagée, intégrale) : ${iconesCount}`);
	console.log(`  identite / bouton-entete / footer : 1 chacun (si renseignés)`);
	console.log(`  poids estimé des fichiers (médias + documents) : ${formatBytes(totalBytes)}`);

	const proceed = await confirm(`\nExporter "${tenant.nom}" vers ${out} ?`);
	if (!proceed) {
		console.log('Annulé.');
		process.exit(0);
	}

	// --- Préparation du dossier de sortie ---
	const outDir = path.resolve(out);
	await rm(outDir, { recursive: true, force: true });
	const dataDir = path.join(outDir, 'data');
	const mediasDir = path.join(outDir, 'medias');
	await mkdir(dataDir, { recursive: true });
	await mkdir(mediasDir, { recursive: true });

	// --- b. Export des données ---
	const exportedByCollection: Record<string, any[]> = {};
	for (const collection of TENANT_COLLECTIONS) {
		const { docs } = await payload.find({
			collection,
			where: { tenant: { equals: tenant.id } },
			limit: 0,
			pagination: false,
			depth: 0,
			overrideAccess: true
		});
		exportedByCollection[collection] = docs;
		await writeFile(path.join(dataDir, `${collection}.json`), JSON.stringify(docs, null, 2));
		console.log(`  ✓ data/${collection}.json (${docs.length})`);
	}

	// --- c. Médias — téléchargement des fichiers du tenant, réécriture des
	// URLs vers des chemins relatifs locaux (`/medias/<filename>`, servis
	// statiquement par l'app de l'archive — voir `docker-compose.yml`). Le
	// fichier JSON réécrit remplace le fichier "brut" écrit juste au-dessus.
	if (!baseUrl) throw new Error('--base-url requis (ou --domaine, utilisé par défaut comme https://<domaine>)');
	for (const collection of ['media', 'documents'] as const) {
		const docs = exportedByCollection[collection];
		for (const doc of docs) {
			if (!doc.filename || !doc.url) continue;
			const res = await fetch(`${baseUrl}${doc.url}`);
			if (!res.ok) throw new Error(`Téléchargement échoué (${res.status}) : ${baseUrl}${doc.url}`);
			const buf = Buffer.from(await res.arrayBuffer());
			await writeFile(path.join(mediasDir, doc.filename), buf);
			doc.url = `/medias/${doc.filename}`;
			if (doc.thumbnailURL) doc.thumbnailURL = null;
		}
		await writeFile(path.join(dataDir, `${collection}.json`), JSON.stringify(docs, null, 2));
		console.log(`  ✓ medias/ : ${docs.length} fichier(s) de "${collection}" téléchargé(s), data/${collection}.json réécrit`);
	}

	// Vérification immédiate — aucune URL ne doit encore pointer vers notre
	// bucket/API après réécriture (repris formellement dans la checklist
	// sécurité de `scripts/build-tenant-archive.ts`, revérifié ici tout de
	// suite pour échouer vite si le remplacement ci-dessus a un trou).
	const rewrittenJson = JSON.stringify([...exportedByCollection.media, ...exportedByCollection.documents]);
	if (rewrittenJson.includes('/api/media/file/') || rewrittenJson.includes(baseUrl)) {
		throw new Error('ÉCHEC sécurité : une URL pointant vers notre instance subsiste après réécriture des médias.');
	}

	// Bibliothèque d'icônes — partagée, exportée en intégralité (pas de
	// filtre tenant, `icones` n'a pas ce champ, voir payload.config.ts).
	const { docs: icones } = await payload.find({ collection: 'icones', limit: 0, pagination: false, depth: 0, overrideAccess: true });
	await writeFile(path.join(dataDir, 'icones.json'), JSON.stringify(icones, null, 2));
	console.log(`  ✓ data/icones.json (${icones.length})`);

	// Globals convertis en collections tenant-scopées (étape 5 du plan
	// multi-tenant) — un seul document par tenant, jamais un tableau.
	for (const slug of TENANT_GLOBALS) {
		const { docs } = await payload.find({
			collection: slug,
			where: { tenant: { equals: tenant.id } },
			limit: 1,
			depth: 0,
			overrideAccess: true
		});
		await writeFile(path.join(dataDir, `${slug}.json`), JSON.stringify(docs[0] ?? null, null, 2));
		console.log(`  ✓ data/${slug}.json`);
	}

	// La fiche tenant elle-même — sert à recréer le tenant unique de
	// l'archive (mode mono-tenant, voir payload.config.ts).
	await writeFile(path.join(dataDir, 'tenant.json'), JSON.stringify(tenant, null, 2));
	console.log('  ✓ data/tenant.json');

	console.log(`\nExport de données terminé : ${outDir}`);
	console.log('TENANT_ID=' + tenant.id);
	process.exit(0);
}

main().catch((err) => {
	console.error('ÉCHEC:', err);
	process.exit(1);
});
