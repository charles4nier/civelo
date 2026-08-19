/**
 * Décision 58 — seed isolé de la collection `Icones` uniquement, sans
 * relancer tout `seed.ts` (qui recréerait en double les pages/catégories/
 * annuaire déjà seedées lors d'un premier passage — la page Accueil,
 * singleton, échouerait même carrément à la validation, décision 9).
 * Réutilise `SEED_ICONES`/`seedIcones` exportées depuis `seed.ts`.
 *
 * `npx tsx scripts/seed-icones.ts`
 */
import { getPayload } from 'payload';
import config from '../payload.config';
import { seedIcones } from './seed';

async function main() {
	const payload = await getPayload({ config });
	const icones = await seedIcones(payload);
	console.log(`${Object.keys(icones).length} icônes créées.`);
}

main()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
