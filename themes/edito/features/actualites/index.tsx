import ActualitesLayout, { type ActualiteItemData } from '@themes/edito/components/ActualitesLayout';
import type { IconVariant } from '@themes/edito/components/ContactCard';
import { getActualitesItems } from '@lib/payload';
import { articles, type Category } from './data';

const catVariant: Record<Category, IconVariant> = {
	Mairie: 'primary',
	'Vie locale': 'leaf',
	Travaux: 'coral',
	Événements: 'sunshine'
};

// `articles[].date` est un texte libre ("12 Mai 2026") — ActualitesLayout
// attend un ISO (comme le champ `date` réel de Payload), même logique que
// `toISODate` dans scripts/seed.ts.
const FRENCH_MONTHS: Record<string, string> = {
	janvier: '01',
	février: '02',
	mars: '03',
	avril: '04',
	mai: '05',
	juin: '06',
	juillet: '07',
	août: '08',
	septembre: '09',
	octobre: '10',
	novembre: '11',
	décembre: '12'
};

function toISODate(frenchDate: string): string {
	const [day, monthName, year] = frenchDate.toLowerCase().split(' ');
	const month = FRENCH_MONTHS[monthName] ?? '01';
	return `${year}-${month}-${day.padStart(2, '0')}`;
}

const fallbackItems: ActualiteItemData[] = articles.map((a, i) => ({
	key: String(i),
	title: a.title,
	category: a.cat,
	categoryVariant: catVariant[a.cat],
	date: toISODate(a.date),
	excerpt: a.excerpt,
	documentHref: a.href
}));

const filters = ['Tous', 'Mairie', 'Vie locale', 'Travaux', 'Événements'];

export default async function ActualitesPage() {
	const items = (await getActualitesItems('mairie/actualites')) ?? fallbackItems;

	return <ActualitesLayout filters={filters} items={items} />;
}
