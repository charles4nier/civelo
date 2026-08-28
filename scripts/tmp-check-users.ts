import { getPayload } from 'payload';
import config from '../payload.config';

const payload = await getPayload({ config });
const { docs } = await payload.find({ collection: 'users', limit: 0, pagination: false, depth: 0, overrideAccess: true });
for (const u of docs as any[]) {
	console.log(`USER id=${u.id} email=${u.email} role=${u.role} tenants=${JSON.stringify(u.tenants)}`);
}
process.exit(0);
