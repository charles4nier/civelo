// Enregistre automatiquement le domaine d'une commune fraîchement créée
// comme domaine personnalisé de l'appli Scalingo — la partie de
// l'onboarding qui PEUT être automatisée depuis l'API. Le DNS lui-même
// (configuré chez le registraire de la commune) reste hors de portée :
// personne d'autre que la commune ne peut le faire à sa place.
//
// Flux d'authentification Scalingo (https://developers.scalingo.com) :
// un jeton API personnel (généré une fois, à la main, sur
// dashboard.scalingo.com/account/tokens, stocké ici en variable d'env
// `SCALINGO_API_TOKEN`) s'échange contre un jeton "bearer" valable 1h —
// mis en cache en mémoire process, régénéré à l'expiration.
//
// Cible CNAME vérifiée en réel (`dig +short CNAME edito.civelo.fr` ->
// `civelo.osc-fr1.scalingo.io.`) plutôt que déduite de la documentation
// seule. Un domaine racine/apex (le cas le plus courant pour une commune,
// ex. "saint-hilaire-bonneval.fr") ne peut pas toujours recevoir un CNAME
// selon le registraire — voir le message renvoyé à l'admin.

const APP_NAME = process.env.SCALINGO_APP_NAME || 'civelo';
const REGION_API_BASE = 'https://api.osc-fr1.scalingo.com/v1';
const AUTH_EXCHANGE_URL = 'https://auth.scalingo.com/v1/tokens/exchange';

export const SCALINGO_CNAME_TARGET = `${APP_NAME}.osc-fr1.scalingo.io`;

let cachedBearer: { token: string; expiresAt: number } | null = null;

async function getBearerToken(): Promise<string> {
	const apiToken = process.env.SCALINGO_API_TOKEN;
	if (!apiToken) {
		throw new Error('SCALINGO_API_TOKEN non configuré.');
	}
	if (cachedBearer && cachedBearer.expiresAt > Date.now()) {
		return cachedBearer.token;
	}
	const res = await fetch(AUTH_EXCHANGE_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			// Basic Auth avec un nom d'utilisateur vide, le jeton en mot de
			// passe -- flux documenté par Scalingo pour l'échange jeton
			// personnel -> bearer.
			Authorization: `Basic ${Buffer.from(`:${apiToken}`).toString('base64')}`
		}
	});
	if (!res.ok) {
		throw new Error(`Échange du jeton Scalingo échoué (HTTP ${res.status}).`);
	}
	const data = (await res.json()) as { token?: string };
	if (!data.token) {
		throw new Error('Réponse Scalingo sans jeton.');
	}
	// Valable 1h côté Scalingo -- on se garde 5 minutes de marge avant de
	// le considérer expiré.
	cachedBearer = { token: data.token, expiresAt: Date.now() + 55 * 60 * 1000 };
	return data.token;
}

export type RegisterDomainResult =
	| { status: 'created'; cnameTarget: string }
	| { status: 'already-exists'; cnameTarget: string }
	| { status: 'not-configured' }
	| { status: 'error'; message: string };

export async function registerScalingoDomain(domaine: string): Promise<RegisterDomainResult> {
	if (!process.env.SCALINGO_API_TOKEN) {
		return { status: 'not-configured' };
	}
	try {
		const bearer = await getBearerToken();
		const res = await fetch(`${REGION_API_BASE}/apps/${APP_NAME}/domains`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
				Authorization: `Bearer ${bearer}`
			},
			body: JSON.stringify({ domain: { name: domaine } })
		});

		if (res.status === 201) {
			return { status: 'created', cnameTarget: SCALINGO_CNAME_TARGET };
		}

		const data = await res.json().catch(() => null);
		const rawMessage = JSON.stringify(data?.errors ?? data ?? `HTTP ${res.status}`);
		if (res.status === 422 && /already|exist|unique/i.test(rawMessage)) {
			return { status: 'already-exists', cnameTarget: SCALINGO_CNAME_TARGET };
		}
		return { status: 'error', message: rawMessage.slice(0, 300) };
	} catch (err) {
		return { status: 'error', message: err instanceof Error ? err.message : String(err) };
	}
}
