import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/style-edito/config/seo';
import EnfanceJeunessePage from '@themes/style-edito/features/enfance-jeunesse';

export const metadata: Metadata = generatePageMetadata({
	title: 'Enfance & jeunesse',
	description: "Centre de loisirs, cantine, garderie et assistantes maternelles à Saint-Hilaire-Bonneval.",
	path: '/vivre/enfance-jeunesse'
});

export default function Page() {
	return <EnfanceJeunessePage />;
}
