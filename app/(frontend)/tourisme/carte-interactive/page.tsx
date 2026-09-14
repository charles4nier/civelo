import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/edito/config/seo';
import StyleEditoCarteInteractive from '@themes/edito/features/carte';
import { pois as editoFallbackPois, sentiers as editoFallbackSentiers } from '@themes/edito/features/carte/data';
import ModerneCarteInteractive from '@themes/moderne/features/carte';
import { pois as moderneFallbackPois, sentiers as moderneFallbackSentiers } from '@themes/moderne/features/carte/data';
import AccueillantCarteInteractive from '@themes/accueillant/features/carte';
import { pois as accueillantFallbackPois, sentiers as accueillantFallbackSentiers } from '@themes/accueillant/features/carte/data';
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

	if (theme === 'moderne') {
		return <ModerneCarteInteractive initialId={id} pois={data?.pois ?? moderneFallbackPois} sentiers={data?.sentiers ?? moderneFallbackSentiers} />;
	}

	if (theme === 'accueillant') {
		return (
			<AccueillantCarteInteractive
				initialId={id}
				pois={data?.pois ?? accueillantFallbackPois}
				sentiers={data?.sentiers ?? accueillantFallbackSentiers}
			/>
		);
	}

	return (
		<StyleEditoCarteInteractive initialId={id} pois={data?.pois ?? editoFallbackPois} sentiers={data?.sentiers ?? editoFallbackSentiers} />
	);
}
