import { getPayload } from 'payload';
import config from '../payload.config';

const payload = await getPayload({ config });
const { docs } = await payload.find({ collection: 'tenants', limit: 100, overrideAccess: true });
console.log(JSON.stringify(docs.map((d: any) => ({ id: d.id, nom: d.nom, domaine: d.domaine, theme: d.theme })), null, 2));
process.exit(0);
