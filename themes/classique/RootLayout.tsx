import { Plus_Jakarta_Sans } from 'next/font/google';
import '@themes/classique/styles/index.scss';

import Header from '@themes/classique/components/Header';
import Footer from '@themes/classique/components/Footer';
import type { RootLayoutProps } from '../registry';

// Une seule police pour tout le thème (voir styles/variables.scss) — pas de
// duo serif/script comme les autres thèmes, cohérent avec la direction
// "épuré/intemporel".
const plusJakartaSans = Plus_Jakarta_Sans({
	subsets: ['latin'],
	weight: ['400', '500', '600', '700', '800'],
	variable: '--font-classique',
	display: 'swap'
});

export default function RootLayout({ navLinks, identite, boutonEntete, footer, children }: RootLayoutProps) {
	return (
		<html lang="fr" className={`theme-classique ${plusJakartaSans.variable}`}>
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
			</body>
		</html>
	);
}
