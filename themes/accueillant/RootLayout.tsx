import { EB_Garamond, Inter_Tight } from 'next/font/google';
import '@themes/accueillant/styles/index.scss';

import Header from '@themes/accueillant/components/Header';
import Footer from '@themes/accueillant/components/Footer';
import FloatingButtons from '@themes/accueillant/components/FloatingButtons';
import type { RootLayoutProps } from '../registry';

// Header/Footer encore 100% statiques, pas encore rebranchés sur Payload —
// même état que le thème "app" au moment de son portage.
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

export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<html lang="fr" className={`${ebGaramond.variable} ${interTight.variable}`}>
			<body>
				<Header />
				<main>{children}</main>
				<Footer />
				<FloatingButtons />
			</body>
		</html>
	);
}
