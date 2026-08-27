import { NextResponse, type NextRequest } from 'next/server';
import { getPayloadClient } from '@lib/payload';

// Contrepartie de `middleware.ts` (runtime Edge, ne peut pas parler à
// Postgres) : ici en Route Handler, runtime Node par défaut, on peut
// utiliser l'API locale Payload pour résoudre le tenant à partir du domaine
// et poser les cookies qui verrouillent l'admin dessus.
export async function GET(request: NextRequest) {
	const host = request.headers.get('host')?.split(':')[0] ?? '';

	// `next` ne doit jamais servir de redirection ouverte : seul un chemin
	// relatif commençant par un unique `/` est accepté.
	const rawNext = request.nextUrl.searchParams.get('next') ?? '/admin';
	const nextPath = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/admin';

	// `request.url`/`request.nextUrl.origin` reflètent l'adresse interne du
	// conteneur derrière le proxy de Scalingo (ex. `localhost:23335`), pas le
	// domaine public — la redirection partirait sur une URL inutilisable pour
	// le navigateur. `x-forwarded-proto`, posé par le proxy, signale qu'on est
	// bien derrière lui ; sans ce header (dev local, pas de proxy), l'origine
	// de la requête elle-même est déjà correcte.
	const forwardedProto = request.headers.get('x-forwarded-proto');
	const origin = forwardedProto ? `${forwardedProto}://${host}` : request.nextUrl.origin;
	const redirectUrl = new URL(nextPath, origin);
	const response = NextResponse.redirect(redirectUrl);

	// Le marqueur encode `<host>::<tenantId>` (ou `::none`) — pas juste le
	// host — pour que `middleware.ts` puisse réimposer ce tenant précis à
	// chaque requête suivante sans nouvel appel base. Voir le commentaire de
	// `middleware.ts` pour la raison (le cookie `payload-tenant` reste
	// modifiable côté client à tout moment).
	let tenantId: string | number | undefined;
	try {
		const payload = await getPayloadClient();
		const { docs } = await payload.find({
			collection: 'tenants',
			where: { domaine: { equals: host } },
			overrideAccess: true,
			depth: 0,
			limit: 1
		});
		const tenant = docs[0] as { id?: string | number } | undefined;
		tenantId = tenant?.id;
	} catch (err) {
		console.warn('[lock-tenant] Résolution du tenant impossible.', err);
	}

	response.cookies.set('tenant-locked-host', `${host}::${tenantId ?? 'none'}`, {
		path: '/',
		sameSite: 'lax'
	});
	if (tenantId !== undefined) {
		response.cookies.set('payload-tenant', String(tenantId), { path: '/', sameSite: 'lax' });
	}

	return response;
}
