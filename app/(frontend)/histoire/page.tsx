import type { Metadata } from 'next';
import { generatePageMetadata } from '@shared/config/seo';
import HistoirePage from '@features/histoire';

export const metadata: Metadata = generatePageMetadata({
	title: 'Histoire de Saint-Hilaire-Bonneval',
	description:
		"Découvrez l'histoire de Saint-Hilaire-Bonneval : origines gallo-romaines, paroisse, développement du bourg et patrimoine.",
	path: '/histoire'
});

export default function Page() {
	return <HistoirePage />;
}
