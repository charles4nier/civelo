import { NextResponse, type NextRequest } from 'next/server';
import { draftMode } from 'next/headers';

// "Quitter l'aperçu" (bandeau posé par `app/(frontend)/layout.tsx` pendant
// un aperçu de brouillon, roadmap 2026-09-14).
export async function GET(request: NextRequest) {
	(await draftMode()).disable();

	// Même piège que `api/preview/route.ts`/`api/lock-tenant/route.ts` :
	// `request.url` reflète l'adresse interne du conteneur derrière le proxy
	// de Scalingo, pas le domaine public.
	const host = request.headers.get('host') ?? '';
	const forwardedProto = request.headers.get('x-forwarded-proto');
	const origin = forwardedProto ? `${forwardedProto}://${host}` : request.nextUrl.origin;
	return NextResponse.redirect(new URL('/', origin));
}
