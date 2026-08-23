import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/style-edito/config/seo';
import NumerosUtilesPage from '@themes/style-edito/features/numeros-utiles';

export const metadata: Metadata = generatePageMetadata({
	title: 'Numéros utiles',
	description:
		'Numéros d\'urgence (SAMU, pompiers, police) et contacts locaux de Saint-Hilaire-Bonneval : mairie, gendarmerie, hôpital.',
	path: '/numeros-utiles',
});

export default function Page() {
	return <NumerosUtilesPage />;
}
