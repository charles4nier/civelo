import { Roboto } from 'next/font/google';
import '@themes/atelier/styles/index.scss';

import Header from '@themes/atelier/components/Header';
import Footer from '@themes/atelier/components/Footer';
import FloatingButtons from '@themes/atelier/components/FloatingButtons';
import type { RootLayoutProps } from '../registry';

// Police unique pour tout le thème (voir styles/variables.scss) — sans-serif
// épuré façon metropole.toulouse.fr, qui utilise Roboto partout.
const roboto = Roboto({
	subsets: ['latin'],
	weight: ['400', '500', '700', '900'],
	variable: '--font-atelier',
	display: 'swap'
});

export default function RootLayout({ navLinks, identite, boutonEntete, footer, children }: RootLayoutProps) {
	return (
		<html lang="fr" className={`theme-atelier ${roboto.variable}`}>
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
				<Footer identite={identite} navLinks={navLinks} data={footer} />
				<FloatingButtons />
			</body>
		</html>
	);
}
