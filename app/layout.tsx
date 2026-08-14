import { Caveat, Cormorant } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import { defaultMetadata } from '@shared/config/seo';

import '@shared/styles/index.scss';

import Header from '@shared/components/Header';
import Footer from '@shared/components/Footer';
import FloatingButtons from '@shared/components/FloatingButtons';
import { getNavLinks } from '../lib/payload';

const cormorant = Cormorant({
	subsets: ['latin'],
	weight: ['400', '500', '600', '700'],
	style: ['normal', 'italic'],
	variable: '--font-script',
	display: 'swap',
	preload: false
});

const caveat = Caveat({
	subsets: ['latin'],
	weight: ['500', '600', '700'],
	variable: '--font-caveat',
	display: 'swap',
	preload: false
});

export const metadata: Metadata = defaultMetadata;

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	viewportFit: 'cover',
	colorScheme: 'light'
};

export default async function Layout({ children }: { children: React.ReactNode }) {
	const navLinks = await getNavLinks();

	return (
		<html lang="fr" className={`${cormorant.variable} ${caveat.variable}`}>
			<body>
				<nav className="skip-links" aria-label="Liens d'évitement">
					<a href="#contenu" className="skip-link">
						Aller au contenu principal
					</a>
					<a href="#actions-rapides" className="skip-link">
						Accéder aux actions rapides
					</a>
				</nav>
				<Header navLinks={navLinks} />
				<main id="contenu" tabIndex={-1}>
					{children}
				</main>
				<Footer />
				<FloatingButtons />
			</body>
		</html>
	);
}
