import type { Metadata } from 'next';
import { generatePageMetadata } from '@shared/config/seo';
import CommunePage from '@features/commune';

export const metadata: Metadata = generatePageMetadata({
	title: 'La commune',
	description: 'Portrait de Saint-Hilaire-Bonneval : habitants, superficie, services, commerces et atouts d\'une commune rurale dynamique au cœur de la Haute-Vienne.',
	path: '/vivre/la-commune'
});

export default function Page() {
	return <CommunePage />;
}
