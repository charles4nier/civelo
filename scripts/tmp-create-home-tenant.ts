import { getPayload } from 'payload';
import config from '../payload.config';

const payload = await getPayload({ config });
const domaine = process.argv[2];
if (!domaine) {
	console.error('Usage: tmp-create-home-tenant.ts <domaine>');
	process.exit(1);
}
const { docs: existing } = await payload.find({ collection: 'tenants', where: { domaine: { equals: domaine } }, overrideAccess: true });
if (existing.length > 0) {
	console.log('TENANT_ID=' + existing[0].id + ' (déjà existant)');
	process.exit(0);
}
const tenant = await payload.create({
	collection: 'tenants',
	overrideAccess: true,
	data: { nom: 'Civelo Admin', domaine, theme: 'edito', statutContrat: 'actif' }
});
console.log('TENANT_ID=' + tenant.id);
process.exit(0);
