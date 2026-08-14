import type { Metadata } from 'next';
import { generatePageMetadata } from '@shared/config/seo';
import CarteInteractive from '@features/carte';
import { pois as fallbackPois, sentiers as fallbackSentiers } from '@features/carte/data';
import { getCarteData } from '../../../../lib/payload';

export const metadata: Metadata = generatePageMetadata({
	title: 'Carte interactive',
	description: 'Explorez Saint-Hilaire-Bonneval grâce à notre carte interactive.',
	path: '/tourisme/carte-interactive',
});

type PageProps = {
	searchParams: Promise<{ category?: string; id?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
	const { id } = await searchParams;
	const data = await getCarteData();

	return (
		<CarteInteractive
			initialId={id}
			pois={data?.pois ?? fallbackPois}
			sentiers={data?.sentiers ?? fallbackSentiers}
		/>
	);
}
