import { NextResponse, type NextRequest } from 'next/server';

// Verrouille l'accès à /admin sur le tenant correspondant au domaine utilisé
// pour y accéder — sauf sur `SUPER_ADMIN_DOMAIN`, la console partagée où le
// sélecteur de tenant du plugin reste pleinement fonctionnel.
//
// Incident du 2026-08-27 à l'origine de ce fichier : l'admin était accessible
// (par accident, Next.js ne bloque `/admin` par aucun domaine par défaut) via
// le domaine d'un thème de démo, avec le sélecteur resté sur un autre tenant
// — une modification destinée à une commune est partie sur une autre.
//
// Pourquoi un aller-retour vers `/api/lock-tenant` plutôt qu'une résolution
// directe ici : ce middleware tourne en runtime Edge (le runtime Node, seul
// capable de parler à Postgres via `pg`, n'est disponible pour un middleware
// qu'en activant `experimental.nodeMiddleware` — réservé aux versions canary
// de Next.js, trop risqué à adopter pour ce projet en prod). La résolution
// réelle se fait donc dans une Route Handler (runtime Node par défaut), et ce
// middleware se contente de rediriger vers elle une seule fois par domaine —
// un cookie marqueur (`tenant-locked-host`) évite de refaire l'aller-retour à
// chaque requête une fois le verrouillage posé.
export const config = {
	matcher: ['/admin/:path*']
};

export default function middleware(request: NextRequest) {
	const host = request.headers.get('host')?.split(':')[0] ?? '';
	const superAdminDomain = process.env.SUPER_ADMIN_DOMAIN;

	if (!host || (superAdminDomain && host === superAdminDomain)) {
		return NextResponse.next();
	}

	const lockedHost = request.cookies.get('tenant-locked-host')?.value;
	if (lockedHost === host) {
		return NextResponse.next();
	}

	const lockUrl = new URL('/api/lock-tenant', request.url);
	lockUrl.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search);
	return NextResponse.redirect(lockUrl);
}
