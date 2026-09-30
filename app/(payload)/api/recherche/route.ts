import { NextResponse, type NextRequest } from 'next/server';
import { rechercher } from '@lib/payload';

// Décision 98 (§7, étape 4) — recherche de la popin « Rechercher » (thème
// atelier) : `GET /api/recherche?q=…`. La commune est résolue par le domaine
// de la requête (`getCurrentTenant`, dans `rechercher`), jamais par un
// paramètre : impossible de chercher dans le site d'une autre commune.
// Route placée à côté des autres routes sur-mesure (`lock-tenant`,
// `preview`) : Next.js la préfère au fourre-tout `[...slug]` de Payload.
export async function GET(request: NextRequest) {
	const q = (request.nextUrl.searchParams.get('q') ?? '').slice(0, 100);
	const resultats = await rechercher(q, 8);
	return NextResponse.json({ q, resultats }, { headers: { 'Cache-Control': 'no-store' } });
}
