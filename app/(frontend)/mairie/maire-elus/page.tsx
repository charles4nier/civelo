import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/style-edito/config/seo';
import ElusPage from '@themes/style-edito/features/elus';

export const metadata: Metadata = generatePageMetadata({
	title: 'Le maire & les élus',
	description: 'Le conseil municipal de Saint-Hilaire-Bonneval : Maire, adjoints, conseillers délégués et conseillers municipaux.',
	path: '/mairie/maire-elus'
});

export default function Page() {
	return <ElusPage />;
}
