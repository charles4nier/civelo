import { NextResponse, type NextRequest } from 'next/server';
import { draftMode } from 'next/headers';
import { jwtVerify } from 'jose';
import { getUserTenantIDs } from '@payloadcms/plugin-multi-tenant/utilities';
import { getPayloadClient } from '@lib/payload';
import { getCurrentTenant } from '@shared/lib/tenant';

// Bouton "Aperçu" de `collections/Pages.ts` (mode brouillon, roadmap
// 2026-09-14) — ouvre le VRAI domaine de la commune, en Next.js Draft Mode.
// Le jeton reçu ici est dédié à cet usage (signé par `generatePreviewURL`
// dans `Pages.ts`, expire en 2 minutes), jamais le JWT de session complet
// (2h par défaut) — pour limiter la casse si ce lien fuite (logs d'accès,
// copié-collé...). On ne fait confiance à rien de ce qu'il contient au-delà
// de sa fraîcheur : l'utilisateur et le tenant sont rechargés et revérifiés
// ici, pas déduits du jeton.
export async function GET(request: NextRequest) {
	const { searchParams } = request.nextUrl;
	const token = searchParams.get('token');
	const path = searchParams.get('path');

	if (!token || !path || !path.startsWith('/')) {
		return NextResponse.json({ message: 'Requête de prévisualisation invalide.' }, { status: 400 });
	}

	const secret = process.env.PAYLOAD_SECRET;
	if (!secret) {
		return NextResponse.json({ message: 'Prévisualisation indisponible.' }, { status: 500 });
	}

	let pageId: unknown;
	let userId: unknown;
	try {
		const { payload: claims } = await jwtVerify(token, new TextEncoder().encode(secret));
		pageId = claims.pageId;
		userId = claims.userId;
	} catch {
		return NextResponse.json({ message: 'Lien de prévisualisation expiré ou invalide.' }, { status: 401 });
	}
	if (!pageId || !userId) {
		return NextResponse.json({ message: 'Lien de prévisualisation invalide.' }, { status: 401 });
	}

	const payload = await getPayloadClient();

	const user = await payload
		.findByID({ collection: 'users', id: userId as number | string, overrideAccess: true, depth: 0 })
		.catch(() => null);
	if (!user) {
		return NextResponse.json({ message: 'Utilisateur introuvable.' }, { status: 401 });
	}

	// Le tenant est résolu par le DOMAINE de cette requête, pas par une
	// valeur soumise par le client — c'est ce qui garantit qu'un lien généré
	// pour la commune A ne peut jamais servir à voir un brouillon de la
	// commune B, même si l'id de page était deviné/réutilisé.
	const tenant = await getCurrentTenant(payload);
	if (!tenant) {
		return NextResponse.json({ message: 'Site introuvable.' }, { status: 404 });
	}

	const page = await payload
		.findByID({ collection: 'pages', id: pageId as number | string, draft: true, overrideAccess: true, depth: 0 })
		.catch(() => null);
	if (!page) {
		return NextResponse.json({ message: 'Page introuvable.' }, { status: 404 });
	}

	const pageTenantId = typeof page.tenant === 'object' && page.tenant !== null ? (page.tenant as { id?: unknown }).id : page.tenant;
	if (String(pageTenantId) !== String(tenant.id)) {
		return NextResponse.json({ message: 'Page introuvable pour ce site.' }, { status: 404 });
	}

	const hasAccess =
		user.role === 'super-admin' || getUserTenantIDs(user as never).map(String).includes(String(tenant.id));
	if (!hasAccess) {
		return NextResponse.json({ message: 'Accès refusé.' }, { status: 403 });
	}

	(await draftMode()).enable();
	return NextResponse.redirect(new URL(path, request.url));
}
