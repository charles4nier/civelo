import { Cormorant_Garamond, Inter } from 'next/font/google';
import '@themes/app/styles/index.scss';

import Header from '@themes/app/components/Header';
import Footer from '@themes/app/components/Footer';
import FloatingButtons from '@themes/app/components/FloatingButtons';
import type { RootLayoutProps } from '../registry';

// Header/Footer encore 100% statiques (contenu en dur, voir Config
// `@themes/app/config/commune`) — pas encore rebranchés sur Payload, à la
// différence de style-edito. C'est la phase 2 du portage de ce thème
// (rebranchement), pas encore faite : les props navLinks/identite/
// boutonEntete/footer transitent ici sans effet pour l'instant.
const cormorant = Cormorant_Garamond({
	subsets: ['latin'],
	weight: ['400', '500', '600'],
	style: ['normal', 'italic'],
	variable: '--font-display',
	display: 'swap',
	preload: false
});

const inter = Inter({
	subsets: ['latin'],
	weight: ['400', '500', '600'],
	variable: '--font-body',
	display: 'swap',
	preload: false
});

export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<html lang="fr" className={`${cormorant.variable} ${inter.variable}`}>
			<body>
				<Header />
				<main>{children}</main>
				<Footer />
				<FloatingButtons />
			</body>
		</html>
	);
}
