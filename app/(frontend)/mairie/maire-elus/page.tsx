import type { Metadata } from 'next';
import { generatePageMetadata } from '@shared/config/seo';
import ElusPage from '@features/elus';

export const metadata: Metadata = generatePageMetadata({
	title: 'Le maire & les élus',
	description: 'Le conseil municipal de Saint-Hilaire-Bonneval : Maire, adjoints, conseillers délégués et conseillers municipaux.',
	path: '/mairie/maire-elus'
});

export default function Page() {
	return <ElusPage />;
}
