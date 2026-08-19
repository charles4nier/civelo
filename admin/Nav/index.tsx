import type { ServerProps } from 'payload';
import AdminNavClient from './Client';

// Décision 43/46 — sidebar sur-mesure. Server Component (reçoit `payload`
// via les ServerProps que Payload injecte automatiquement dans les
// composants admin custom) : va chercher la vraie liste des pages une fois,
// côté serveur, plutôt que de la coder en dur ou de la refetch côté client.
export default async function AdminNav({ payload }: ServerProps) {
	const { docs } = await payload.find({
		collection: 'pages',
		sort: 'title',
		limit: 0,
		pagination: false,
		select: { title: true }
	});

	const pages = docs.map((p) => ({ id: String(p.id), title: String(p.title) }));

	return <AdminNavClient pages={pages} />;
}
