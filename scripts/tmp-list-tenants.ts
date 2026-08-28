import { getPayload } from 'payload';
import config from '../payload.config';

const payload = await getPayload({ config });
const { docs } = await payload.find({ collection: 'tenants', limit: 100, overrideAccess: true });
for (const d of docs as any[]) {
	console.log(`TENANT id=${d.id} nom=${JSON.stringify(d.nom)} domaine=${d.domaine} theme=${d.theme}`);
}
process.exit(0);
