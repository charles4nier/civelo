import type { Metadata, Viewport } from 'next';
import { defaultMetadata } from '@themes/edito/config/seo';
import StyleEditoRootLayout from '@themes/edito/RootLayout';
import ModerneRootLayout from '@themes/moderne/RootLayout';
import AccueillantRootLayout from '@themes/accueillant/RootLayout';
import ClassiqueRootLayout from '@themes/classique/RootLayout';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import { getNavLinks, getIdentiteData, getBoutonEnteteData, getFooterData, getPayloadClient } from '../../lib/payload';

// Layout racine (`<html>`/`<body>`) — un seul existe dans l'app, il n'y a
// pas de `app/layout.tsx` au-dessus. Ne contient plus lui-même de rendu
// spécifique à un thème (polices, Header/Footer, import CSS global) : ça
// vit désormais dans le `RootLayout` de chaque thème
// (`themes/<theme>/RootLayout.tsx`), choisi ici via `pickTheme()` selon le
// thème du tenant résolu par domaine.
//
// Métadonnées par défaut encore prises directement dans la config SEO de
// edito (pas de dispatch par thème) — un SEO réellement multi-thème
// nécessiterait un `generateMetadata` async résolvant le tenant, hors
// périmètre de cette extraction.
export const metadata: Metadata = defaultMetadata;

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	viewportFit: 'cover',
	colorScheme: 'light'
};

export default async function Layout({ children }: { children: React.ReactNode }) {
	const payload = await getPayloadClient();
	const [theme, navLinks, identite, boutonEntete, footer] = await Promise.all([
		getCurrentTheme(payload),
		getNavLinks(),
		getIdentiteData(),
		getBoutonEnteteData(),
		getFooterData()
	]);

	const RootLayout = pickTheme(theme, {
		edito: StyleEditoRootLayout,
		moderne: ModerneRootLayout,
		accueillant: AccueillantRootLayout,
		classique: ClassiqueRootLayout
	});

	return (
		<RootLayout navLinks={navLinks} identite={identite} boutonEntete={boutonEntete} footer={footer}>
			{children}
		</RootLayout>
	);
}
