import type { ServerProps } from 'payload';
import AdminNavClient from './Client';
import { getSelectedTenantId, isTenantLocked } from '../lib/getSelectedTenantId';

// Décision 43/46 — sidebar sur-mesure. Server Component (reçoit `payload`
// via les ServerProps que Payload injecte automatiquement dans les
// composants admin custom) : va chercher la vraie liste des pages une fois,
// côté serveur, plutôt que de la coder en dur ou de la refetch côté client.
//
// Bug réel du 27/08/2026 — corrigé : cet appel Local API "nu" ne bénéficie
// PAS du filtrage par tenant du plugin (voir `getSelectedTenantId`) ; sans
// le `where` ci-dessous, la sidebar mélangeait les pages de toutes les
// communes.
//
// Même 27/08/2026 — le badge de marque en haut de la sidebar ("SH / Saint-
// Hilaire") était resté du texte en dur depuis l'époque mono-tenant,
// jamais mis à jour lors de la bascule multi-tenant : repéré en testant
// app.civelo.fr (verrouillé sur le tenant "App"), qui affichait quand même
// "Saint-Hilaire". Résolu ici en allant chercher le vrai nom du tenant
// verrouillé.
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

	const hideTenantSelector = await isTenantLocked();

	// Résolu dès qu'un tenant est sélectionné (verrouillé OU choisi depuis
	// "Mes sites" sur la console super-admin) — c'est au CLIENT de décider
	// s'il faut l'afficher ou retomber sur "Civelo Admin" (voir
	// `Client.tsx` : sur la racine `/admin`, toujours "Mes sites"/"Civelo
	// Admin" même si le cookie a persisté, pour ne pas reproduire le bug du
	// 28/08 où rester sur "Commune A" après être revenu sur "Mes sites").
	let siteName = 'Civelo Admin';
	if (tenantId) {
		try {
			const tenant = await payload.findByID({ collection: 'tenants', id: tenantId, depth: 0 });
			if (tenant?.nom) siteName = String(tenant.nom);
		} catch {
			// Tenant introuvable (id invalide/périmé) — repli sur "Civelo Admin".
		}
	}

	return (
		<AdminNavClient pages={pages} siteName={siteName} hideTenantSelector={hideTenantSelector} tenantId={tenantId ?? null} />
	);
}
