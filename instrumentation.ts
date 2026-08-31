// Point d'entrée Sentry côté serveur — appelé automatiquement par Next.js
// au démarrage, avant tout code applicatif (voir instrumentationHook de
// Next.js). Deux runtimes possibles selon où le code s'exécute (route API
// classique vs Edge Middleware) — chacun a sa propre config d'init.
export async function register() {
	if (process.env.NEXT_RUNTIME === 'nodejs') {
		await import('./sentry.server.config');
	}

	if (process.env.NEXT_RUNTIME === 'edge') {
		await import('./sentry.edge.config');
	}
}

export { captureRequestError as onRequestError } from '@sentry/nextjs';
