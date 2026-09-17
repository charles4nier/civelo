import NumerosUtilesLayout, { type UrgenceData, type LocalData } from '@themes/atelier/components/NumerosUtilesLayout';
import { getNumerosUtilesData } from '@lib/payload';
import { urgences, locaux } from './data';

const fallbackUrgences: UrgenceData[] = urgences.map((u, i) => ({ key: String(i), ...u }));
const fallbackLocaux: LocalData[] = locaux.map((l, i) => ({
	key: String(i),
	label: l.label,
	number: l.number,
	detail: l.detail ?? undefined,
	href: l.href
}));

export default async function NumerosUtilesPage() {
	const data = await getNumerosUtilesData('numeros-utiles');

	return (
		<NumerosUtilesLayout
			urgences={data?.urgences ?? fallbackUrgences}
			locaux={data?.locaux ?? fallbackLocaux}
		/>
	);
}
