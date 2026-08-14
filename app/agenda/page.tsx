import type { Metadata } from 'next';
import { generatePageMetadata } from '@shared/config/seo';
import AgendaPage from '@features/agenda';

export const metadata: Metadata = generatePageMetadata({
	title: 'Agenda',
	description: 'Conseils municipaux, marchés, fêtes et cérémonies à Saint-Hilaire-Bonneval.',
	path: '/agenda'
});

export default function Page() {
	return <AgendaPage />;
}
