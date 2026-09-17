import type { Metadata, Viewport } from 'next';
import { draftMode } from 'next/headers';
import { defaultMetadata } from '@themes/atelier/config/seo';
import AtelierRootLayout from '@themes/atelier/RootLayout';
import PreauRootLayout from '@themes/preau/RootLayout';
import BelvedereRootLayout from '@themes/belvedere/RootLayout';
import ClocherRootLayout from '@themes/clocher/RootLayout';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import PreviewBanner from '@shared/components/PreviewBanner';
import { getNavLinks, getIdentiteData, getBoutonEnteteData, getFooterData, getPayloadClient } from '../../lib/payload';

// Layout racine (`<html>`/`<body>`) — un seul existe dans l'app, il n'y a
// pas de `app/layout.tsx` au-dessus. Ne contient plus lui-même de rendu
// spécifique à un thème (polices, Header/Footer, import CSS global) : ça
// vit désormais dans le `RootLayout` de chaque thème
// (`themes/<theme>/RootLayout.tsx`), choisi ici via `pickTheme()` selon le
// thème du tenant résolu par domaine.
//
// Métadonnées par défaut encore prises directement dans la config SEO de
// l'Atelier (pas de dispatch par thème) — un SEO réellement multi-thème
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
	const [theme, navLinks, identite, boutonEntete, footer, isPreviewing] = await Promise.all([
		getCurrentTheme(payload),
		getNavLinks(),
		getIdentiteData(),
		getBoutonEnteteData(),
		getFooterData(),
		draftMode().then((d) => d.isEnabled)
	]);

	const RootLayout = pickTheme(theme, {
		atelier: AtelierRootLayout,
		preau: PreauRootLayout,
		belvedere: BelvedereRootLayout,
		clocher: ClocherRootLayout
	});

	return (
		<RootLayout navLinks={navLinks} identite={identite} boutonEntete={boutonEntete} footer={footer}>
			{isPreviewing && <PreviewBanner />}
			{children}
		</RootLayout>
	);
}
