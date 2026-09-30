import { randomBytes } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { getPayloadClient } from '@lib/payload';
import { getCurrentTenant } from '@shared/lib/tenant';

// Décision 98 (§7, étape 5) — inscription à la lettre d'information de la
// commune (popin « S'inscrire à la newsletter », thème atelier). La commune
// est celle du domaine de la requête, jamais un paramètre. Consentement
// explicite obligatoire (case à cocher) ; champ piège `site` (invisible pour
// un humain) contre les robots. Une adresse déjà inscrite ou désinscrite
// est réactivée avec un nouveau consentement, sans doublon.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: NextRequest) {
	const corps = (await request.json().catch(() => null)) as { email?: unknown; consentement?: unknown; site?: unknown } | null;
	const email = typeof corps?.email === 'string' ? corps.email.trim().toLowerCase() : '';

	// Robot : on répond comme si tout allait bien, sans rien enregistrer.
	if (corps?.site) return NextResponse.json({ ok: true });
	if (!EMAIL.test(email) || email.length > 254) {
		return NextResponse.json({ ok: false, message: "L'adresse e-mail ne semble pas valide." }, { status: 400 });
	}
	if (corps?.consentement !== true) {
		return NextResponse.json({ ok: false, message: 'Cochez la case pour accepter de recevoir la lettre.' }, { status: 400 });
	}

	const payload = await getPayloadClient();
	const tenant = await getCurrentTenant(payload);
	if (!tenant) return NextResponse.json({ ok: false, message: 'Site introuvable.' }, { status: 404 });

	const maintenant = new Date().toISOString();
	const { docs } = await payload.find({
		collection: 'abonnes-newsletter',
		where: { and: [{ email: { equals: email } }, { tenant: { equals: tenant.id } }] },
		limit: 1,
		overrideAccess: true
	});
	if (docs[0]) {
		await payload.update({
			collection: 'abonnes-newsletter',
			id: docs[0].id,
			data: { statut: 'actif', consentementLe: maintenant, desinscritLe: null } as never,
			overrideAccess: true
		});
	} else {
		await payload.create({
			collection: 'abonnes-newsletter',
			data: {
				email,
				statut: 'actif',
				consentementLe: maintenant,
				jeton: randomBytes(24).toString('hex'),
				tenant: tenant.id
			} as never,
			overrideAccess: true
		});
	}
	return NextResponse.json({ ok: true, message: "Merci, votre inscription est bien enregistrée." });
}
