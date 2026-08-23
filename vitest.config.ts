import { defineConfig } from 'vitest/config';
import path from 'node:path';

// Étape 10 du plan multi-tenant — suite de tests d'isolation entre
// tenants, contre une vraie base Postgres (pas de mock : ce qu'on veut
// vérifier, c'est que le filtrage par tenant fonctionne réellement en
// base). Alias alignés sur `tsconfig.json`/`next.config.mjs`.
export default defineConfig({
	test: {
		environment: 'node',
		include: ['tests/**/*.test.ts'],
		testTimeout: 30000,
		hookTimeout: 30000,
		// Chaque fichier de test appelle `getPayload({config})`, qui déclenche
		// une synchronisation de schéma Postgres (`push`, Drizzle) au premier
		// appel. En parallèle (comportement par défaut de Vitest, un worker
		// par fichier), deux pushes concurrents sur la même base se marchent
		// dessus (DDL en conflit) — désactivé, la suite reste petite.
		fileParallelism: false
	},
	resolve: {
		alias: {
			'@shared': path.resolve(__dirname, 'shared'),
			'@themes': path.resolve(__dirname, 'themes'),
			'@lib': path.resolve(__dirname, 'lib'),
			'@types': path.resolve(__dirname, 'types')
		}
	}
});
