import { NextResponse, type NextRequest } from 'next/server';
import { getPayloadClient } from '@lib/payload';
import { registerScalingoDomain } from '@lib/scalingoDomains';

// Appelé par `admin/CreateTenantButton/Client.tsx` juste après la création
// d'un tenant, pour enregistrer son domaine comme domaine personnalisé de
// l'appli Scalingo -- séparé de la création elle-même (plutôt que fourré
// dans le hook `afterChange` silencieux de `Tenants.ts`, qui gère déjà le
// seed des 18 pages) pour que l'admin voie un retour clair : succès,
// domaine déjà enregistré, ou échec à traiter à la main.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const payload = await getPayloadClient();

	const { user } = await payload.auth({ headers: request.headers });
	if (!user || user.role !== 'super-admin') {
		return NextResponse.json({ status: 'error', message: 'Accès réservé au super-admin.' }, { status: 403 });
	}

	const tenant = await payload
		.findByID({ collection: 'tenants', id, overrideAccess: true, depth: 0 })
		.catch(() => null);
	if (!tenant) {
		return NextResponse.json({ status: 'error', message: 'Site introuvable.' }, { status: 404 });
	}

	const domaine = String(tenant.domaine ?? '');
	if (!domaine) {
		return NextResponse.json({ status: 'error', message: 'Domaine manquant sur cette fiche.' }, { status: 400 });
	}

	const result = await registerScalingoDomain(domaine);
	return NextResponse.json(result, { status: result.status === 'error' ? 502 : 200 });
}
