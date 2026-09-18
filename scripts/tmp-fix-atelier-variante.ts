import { getPayload } from 'payload';
import config from '../payload.config';

async function main() {
	const payload = await getPayload({ config });
	const { docs: tenants } = await payload.find({ collection: 'tenants', where: { domaine: { equals: 'atelier.civelo.fr' } }, depth: 0, overrideAccess: true });
	const target = tenants[0] as any;
	console.log(`Avant : variante = "${target.variante}"`);
	await payload.update({ collection: 'tenants', id: target.id, overrideAccess: true, data: { variante: 'tourisme' } });
	console.log('✓ variante mise à jour à "tourisme".');
	process.exit(0);
}

main();
