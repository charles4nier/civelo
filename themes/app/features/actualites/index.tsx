import ActualitesLayout, { type ActualiteItemData } from '@themes/app/components/ActualitesLayout';
import { getActualitesItems } from '@lib/payload';

type Category = 'Mairie' | 'Vie locale' | 'Travaux' | 'Événements';
type Article = { date: string; cat: Category; title: string; excerpt: string };

const articles: Article[] = [
	{ date: '2026-05-12', cat: 'Mairie',      title: 'Compte-rendu de la séance du 5 mai 2026', excerpt: "Budget primitif, voirie communale et nouveaux aménagements de l'étang. Retrouvez le compte-rendu complet de la dernière séance du conseil municipal." },
	{ date: '2026-05-08', cat: 'Vie locale',  title: 'Marché de producteurs : nouvelle saison', excerpt: 'Tous les samedis matin sur la place du village, de mai à septembre. Venez retrouver vos producteurs locaux et découvrir les nouveautés de la saison.' },
	{ date: '2026-05-01', cat: 'Travaux',     title: 'Rénovation de la salle des fêtes', excerpt: "Les travaux débutent en juin pour une livraison prévue à l'automne. La salle sera entièrement rénovée pour accueillir les événements communaux dans de meilleures conditions." },
	{ date: '2026-04-24', cat: 'Événements',  title: 'Fête de la commune — 14 juillet 2026', excerpt: "Programme complet des festivités du 14 juillet : animations, feu d'artifice et bal populaire. Toutes les informations seront communiquées prochainement." },
	{ date: '2026-04-18', cat: 'Mairie',      title: 'Appel à projets — subventions aux associations 2026', excerpt: "La mairie lance son appel à projets annuel pour l'attribution de subventions aux associations locales. Dossiers à déposer avant le 30 mai." },
	{ date: '2026-04-10', cat: 'Travaux',     title: 'Réfection de la voirie — rue du Lavoir', excerpt: 'Des travaux de réfection de la chaussée débutent semaine prochaine rue du Lavoir. Circulation alternée prévue du lundi au vendredi pendant deux semaines.' },
	{ date: '2026-04-02', cat: 'Vie locale',  title: 'Assemblée générale du Foyer rural', excerpt: "Le Foyer rural tient son assemblée générale annuelle. Bilan d'activités, projets 2026 et élection du bureau." },
	{ date: '2026-03-25', cat: 'Événements',  title: 'Vide-grenier de printemps', excerpt: 'Le comité des fêtes organise son vide-grenier annuel sur la place du bourg. Inscriptions ouvertes auprès du secrétariat de mairie.' },
];

const fallbackItems: ActualiteItemData[] = articles.map((a, i) => ({
	key: String(i),
	title: a.title,
	category: a.cat,
	date: a.date,
	excerpt: a.excerpt
}));

const filters = ['Tous', 'Mairie', 'Vie locale', 'Travaux', 'Événements'];

export default async function ActualitesPage() {
	const items = (await getActualitesItems('mairie/actualites')) ?? fallbackItems;

	return <ActualitesLayout filters={filters} items={items} />;
}
