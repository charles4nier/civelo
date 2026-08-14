'use client';

import dynamic from 'next/dynamic';
import type { POI, Sentier } from './data';

const MapClient = dynamic(() => import('./MapClient'), { ssr: false });

type Props = {
	initialId?: string;
	pois: POI[];
	sentiers: Sentier[];
};

export default function CarteInteractive({ initialId, pois, sentiers }: Props) {
	return <MapClient initialId={initialId} pois={pois} sentiers={sentiers} />;
}
