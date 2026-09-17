import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/atelier/config/seo';
import AtelierCarteInteractive from '@themes/atelier/features/carte';
import { pois as atelierFallbackPois, sentiers as atelierFallbackSentiers } from '@themes/atelier/features/carte/data';
import PreauCarteInteractive from '@themes/preau/features/carte';
import { pois as preauFallbackPois, sentiers as preauFallbackSentiers } from '@themes/preau/features/carte/data';
import BelvedereCarteInteractive from '@themes/belvedere/features/carte';
import { pois as belvedereFallbackPois, sentiers as belvedereFallbackSentiers } from '@themes/belvedere/features/carte/data';
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

	if (theme === 'preau') {
		return <PreauCarteInteractive initialId={id} pois={data?.pois ?? preauFallbackPois} sentiers={data?.sentiers ?? preauFallbackSentiers} />;
	}

	if (theme === 'belvedere') {
		return (
			<BelvedereCarteInteractive
				initialId={id}
				pois={data?.pois ?? belvedereFallbackPois}
				sentiers={data?.sentiers ?? belvedereFallbackSentiers}
			/>
		);
	}

	return (
		<AtelierCarteInteractive initialId={id} pois={data?.pois ?? atelierFallbackPois} sentiers={data?.sentiers ?? atelierFallbackSentiers} />
	);
}
