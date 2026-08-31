'use client';

import * as Sentry from '@sentry/nextjs';
import NextError from 'next/error';
import { useEffect } from 'react';

// Filet de sécurité tout en haut de l'arbre — capture une erreur qui
// échapperait aux `error.tsx` locaux de chaque groupe de routes
// ((frontend)/(payload)), le seul cas où Next.js n'a plus d'UI à lui pour
// afficher quoi que ce soit d'autre qu'une page d'erreur générique.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
	useEffect(() => {
		Sentry.captureException(error);
	}, [error]);

	return (
		<html>
			<body>
				<NextError statusCode={0} />
			</body>
		</html>
	);
}
