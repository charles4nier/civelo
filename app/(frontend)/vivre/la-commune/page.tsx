import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/edito/config/seo';
import StyleEditoCommunePage from '@themes/edito/features/commune';
import AppCommunePage from '@themes/app/features/commune';
import AccueillantCommunePage from '@themes/accueillant/features/commune';
import ClassiqueCommunePage from '@themes/classique/features/commune';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import { getPayloadClient } from '@lib/payload';

export const metadata: Metadata = generatePageMetadata({
	title: 'La commune',
	description:
		"Portrait de Saint-Hilaire-Bonneval : habitants, superficie, services, commerces et atouts d'une commune rurale dynamique au cœur de la Haute-Vienne.",
	path: '/vivre/la-commune'
});

export default async function Page() {
	const payload = await getPayloadClient();
	const theme = await getCurrentTheme(payload);
	const Component = pickTheme(theme, { edito: StyleEditoCommunePage, app: AppCommunePage, accueillant: AccueillantCommunePage, classique: ClassiqueCommunePage });
	return <Component />;
}
