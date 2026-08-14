import ActualitesLayout, { type ActualiteItemData } from '@shared/components/ActualitesLayout';
import type { IconVariant } from '@shared/components/ContactCard';
import { getActualitesItems } from '../../lib/payload';

export type Category = 'Mairie' | 'Vie locale' | 'Travaux' | 'Événements';

export type Article = {
	date: string;
	cat: Category;
	title: string;
	excerpt: string;
	// Comptes-rendus etc. point to a real document, not an article to "read
	// more" of — they get a download-style card instead of "Lire la suite".
	type?: 'document';
	href?: string;
};

export const articles: Article[] = [
	{
		date: '12 Mai 2026',
		cat: 'Mairie',
		title: 'Compte-rendu de la séance du 5 mai 2026',
		excerpt:
			"Budget primitif, voirie communale et nouveaux aménagements de l'étang. Retrouvez le compte-rendu complet de la dernière séance du conseil municipal.",
		type: 'document',
		href: '/mairie/publications'
	},
	{
		date: '08 Mai 2026',
		cat: 'Vie locale',
		title: 'Marché de producteurs : nouvelle saison',
		excerpt:
			'Tous les samedis matin sur la place du village, de mai à septembre. Venez retrouver vos producteurs locaux et découvrir les nouveautés de la saison.'
	},
	{
		date: '01 Mai 2026',
		cat: 'Travaux',
		title: 'Rénovation de la salle des fêtes',
		excerpt:
			"Les travaux débutent en juin pour une livraison prévue à l'automne. La salle sera entièrement rénovée pour accueillir les événements communaux dans de meilleures conditions."
	},
	{
		date: '24 Avril 2026',
		cat: 'Événements',
		title: 'Fête de la commune — 14 juillet 2026',
		excerpt:
			"Programme complet des festivités du 14 juillet : animations, feu d'artifice et bal populaire. Toutes les informations seront communiquées prochainement."
	},
	{
		date: '18 Avril 2026',
		cat: 'Mairie',
		title: 'Appel à projets — subventions aux associations 2026',
		excerpt:
			"La mairie lance son appel à projets annuel pour l'attribution de subventions aux associations locales. Dossiers à déposer avant le 30 mai."
	},
	{
		date: '10 Avril 2026',
		cat: 'Travaux',
		title: 'Réfection de la voirie — rue du Lavoir',
		excerpt:
			'Des travaux de réfection de la chaussée débutent semaine prochaine rue du Lavoir. Circulation alternée prévue du lundi au vendredi pendant deux semaines.'
	},
	{
		date: '02 Avril 2026',
		cat: 'Vie locale',
		title: 'Assemblée générale du Foyer rural',
		excerpt:
			"Le Foyer rural de Saint-Hilaire-Bonneval tient son assemblée générale annuelle. Bilan d'activités, projets 2026 et élection du bureau."
	},
	{
		date: '25 Mars 2026',
		cat: 'Événements',
		title: 'Vide-grenier de printemps',
		excerpt:
			'Le comité des fêtes organise son vide-grenier annuel sur la place du bourg. Inscriptions ouvertes auprès du secrétariat de mairie.'
	}
];

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
