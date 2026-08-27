import Hero, { type HeroData } from './Hero';
import QuickAccess, { type QuickAccessItemData, type NextEventData } from './QuickAccess';
import Discover, { type DiscoverCardData } from './Discover';
import MayorWord, { type MayorWordData } from './MayorWord';
import News, { type NewsItemData } from './News';
import CTA, { type CTAData } from './CTA';
import { getAccueilData, getAgendaItems, getActualitesItems, pickHomeActus } from '@lib/payload';
import { events as fallbackEvents } from '@themes/edito/features/agenda/data';

const fallbackHero: HeroData = {
	image: '/saint-hilaire-bonneval-hero.jpg',
	titre: 'Bienvenue sur le site de la Mairie de Saint-Hilaire-Bonneval, au cœur de la Haute-Vienne.',
	description:
		"Entre rivières, forêts et patrimoine vivant, la commune vous accueille. Retrouvez ici vos démarches, l'actualité municipale et toutes les informations utiles à la vie locale.",
	boutonPrincipal: { label: 'Effectuer une démarche', href: '/demarches' },
	boutonSecondaire: { label: 'Découvrir la commune', href: '/vivre/la-commune' }
};

const fallbackQuickAccess: QuickAccessItemData[] = [
	{
		key: 'demarches',
		icon: 'FileText',
		title: 'Démarches administratives',
		desc: 'État civil, urbanisme, demandes en quelques clics.',
		href: '/demarches'
	},
	{
		key: 'deliberations',
		icon: 'Gavel',
		title: 'Délibérations & Actes',
		desc: 'Comptes-rendus du conseil municipal et arrêtés.',
		href: '/mairie/publications'
	},
	{
		key: 'urgences',
		icon: 'Phone',
		title: 'Services & Urgences',
		desc: 'Numéros utiles et services publics à proximité.',
		href: '/numeros-utiles'
	}
];

const fallbackMayorWord: MayorWordData = {
	image: '/saint-hilaire-bonneval-village.jpg',
	citation:
		"Saint-Hilaire-Bonneval, c'est l'histoire d'un village qui avance sans renier ses racines. Un lieu où la nature dicte le tempo, où les liens se tissent autour de projets partagés. Avec l'ensemble du conseil municipal, nous travaillons chaque jour pour faire vivre cette commune et la transmettre, embellie, aux générations futures.",
	nomSignataire: 'Monsieur le Maire',
	statNombre: '1 022',
	statLibelle: 'Habitants au cœur du Limousin'
};

const fallbackDiscoverCards: DiscoverCardData[] = [
	{
		key: 'etang',
		image: '/saint-hilaire-bonneval-lake.jpg',
		etiquette: 'Nature',
		titre: "Nos étangs et plans d'eau",
		description: "Pêche, baignade et balades au fil de l'eau dans un cadre préservé.",
		href: '/tourisme/carte-interactive?id=etang-bonneval'
	},
	{
		key: 'sentiers',
		image: '/saint-hilaire-bonneval-forest.jpg',
		etiquette: 'Randonnée',
		titre: 'Sentiers du Limousin',
		description: 'Plus de 40 km de chemins balisés à travers forêts et bocages.',
		href: '/tourisme/carte-interactive?id=sentier-cretes'
	},
	{
		key: 'village',
		image: '/saint-hilaire-bonneval-village.jpg',
		etiquette: 'Patrimoine',
		titre: "L'âme du village",
		description: 'Église, lavoirs, croix de chemin : un héritage qui se raconte.',
		href: '/tourisme/carte-interactive?id=eglise'
	}
];

const fallbackCTA: CTAData = {
	titre: 'Nous contacter',
	description:
		'La mairie vous accueille du lundi au vendredi, de 9h à 12h et de 14h à 17h. Le secrétariat reste à votre disposition pour toute démarche.',
	boutonLabel: 'Prendre rendez-vous',
	contacts: [
		{ type: 'address', value: 'Le Bourg, 87260 Saint-Hilaire-Bonneval' },
		{ type: 'phone', value: '05 55 00 61 65' },
		{ type: 'email', value: 'contact@saint-hilaire-bonneval.fr' }
	]
};

const fallbackNews: NewsItemData[] = [
	{
		key: 'cr-5-mai',
		date: '2026-05-12',
		category: 'Conseil municipal',
		title: 'Compte-rendu de la séance du 5 mai 2026',
		excerpt: "Budget primitif, voirie communale et nouveaux aménagements de l'étang.",
		documentHref: '/mairie/publications'
	},
	{
		key: 'marche',
		date: '2026-05-08',
		category: 'Vie locale',
		title: 'Marché de producteurs : nouvelle saison',
		excerpt: 'Tous les samedis matin sur la place du village, de mai à septembre.'
	},
	{
		key: 'salle-fetes',
		date: '2026-05-01',
		category: 'Travaux',
		title: 'Rénovation de la salle des fêtes',
		excerpt: "Les travaux débutent en juin pour une livraison prévue à l'automne."
	}
];

export default async function HomePage() {
	const [accueil, agendaItems, actualiteItems] = await Promise.all([
		getAccueilData(),
		getAgendaItems('agenda'),
		getActualitesItems('mairie/actualites')
	]);

	const today = new Date(new Date().toDateString());
	const events: NextEventData[] = agendaItems ?? fallbackEvents.map((e) => ({ title: e.title, date: e.date }));
	const nextEvent: NextEventData | undefined = events
		.filter((e) => new Date(e.date) >= today)
		.sort((a, b) => a.date.localeCompare(b.date))[0];

	const newsArticles: NewsItemData[] = actualiteItems
		? pickHomeActus(actualiteItems).map((a) => ({
				key: a.key,
				date: a.date,
				category: a.category,
				title: a.title,
				excerpt: a.excerpt,
				documentHref: a.documentHref
			}))
		: fallbackNews;

	return (
		<>
			<Hero data={accueil?.hero ?? fallbackHero} />
			<QuickAccess
				items={accueil?.quickAccessItems?.length ? accueil.quickAccessItems : fallbackQuickAccess}
				nextEvent={nextEvent}
			/>
			<News articles={newsArticles} />
			<MayorWord data={accueil?.mayorWord ?? fallbackMayorWord} />
			<Discover cards={accueil?.discoverCards?.length ? accueil.discoverCards : fallbackDiscoverCards} />
			<CTA data={accueil?.cta ?? fallbackCTA} />
		</>
	);
}
