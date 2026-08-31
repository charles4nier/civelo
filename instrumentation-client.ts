import * as Sentry from '@sentry/nextjs';

// DSN pas sensible (fait pour être exposé côté client, voir doc Sentry) —
// var d'env `NEXT_PUBLIC_*` volontaire pour qu'elle soit bien incluse dans
// le bundle navigateur.
Sentry.init({
	dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
	// 100% en dev (site à faible trafic pour l'instant, utile pour tout
	// voir pendant qu'on met ça en place) ; à réduire si le volume grossit
	// avec plus de communes actives.
	tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
	integrations: [Sentry.replayIntegration()],
	replaysSessionSampleRate: 0.1,
	replaysOnErrorSampleRate: 1.0
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
