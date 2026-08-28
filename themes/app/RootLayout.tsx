import { Cormorant_Garamond, Inter } from 'next/font/google';
import '@themes/app/styles/index.scss';

import Header from '@themes/app/components/Header';
import Footer from '@themes/app/components/Footer';
import FloatingButtons from '@themes/app/components/FloatingButtons';
import type { RootLayoutProps } from '../registry';

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

export default function RootLayout({ navLinks, identite, boutonEntete, footer, children }: RootLayoutProps) {
	return (
		<html lang="fr" className={`theme-app ${cormorant.variable} ${inter.variable}`}>
			<body>
				<Header navLinks={navLinks} identite={identite} bouton={boutonEntete} />
				<main>{children}</main>
				<Footer navLinks={navLinks} identite={identite} data={footer} />
				<FloatingButtons />
			</body>
		</html>
	);
}
