import { NextResponse, type NextRequest } from 'next/server';
import { getUserTenantIDs } from '@payloadcms/plugin-multi-tenant/utilities';
import { getPayloadClient } from '@lib/payload';
import { getCurrentTenant } from '@shared/lib/tenant';

// Décision 98 (§7, étape 5) — export CSV des inscrits à la lettre
// d'information, pour la mairie (bouton en tête de la liste des abonnés,
// `admin/AbonnesListHeader`). Réservé à l'admin de la commune et au
// super-admin, pour la commune du domaine de la requête seulement (même
// vérification que `api/preview`).
const cellule = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const date = (v: unknown) => (v ? new Date(String(v)).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }) : '');

export async function GET(request: NextRequest) {
	const payload = await getPayloadClient();
	const { user } = await payload.auth({ headers: request.headers });
	if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
		return NextResponse.json({ message: 'Accès refusé.' }, { status: 403 });
	}
	const tenant = await getCurrentTenant(payload);
	if (!tenant) return NextResponse.json({ message: 'Site introuvable.' }, { status: 404 });
	const aAcces = user.role === 'super-admin' || getUserTenantIDs(user as never).map(String).includes(String(tenant.id));
	if (!aAcces) return NextResponse.json({ message: 'Accès refusé.' }, { status: 403 });

	const { docs } = await payload.find({
		collection: 'abonnes-newsletter',
		where: { tenant: { equals: tenant.id } },
		sort: 'email',
		limit: 0,
		pagination: false,
		overrideAccess: true
	});
	const lignes = [
		['E-mail', 'Statut', 'Consentement donné le', 'Désinscrit le'].map(cellule).join(';'),
		...docs.map((d) =>
			[d.email, d.statut === 'desinscrit' ? 'Désinscrit' : 'Inscrit', date(d.consentementLe), date(d.desinscritLe)].map(cellule).join(';')
		)
	];
	// BOM UTF-8 : Excel ouvre alors les accents correctement.
	return new NextResponse(`﻿${lignes.join('\r\n')}\r\n`, {
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': `attachment; filename="abonnes-lettre-information.csv"`,
			'Cache-Control': 'no-store'
		}
	});
}
