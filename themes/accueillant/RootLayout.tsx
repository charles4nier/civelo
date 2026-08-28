import { EB_Garamond, Inter_Tight } from 'next/font/google';
import '@themes/accueillant/styles/index.scss';

import Header from '@themes/accueillant/components/Header';
import Footer from '@themes/accueillant/components/Footer';
import FloatingButtons from '@themes/accueillant/components/FloatingButtons';
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
		<html lang="fr" className={`theme-accueillant ${ebGaramond.variable} ${interTight.variable}`}>
			<body>
				<Header navLinks={navLinks} identite={identite} bouton={boutonEntete} />
				<main>{children}</main>
				<Footer navLinks={navLinks} identite={identite} data={footer} />
				<FloatingButtons />
			</body>
		</html>
	);
}
