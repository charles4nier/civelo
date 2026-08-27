import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/edito/config/seo';
import StyleEditoCarteInteractive from '@themes/edito/features/carte';
import { pois as editoFallbackPois, sentiers as editoFallbackSentiers } from '@themes/edito/features/carte/data';
import AppCarteInteractive from '@themes/app/features/carte';
import { pois as appFallbackPois, sentiers as appFallbackSentiers } from '@themes/app/features/carte/data';
import AccueillantCarteInteractive from '@themes/accueillant/features/carte';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import { getCarteData, getPayloadClient } from '@lib/payload';

export const metadata: Metadata = generatePageMetadata({
	title: 'Carte interactive',
	description: 'Explorez Saint-Hilaire-Bonneval grâce à notre carte interactive.',
	path: '/tourisme/carte-interactive'
});

type PageProps = {
	searchParams: Promise<{ category?: string; id?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
	const { id } = await searchParams;
	const payload = await getPayloadClient();
	const [theme, data] = await Promise.all([getCurrentTheme(payload), getCarteData()]);

	if (theme === 'app') {
		return <AppCarteInteractive initialId={id} pois={data?.pois ?? appFallbackPois} sentiers={data?.sentiers ?? appFallbackSentiers} />;
	}

	if (theme === 'accueillant') {
		return <AccueillantCarteInteractive initialId={id} />;
	}

	return (
		<StyleEditoCarteInteractive initialId={id} pois={data?.pois ?? editoFallbackPois} sentiers={data?.sentiers ?? editoFallbackSentiers} />
	);
}
