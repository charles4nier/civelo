import { getPayload } from 'payload';
import config from '../payload.config';

async function main() {
	const payload = await getPayload({ config });
	const { docs: tenants } = await payload.find({ collection: 'tenants', where: { domaine: { equals: 'atelier.civelo.fr' } }, depth: 0, overrideAccess: true });
	const tenant = tenants[0] as any;
	const { docs: pages } = await payload.find({
		collection: 'pages',
		where: { tenant: { equals: tenant.id }, gabarit: { equals: 'accueil' } },
		depth: 0,
		limit: 1,
		overrideAccess: true
	});
	const accueil = pages[0] as any;
	console.log(JSON.stringify(accueil.accueil.discoverCards, null, 2));
	process.exit(0);
}

main();
