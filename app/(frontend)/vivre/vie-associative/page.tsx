import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/style-edito/config/seo';
import StyleEditoVieAssociativePage from '@themes/style-edito/features/vie-associative';
import AppVieAssociativePage from '@themes/app/features/vie-associative';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import { getPayloadClient } from '@lib/payload';

export const metadata: Metadata = generatePageMetadata({
	title: 'Vie associative',
	description: 'Les associations de Saint-Hilaire-Bonneval : sport, culture, éducation et citoyenneté.',
	path: '/vivre/vie-associative'
});

export default async function Page() {
	const payload = await getPayloadClient();
	const theme = await getCurrentTheme(payload);
	const Component = pickTheme(theme, { 'style-edito': StyleEditoVieAssociativePage, app: AppVieAssociativePage });
	return <Component />;
}
