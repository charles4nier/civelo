import { getPayload } from 'payload';
import config from '../payload.config';

const DOMAINS = ['clocher.civelo.fr', 'belvedere.civelo.fr', 'preau.civelo.fr'];

async function main() {
	const payload = await getPayload({ config });
	for (const domaine of DOMAINS) {
		const { docs: tenants } = await payload.find({ collection: 'tenants', where: { domaine: { equals: domaine } }, depth: 0, overrideAccess: true });
		const tenant = tenants[0] as any;
		if (!tenant) {
			console.log(`${domaine}>>>INTROUVABLE`);
			continue;
		}
		console.log(`${domaine}:TENANT>>>` + JSON.stringify({ id: tenant.id, nom: tenant.nom, coordonnees: tenant.coordonnees }));

		const { docs: identiteDocs } = await payload.find({ collection: 'identite', where: { tenant: { equals: tenant.id } }, depth: 0, overrideAccess: true });
		console.log(`${domaine}:IDENTITE>>>` + JSON.stringify(identiteDocs[0]));

		const { docs: footerDocs } = await payload.find({ collection: 'footer', where: { tenant: { equals: tenant.id } }, depth: 0, overrideAccess: true });
		console.log(`${domaine}:FOOTER>>>` + JSON.stringify(footerDocs[0]));

		for (const slug of ['accueil', 'commerces', 'vivre/enfance-jeunesse', 'mairie/maire-elus']) {
			const { docs: pages } = await payload.find({
				collection: 'pages',
				where: { tenant: { equals: tenant.id }, slug: { equals: slug } },
				depth: 0,
				limit: 1,
				overrideAccess: true
			});
			const p = pages[0] as any;
			const relevant = p ? { slug: p.slug, gabarit: p.gabarit, data: p[p.gabarit] } : null;
			console.log(`${domaine}:PAGE:${slug}>>>` + JSON.stringify(relevant));
		}
	}
	process.exit(0);
}

main();
