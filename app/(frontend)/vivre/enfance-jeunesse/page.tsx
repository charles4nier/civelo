import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/edito/config/seo';
import StyleEditoEnfanceJeunessePage from '@themes/edito/features/enfance-jeunesse';
import ModerneEnfanceJeunessePage from '@themes/moderne/features/enfance-jeunesse';
import AccueillantEnfanceJeunessePage from '@themes/accueillant/features/enfance-jeunesse';
import ClassiqueEnfanceJeunessePage from '@themes/classique/features/enfance-jeunesse';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import { getPayloadClient } from '@lib/payload';

export const metadata: Metadata = generatePageMetadata({
	title: 'Enfance & jeunesse',
	description: 'Centre de loisirs, cantine, garderie et assistantes maternelles à Saint-Hilaire-Bonneval.',
	path: '/vivre/enfance-jeunesse'
});

export default async function Page() {
	const payload = await getPayloadClient();
	const theme = await getCurrentTheme(payload);
	const Component = pickTheme(theme, { edito: StyleEditoEnfanceJeunessePage, moderne: ModerneEnfanceJeunessePage, accueillant: AccueillantEnfanceJeunessePage, classique: ClassiqueEnfanceJeunessePage });
	return <Component />;
}
