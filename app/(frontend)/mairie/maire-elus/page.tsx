import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/style-edito/config/seo';
import StyleEditoElusPage from '@themes/style-edito/features/elus';
import AppElusPage from '@themes/app/features/elus';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import { getPayloadClient } from '@lib/payload';

export const metadata: Metadata = generatePageMetadata({
	title: 'Le maire & les élus',
	description: 'Le conseil municipal de Saint-Hilaire-Bonneval : Maire, adjoints, conseillers délégués et conseillers municipaux.',
	path: '/mairie/maire-elus'
});

export default async function Page() {
	const payload = await getPayloadClient();
	const theme = await getCurrentTheme(payload);
	const Component = pickTheme(theme, { 'style-edito': StyleEditoElusPage, app: AppElusPage });
	return <Component />;
}
