import { getPayload } from 'payload';
import config from '../payload.config';

async function main() {
	const payload = await getPayload({ config });
	const { docs: tenants } = await payload.find({ collection: 'tenants', depth: 0, limit: 100, overrideAccess: true });
	for (const t of tenants as any[]) {
		console.log(`${t.id} | ${t.nom} | ${t.domaine} | theme=${t.theme} | statut=${t.statutContrat}`);
	}
	process.exit(0);
}

main();
