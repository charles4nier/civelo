import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/style-edito/config/seo';
import StyleEditoEnfanceJeunessePage from '@themes/style-edito/features/enfance-jeunesse';
import AppEnfanceJeunessePage from '@themes/app/features/enfance-jeunesse';
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
	const Component = pickTheme(theme, { 'style-edito': StyleEditoEnfanceJeunessePage, app: AppEnfanceJeunessePage });
	return <Component />;
}
