import type { PayloadRequest } from 'payload';
import { SignJWT } from 'jose';

// Mode brouillon/preview (roadmap 2026-09-14), sorti de `Pages.ts` pour
// servir aussi aux fiches (décision 98). Le bouton "Aperçu" doit ouvrir le
// VRAI domaine de la commune, en Next.js Draft Mode. Le `token` que Payload
// propose de base est le JWT de session (valide 2h par défaut, cf.
// `payload/dist/collections/config/defaults.js`) — trop puissant à faire
// transiter dans une URL (donnerait un accès complet à l'API à quiconque
// l'intercepterait), quelle que soit sa durée. On signe donc ici un jeton
// dédié, minimal (juste la collection, l'id du document et de
// l'utilisateur, rien d'autre) — revérifié intégralement côté serveur par
// `app/(payload)/api/preview` (jamais fait confiance à ces seules données,
// juste à leur fraîcheur).
// Expire en 1h, pas 2 minutes comme au premier jet : ce lien est généré au
// CHARGEMENT de la page d'édition (`admin.preview` s'exécute au rendu de la
// vue, pas au clic sur le bouton — vérifié dans le code de Payload) donc une
// expiration trop courte rendait le bouton inutilisable dès qu'on passait
// plus de 2 minutes à éditer avant de cliquer (signalé le 2026-09-16). Une
// heure reste très supérieure au risque : ce jeton ne permet RIEN d'autre que
// voir CE document précis en brouillon, contrairement au JWT de session.
export type PreviewCollection = 'pages' | 'fiches';

export async function buildPreviewURL({
	req,
	collection,
	docId,
	tenant,
	path
}: {
	req: PayloadRequest;
	collection: PreviewCollection;
	docId: unknown;
	tenant: { domaine?: string; id?: unknown } | number | string | null | undefined;
	path: string;
}): Promise<string | null> {
	if (!docId || !req.user) return null;

	const tenantId = typeof tenant === 'object' && tenant !== null ? tenant.id : tenant;
	if (!tenantId) return null;

	let domaine = typeof tenant === 'object' && tenant !== null ? tenant.domaine : undefined;
	if (!domaine) {
		const tenantDoc = await req.payload
			.findByID({ collection: 'tenants', id: tenantId as number | string, overrideAccess: true })
			.catch(() => null);
		domaine = tenantDoc?.domaine as string | undefined;
	}
	if (!domaine) return null;

	const secret = process.env.PAYLOAD_SECRET;
	if (!secret) return null;

	const token = await new SignJWT({ collection, docId, purpose: 'preview', userId: req.user.id })
		.setProtectedHeader({ alg: 'HS256' })
		.setExpirationTime('1h')
		.sign(new TextEncoder().encode(secret));

	return `https://${domaine}/api/preview?token=${encodeURIComponent(token)}&path=${encodeURIComponent(path)}`;
}
