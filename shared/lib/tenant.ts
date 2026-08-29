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
		// 2026-08-29 — mode mono-tenant (archive livrable) : un seul tenant
		// existe, et l'hôte de la requête n'a de toute façon plus aucune
		// raison de correspondre à son `domaine` d'origine (le repreneur sert
		// l'archive depuis SON propre nom de domaine, pas le nôtre). Repéré
		// en testant l'archive : sans ce court-circuit, la résolution par
		// hôte échouait toujours, et le site retombait silencieusement sur
		// le contenu statique de repli au lieu des vraies données importées.
		if (process.env.SINGLE_TENANT_SLUG) {
			// `headers()` n'est pas utilisé pour la résolution ici (un seul
			// tenant existe, pas besoin de l'hôte) — mais l'appeler reste
			// nécessaire : c'est ce qui déclenche la détection "Dynamic API
			// usage" de Next et empêche la page d'être pré-rendue statique.
			// Sans lui, l'archive mono-tenant est construite (`next build`)
			// AVANT que `scripts/import.ts` ne peuple la base — une page
			// statique fige alors le contenu vide/de repli du moment du build
			// pour toujours, y compris après un import réussi. Repéré en
			// testant l'archive en Docker : la page d'accueil apparaissait en
			// "○ Static" dans le journal de build et resservait le contenu
			// de repli malgré un import terminé avec succès.
			await headers();
			const { docs } = await payload.find({ collection: 'tenants', limit: 1, overrideAccess: true, depth: 0 });
			const tenant = docs[0] as { id?: string | number; domaine?: string; theme?: string } | undefined;
			if (!tenant?.id || !tenant.domaine || !tenant.theme) return null;
			return { id: tenant.id, domaine: tenant.domaine, theme: tenant.theme };
		}

		const host = (await headers()).get('host');
		if (!host) return null;
		// `Tenants.domaine` stocke toujours le nom d'hôte nu (jamais de
		// "www.") — un visiteur qui tape "www.macommune.fr" par habitude (très
		// courant) doit résoudre le même tenant que "macommune.fr", pas
		// tomber sur le thème par défaut faute de correspondance exacte.
		const hostname = host.split(':')[0].replace(/^www\./, '');

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
