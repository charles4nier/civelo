'use client';

import dynamic from 'next/dynamic';

const MapClient = dynamic(() => import('./MapClient'), { ssr: false });

type Props = {
	initialId?: string;
};

export default function CarteInteractive({ initialId }: Props) {
	return <MapClient initialId={initialId} />;
}
