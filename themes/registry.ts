import type { ReactNode } from 'react';
import type { getNavLinks, getIdentiteData, getBoutonEnteteData, getFooterData } from '../lib/payload';

// Contrat que le `RootLayout` de chaque thème doit respecter — le layout
// racine (`app/(frontend)/layout.tsx`) résout les données une seule fois
// (indépendamment du thème) et les transmet au `RootLayout` du thème
// choisi via `pickTheme()` (`@shared/lib/theme`).
export type RootLayoutProps = {
	navLinks: Awaited<ReturnType<typeof getNavLinks>>;
	identite: Awaited<ReturnType<typeof getIdentiteData>>;
	boutonEntete: Awaited<ReturnType<typeof getBoutonEnteteData>>;
	footer: Awaited<ReturnType<typeof getFooterData>>;
	children: ReactNode;
};
