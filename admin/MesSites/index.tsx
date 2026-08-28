import type { ServerProps } from 'payload';
import { headers as getHeaders } from 'next/headers';
import { isTenantLocked } from '../lib/getSelectedTenantId';
import MesSitesClient from './Client';
import './style.scss';

// Vue super-admin dédiée (`payload.config.ts`, `admin.components.views.mesSites`,
// route `/admin/mes-sites`) — liste toutes les communes en cartes cliquables,
// une ouverture = bascule le tenant actif puis va droit sur ses pages.
//
// `user` de `ServerProps` n'est PAS peuplé ici — vérifié en local (log de
// debug) : ce prop n'arrive correctement que sur les vues réservées
// (`dashboard`, `account`), pas sur une vue custom générique comme celle-ci
// (chemin de rendu différent côté `@payloadcms/next`, `Root/index.js`).
// `payload.auth({ headers })` (API Local documentée) résout l'utilisateur
// réel depuis les cookies de la requête, indépendamment de ce mécanisme.
//
// Garde en double, même raison que `CreateTenantButton`/le lien "Communes"
// de la nav (bug du 27/08/2026, voir `getSelectedTenantId`) : le rôle seul
// ne suffit pas, un super-admin verrouillé sur le domaine d'une commune
// reste super-admin. Cette route étant accessible par URL directe (pas
// seulement via le lien de nav, lui-même déjà masqué), la garde doit vivre
// ICI, pas seulement dans la nav.
export default async function MesSites({ payload }: ServerProps) {
	const [{ user }, locked] = await Promise.all([payload.auth({ headers: await getHeaders() }), isTenantLocked()]);
	const isSuperAdminConsole = user?.role === 'super-admin' && !locked;

	if (!isSuperAdminConsole) {
		return (
			<div className="mes-sites">
				<p className="mes-sites__denied">Cette page est réservée à la console super-admin.</p>
			</div>
		);
	}

	// `overrideAccess` — le filtrage par tenant du plugin multi-tenant n'est
	// câblé que sur la vue liste native (`/admin/collections/tenants`),
	// jamais sur un appel Local API direct comme celui-ci (même bug que
	// `admin/Nav`/`admin/Dashboard`). Sans risque ici : l'autorisation vient
	// d'être vérifiée explicitement ci-dessus, cette route n'affiche cette
	// liste qu'à un super-admin sur la console dédiée.
	const { docs } = await payload.find({
		collection: 'tenants',
		limit: 0,
		pagination: false,
		sort: 'nom',
		depth: 0,
		overrideAccess: true
	});

	const tenants = (docs as any[]).map((t) => ({
		id: String(t.id),
		nom: t.nom as string,
		domaine: t.domaine as string,
		theme: t.theme as string,
		statutContrat: t.statutContrat as string
	}));

	return <MesSitesClient tenants={tenants} />;
}
