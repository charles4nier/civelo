import { EB_Garamond, Inter_Tight } from 'next/font/google';
import '@themes/belvedere/styles/index.scss';

import Header from '@themes/belvedere/components/Header';
import Footer from '@themes/belvedere/components/Footer';
import FloatingButtons from '@themes/belvedere/components/FloatingButtons';
import type { RootLayoutProps } from '../registry';

const ebGaramond = EB_Garamond({
	subsets: ['latin'],
	weight: ['400', '500', '600', '700'],
	style: ['normal', 'italic'],
	variable: '--font-display',
	display: 'swap'
});

const interTight = Inter_Tight({
	subsets: ['latin'],
	weight: ['400', '500', '600', '700'],
	variable: '--font-body',
	display: 'swap'
});

export default function RootLayout({ navLinks, identite, boutonEntete, footer, children }: RootLayoutProps) {
	return (
		<html lang="fr" className={`theme-belvedere ${ebGaramond.variable} ${interTight.variable}`}>
			<body>
				<Header navLinks={navLinks} identite={identite} bouton={boutonEntete} />
				<main>{children}</main>
				<Footer navLinks={navLinks} identite={identite} data={footer} />
				<FloatingButtons />
			</body>
		</html>
	);
}
