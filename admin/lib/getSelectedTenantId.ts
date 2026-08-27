import { cookies } from 'next/headers';

// Bug réel du 27/08/2026 : plusieurs composants admin sur-mesure
// (`admin/Nav`, `admin/Dashboard`) appellent `payload.find(...)` directement
// via les `ServerProps` en supposant que le filtrage par tenant du plugin
// multi-tenant (`baseFilter`/`useBaseFilter`) s'applique automatiquement à
// cet appel — FAUX, vérifié dans le code source du plugin
// (`filterDocumentsByTenants`) : ce filtre n'est câblé QUE sur la vue liste
// native de l'admin (`/admin/collections/pages`), jamais sur un appel Local
// API "nu", même effectué depuis un composant admin authentifié. Résultat
// observé : la sidebar "Mes pages" affichait les pages des 3 communes de
// démo mélangées (captures d'écran à l'appui — "Accueil" ×3, "Actualités"
// ×3...), et le tableau de bord risquait pire — un raccourci "Nouvelle
// actualité" pouvait pointer vers la page d'une AUTRE commune.
//
// Ce helper lit le même cookie que le plugin (`payload-tenant`, verrouillé
// par domaine depuis `middleware.ts`) pour que ces composants puissent
// filtrer eux-mêmes leurs requêtes — `undefined` si absent (domaine
// super-admin sans tenant sélectionné : ces composants doivent alors, comme
// le fait le plugin dans ce cas précis, ne rien filtrer).
export async function getSelectedTenantId(): Promise<string | undefined> {
	const store = await cookies();
	return store.get('payload-tenant')?.value || undefined;
}

// Vrai uniquement sur un domaine verrouillé par `middleware.ts` (jamais posé
// sur `SUPER_ADMIN_DOMAIN`, la seule exception où le middleware ne touche
// pas à ce cookie) — sert à masquer le sélecteur de tenant du plugin sur les
// domaines des vraies communes : il resterait sinon affiché (juste sans
// effet, `middleware.ts` reverrouille à chaque requête suivante), listant au
// passage le nom des autres communes dans son menu déroulant.
export async function isTenantLocked(): Promise<boolean> {
	const store = await cookies();
	const marker = store.get('tenant-locked-host')?.value ?? '';
	return marker !== '' && !marker.endsWith('::none');
}
