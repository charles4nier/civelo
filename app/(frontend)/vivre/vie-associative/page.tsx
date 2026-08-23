import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/style-edito/config/seo';
import VieAssociativePage from '@themes/style-edito/features/vie-associative';

export const metadata: Metadata = generatePageMetadata({
	title: 'Vie associative',
	description: 'Les associations de Saint-Hilaire-Bonneval : sport, culture, éducation et citoyenneté.',
	path: '/vivre/vie-associative'
});

export default function Page() {
	return <VieAssociativePage />;
}
