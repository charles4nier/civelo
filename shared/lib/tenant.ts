import { cache } from 'react';
import { headers } from 'next/headers';
import type { Payload } from 'payload';

// Étape 8 du plan multi-tenant — résolution du tenant par domaine, sans
// réécriture d'URL (`middleware.ts`/`rewrites()`) : chaque commune a déjà
// son propre domaine, pas besoin d'un segment `/commune-a/...` partagé.
// `host` est disponible sur toute requête sans configuration
// supplémentaire.
//
// Prend le client Payload en paramètre plutôt que de le récupérer ici
// (`getPayloadClient()`, dans `lib/payload.ts`) pour éviter un import
// circulaire — chaque fonction de `lib/payload.ts` a déjà `const payload =
// await getPayloadClient()` en première ligne, lui passer cette même
// instance ne coûte rien de plus.
//
// `cache()` (React) déduplique les appels sur une même requête — le layout
// à lui seul fait déjà 4 lectures qui en dépendront toutes.
export type CurrentTenant = { id: string | number; domaine: string; theme: string };

export const getCurrentTenant = cache(async (payload: Payload): Promise<CurrentTenant | null> => {
	try {
		const host = (await headers()).get('host');
		if (!host) return null;
		const hostname = host.split(':')[0];

		const { docs } = await payload.find({
			collection: 'tenants',
			where: { domaine: { equals: hostname } },
			// Résolution serveur, avant toute authentification — ce n'est ni
			// un rendu public sensible (aucune donnée de `tenants` n'est
			// exposée telle quelle) ni un contexte avec un utilisateur
			// connecté à qui déléguer l'accès.
			overrideAccess: true,
			depth: 0,
			limit: 1
		});

		const tenant = docs[0] as { id?: string | number; domaine?: string; theme?: string } | undefined;
		if (!tenant?.id || !tenant.domaine || !tenant.theme) return null;

		return { id: tenant.id, domaine: tenant.domaine, theme: tenant.theme };
	} catch (err) {
		console.warn('[tenant] getCurrentTenant() : résolution impossible.', err);
		return null;
	}
});
