import { NextResponse, type NextRequest } from 'next/server';
import { draftMode } from 'next/headers';

// "Quitter l'aperçu" (bandeau posé par `app/(frontend)/layout.tsx` pendant
// un aperçu de brouillon, roadmap 2026-09-14).
export async function GET(request: NextRequest) {
	(await draftMode()).disable();
	return NextResponse.redirect(new URL('/', request.url));
}
