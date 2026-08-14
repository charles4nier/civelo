import type { Metadata } from 'next';
import { generatePageMetadata } from '@shared/config/seo';
import CarteInteractive from '@features/carte';

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
	return <CarteInteractive initialId={id} />;
}
