import { getPayload } from 'payload';
import config from '../payload.config';

async function main() {
	const payload = await getPayload({ config });
	const { docs: tenants } = await payload.find({ collection: 'tenants', where: { domaine: { equals: 'atelier.civelo.fr' } }, depth: 0, overrideAccess: true });
	const tenant = tenants[0] as any;
	console.log('=== TENANT ===');
	console.log(JSON.stringify({ nom: tenant.nom, coordonnees: tenant.coordonnees }, null, 2));

	const { docs: identiteDocs } = await payload.find({ collection: 'identite', where: { tenant: { equals: tenant.id } }, depth: 0, overrideAccess: true });
	console.log('=== IDENTITE ===');
	console.log(JSON.stringify(identiteDocs[0], null, 2));

	const { docs: footerDocs } = await payload.find({ collection: 'footer', where: { tenant: { equals: tenant.id } }, depth: 0, overrideAccess: true });
	console.log('=== FOOTER ===');
	console.log(JSON.stringify(footerDocs[0], null, 2));

	for (const slug of ['commerces', 'vivre/enfance-jeunesse', 'mairie/maire-elus']) {
		const { docs: pages } = await payload.find({
			collection: 'pages',
			where: { tenant: { equals: tenant.id }, slug: { equals: slug } },
			depth: 0,
			limit: 1,
			overrideAccess: true
		});
		console.log(`=== PAGE ${slug} ===`);
		console.log(JSON.stringify(pages[0], null, 2));
	}

	process.exit(0);
}

main();
