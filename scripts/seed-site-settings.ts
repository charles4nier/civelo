/**
 * Décision 61 — seed isolé des 3 globals (Identité, Bouton d'en-tête, Pied
 * de page) uniquement, sans relancer tout `seed.ts` (qui échouerait sur les
 * pages/slugs déjà seedés — unicité de `slug`, singleton Accueil décision 9).
 * Réutilise `seedSiteSettings` exportée depuis `seed.ts`.
 *
 * `npx tsx scripts/seed-site-settings.ts`
 */
import { getPayload } from 'payload';
import config from '../payload.config';
import { seedSiteSettings } from './seed';

async function main() {
	const payload = await getPayload({ config });
	await seedSiteSettings(payload);
	console.log('Identité, bouton d\'en-tête et pied de page renseignés.');
}

main()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
