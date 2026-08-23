// Étape 1 du plan multi-tenant — deux bugs distincts empêchaient les scripts
// Local API de tourner sous Postgres :
// 1. `payload generate:importmap` (le vrai CLI) plante sur un top-level
//    await dans `@payloadcms/richtext-lexical` requis en CJS.
// 2. Le contournement précédent (tsx + getPayload) plante différemment :
//    `payload/dist/bin/loadEnv.js` importe `@next/env` (CJS sans export
//    `default`), et tsx transforme cet import en CJS d'une façon qui casse
//    l'interop hors d'un vrai process Next.js.
//
// Node 22 sait exécuter du TypeScript nativement (`--experimental-strip-
// types`, activé par défaut) et gère l'interop ESM/CJS correctement dans
// les deux cas ci-dessus — vérifié : les deux erreurs disparaissent sans
// tsx. Le seul manque : la résolution d'extension (`./payload.config` doit
// pointer explicitement vers `.ts`). Ce hook comble ce seul manque, pour
// garder le style d'import du projet (sans extension) partout ailleurs.
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];

export async function resolve(specifier, context, nextResolve) {
	try {
		return await nextResolve(specifier, context);
	} catch (err) {
		if (err?.code !== 'ERR_MODULE_NOT_FOUND' || !specifier.startsWith('.')) throw err;

		const parentPath = fileURLToPath(context.parentURL);
		const base = path.resolve(path.dirname(parentPath), specifier);

		for (const ext of EXTENSIONS) {
			if (existsSync(base + ext)) {
				return nextResolve(pathToFileURL(base + ext).href, context);
			}
		}
		for (const ext of EXTENSIONS) {
			const indexPath = path.join(base, `index${ext}`);
			if (existsSync(indexPath)) {
				return nextResolve(pathToFileURL(indexPath).href, context);
			}
		}
		throw err;
	}
}
