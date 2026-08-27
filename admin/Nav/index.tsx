import type { ServerProps } from 'payload';
import AdminNavClient from './Client';
import { getSelectedTenantId } from '../lib/getSelectedTenantId';

// Décision 43/46 — sidebar sur-mesure. Server Component (reçoit `payload`
// via les ServerProps que Payload injecte automatiquement dans les
// composants admin custom) : va chercher la vraie liste des pages une fois,
// côté serveur, plutôt que de la coder en dur ou de la refetch côté client.
//
// Bug réel du 27/08/2026 — corrigé : cet appel Local API "nu" ne bénéficie
// PAS du filtrage par tenant du plugin (voir `getSelectedTenantId`) ; sans
// le `where` ci-dessous, la sidebar mélangeait les pages de toutes les
// communes.
export default async function AdminNav({ payload }: ServerProps) {
	const tenantId = await getSelectedTenantId();
	const { docs } = await payload.find({
		collection: 'pages',
		sort: 'title',
		limit: 0,
		pagination: false,
		select: { title: true },
		...(tenantId ? { where: { tenant: { equals: tenantId } } } : {})
	});

	const pages = docs.map((p) => ({ id: String(p.id), title: String(p.title) }));

	return <AdminNavClient pages={pages} />;
}
