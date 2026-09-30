import { NextResponse, type NextRequest } from 'next/server';
import { getPayloadClient } from '@lib/payload';
import { getCurrentTenant } from '@shared/lib/tenant';

// Décision 98 (§7, étape 5) — lien de désinscription des futurs envois de la
// lettre d'information : `/api/newsletter/desinscription?jeton=…`. Le jeton
// est propre à chaque abonné et à la commune du domaine de la requête.
function page(titre: string, texte: string, statut = 200) {
	const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${titre}</title>
<style>body{font-family:system-ui,sans-serif;max-width:40rem;margin:4rem auto;padding:0 1rem;line-height:1.6;color:#1a1a2e}a{color:#0b5d56}</style></head>
<body><h1>${titre}</h1><p>${texte}</p><p><a href="/">Retour à l'accueil du site</a></p></body></html>`;
	return new NextResponse(html, { status: statut, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

export async function GET(request: NextRequest) {
	const jeton = request.nextUrl.searchParams.get('jeton') ?? '';
	if (!/^[a-f0-9]{48}$/.test(jeton)) {
		return page('Lien invalide', "Ce lien de désinscription n'est pas valide.", 400);
	}
	const payload = await getPayloadClient();
	const tenant = await getCurrentTenant(payload);
	if (!tenant) return page('Site introuvable', "Ce site n'existe pas.", 404);

	const { docs } = await payload.find({
		collection: 'abonnes-newsletter',
		where: { and: [{ jeton: { equals: jeton } }, { tenant: { equals: tenant.id } }] },
		limit: 1,
		overrideAccess: true
	});
	if (docs[0] && docs[0].statut !== 'desinscrit') {
		await payload.update({
			collection: 'abonnes-newsletter',
			id: docs[0].id,
			data: { statut: 'desinscrit', desinscritLe: new Date().toISOString() } as never,
			overrideAccess: true
		});
	}
	// Même réponse que l'adresse soit inscrite ou non : rien à apprendre ici.
	return page('Désinscription enregistrée', "Vous ne recevrez plus la lettre d'information de la commune.");
}
