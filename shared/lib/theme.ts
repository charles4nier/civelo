import { cache } from 'react';
import type { Payload } from 'payload';
import { getCurrentTenant } from './tenant';

// Le thème est un attribut du tenant (`Tenants.theme`) — 2 existent
// aujourd'hui (`edito`, `app`), le 3e (ex-style-ludique) suivra le même
// principe. Chaque route/layout appelle `getCurrentTheme()` puis choisit le
// bon composant via `pickTheme()` — un registre explicite par route plutôt
// qu'un import dynamique par chaîne (non analysable statiquement par
// Webpack), qui de plus est vérifié par le compilateur : ajouter un
// `ThemeName` fait échouer la compilation de toute route qui ne lui a pas
// encore donné de composant.
export type ThemeName = 'edito' | 'app';
export const DEFAULT_THEME: ThemeName = 'edito';

export const getCurrentTheme = cache(async (payload: Payload): Promise<ThemeName> => {
	const tenant = await getCurrentTenant(payload);
	return (tenant?.theme as ThemeName | undefined) ?? DEFAULT_THEME;
});

export function pickTheme<T>(theme: ThemeName, modules: Record<ThemeName, T>): T {
	return modules[theme];
}
