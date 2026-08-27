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
// réelle se fait donc dans une Route Handler (runtime Node par défaut).
//
// Le cookie marqueur `tenant-locked-host` encode `<host>::<tenantId>` (ou
// `<host>::none` si aucun tenant ne correspond à ce domaine) — pas juste le
// host — pour une raison précise, découverte le 27/08/2026 : une fois le
// marqueur posé, le simple fait qu'il corresponde au host ne garantit rien
// sur l'état RÉEL du cookie `payload-tenant`, qui reste modifiable côté
// client à tout moment (le sélecteur du plugin, encore affiché même verrouillé,
// écrit directement `document.cookie` ; un logout le supprime aussi). Sans
// réimposer le tenant verrouillé à CHAQUE requête, le verrouillage ne tenait
// que jusqu'au premier clic sur le sélecteur ou la première déconnexion —
// exactement le bug signalé ("app.civelo voit toujours le même bo que
// edito.civelo"). La réimposition se fait ici, en pure logique cookie, sans
// appel base : seule la toute première résolution par domaine passe par
// `/api/lock-tenant`.
export const config = {
	matcher: ['/admin/:path*']
};

export default function middleware(request: NextRequest) {
	const host = request.headers.get('host')?.split(':')[0] ?? '';
	const superAdminDomain = process.env.SUPER_ADMIN_DOMAIN;

	if (!host || (superAdminDomain && host === superAdminDomain)) {
		return NextResponse.next();
	}

	const marker = request.cookies.get('tenant-locked-host')?.value ?? '';
	const separatorIndex = marker.lastIndexOf('::');
	const markerHost = separatorIndex === -1 ? '' : marker.slice(0, separatorIndex);
	const markerTenantId = separatorIndex === -1 ? '' : marker.slice(separatorIndex + 2);

	if (markerHost !== host || !markerTenantId) {
		const lockUrl = new URL('/api/lock-tenant', request.url);
		lockUrl.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search);
		return NextResponse.redirect(lockUrl);
	}

	// `none` : domaine sans tenant correspondant (pas encore provisionné) —
	// rien à imposer, l'admin se comporte normalement (non verrouillé).
	if (markerTenantId === 'none') {
		return NextResponse.next();
	}

	if (request.cookies.get('payload-tenant')?.value === markerTenantId) {
		return NextResponse.next();
	}

	const response = NextResponse.next();
	response.cookies.set('payload-tenant', markerTenantId, {
		path: '/',
		sameSite: 'lax'
	});
	return response;
}
