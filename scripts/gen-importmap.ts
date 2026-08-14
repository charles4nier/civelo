/**
 * Contourne `payload generate:importmap` (CLI cassée par une incompatibilité
 * ESM/CJS avec @payloadcms/richtext-lexical dans cet environnement) en
 * appelant la fonction directement, comme `scripts/seed.ts` le fait déjà
 * avec succès pour `payload.config.ts`.
 */
import { getPayload, generateImportMap } from 'payload';
import config from '../payload.config';

async function main() {
	const payload = await getPayload({ config });
	await generateImportMap(payload.config, { force: true, log: true });
	console.log('importMap régénéré.');
}

main()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
