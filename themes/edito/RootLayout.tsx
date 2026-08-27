import { Caveat, Cormorant } from 'next/font/google';
import '@themes/edito/styles/index.scss';

import Header from '@themes/edito/components/Header';
import Footer from '@themes/edito/components/Footer';
import FloatingButtons from '@themes/edito/components/FloatingButtons';
import type { RootLayoutProps } from '../registry';

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

export default function RootLayout({ navLinks, identite, boutonEntete, footer, children }: RootLayoutProps) {
	return (
		<html lang="fr" className={`theme-edito ${cormorant.variable} ${caveat.variable}`}>
			<body>
				<nav className="skip-links" aria-label="Liens d'évitement">
					<a href="#contenu" className="skip-link">
						Aller au contenu principal
					</a>
					<a href="#actions-rapides" className="skip-link">
						Accéder aux actions rapides
					</a>
				</nav>
				<Header navLinks={navLinks} identite={identite} bouton={boutonEntete} />
				<main id="contenu" tabIndex={-1}>
					{children}
				</main>
				<Footer identite={identite} data={footer} />
				<FloatingButtons />
			</body>
		</html>
	);
}
