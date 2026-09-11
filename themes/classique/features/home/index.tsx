import Hero, { type HeroData } from './Hero';
import News, { type NewsItemData } from './News';
import Agenda, { type AgendaEventData } from './Agenda';
import QuickAccess, { type QuickAccessItemData } from './QuickAccess';
import MayorWord, { type MayorWordData } from './MayorWord';
import Discover, { type DiscoverCardData } from './Discover';
import CTA, { type CTAData } from './CTA';
import { getAccueilData, getAgendaItems, getActualitesItems, pickHomeActus } from '@lib/payload';
import './style.scss';

// Contrairement aux autres thèmes (portés depuis un site réel, Saint-
// Hilaire-Bonneval), Classique n'a pas encore de commune de référence — les
// replis ci-dessous sont volontairement génériques plutôt que d'inventer une
// fausse commune, pour rester honnêtes tant qu'aucun tenant n'a rempli son
// Accueil.
const fallbackHero: HeroData = {
	image: '/saint-hilaire-bonneval-hero.jpg',
	titre: 'Le site de votre commune',
	description:
		"Toutes les informations, démarches et actualités de votre commune, réunies au même endroit pour simplifier votre quotidien.",
	boutonPrincipal: { label: 'Découvrir la commune', href: '/vivre/la-commune' },
	boutonSecondaire: { label: 'Nos démarches', href: '/demarches' }
};

const fallbackQuickAccess: QuickAccessItemData[] = [
	{
		key: 'demarches',
		icon: 'FileText',
		title: 'État civil',
		desc: 'Actes de naissance, mariage, décès…',
		href: '/demarches'
	},
	{
		key: 'deliberations',
		icon: 'Gavel',
		title: 'Délibérations & Actes',
		desc: 'Comptes-rendus du conseil municipal.',
		href: '/mairie/publications'
	},
	{
		key: 'urgences',
		icon: 'Phone',
		title: 'Services & Urgences',
		desc: 'Numéros utiles à proximité.',
		href: '/numeros-utiles'
	}
];

const fallbackMayorWord: MayorWordData = {
	image: '/saint-hilaire-bonneval-village.jpg',
	citation:
		"C'est l'histoire d'une commune qui avance sans renier ses racines. Avec l'ensemble du conseil municipal, nous travaillons chaque jour pour faire vivre ce territoire et le transmettre, embelli, aux générations futures.",
	nomSignataire: 'Monsieur le Maire'
};

const fallbackDiscoverCards: DiscoverCardData[] = [
	{
		key: 'nature',
		image: '/saint-hilaire-bonneval-lake.jpg',
		etiquette: 'Nature',
		titre: 'Étangs et plans d’eau',
		description: "Pêche, balades et pique-niques dans un cadre préservé.",
		href: '/tourisme/carte-interactive'
	},
	{
		key: 'randonnee',
		image: '/saint-hilaire-bonneval-forest.jpg',
		etiquette: 'Randonnée',
		titre: 'Sentiers balisés',
		description: 'Des chemins à travers bocages et forêts.',
		href: '/tourisme/carte-interactive'
	},
	{
		key: 'patrimoine',
		image: '/saint-hilaire-bonneval-village.jpg',
		etiquette: 'Patrimoine',
		titre: "L'âme du village",
		description: 'Église, lavoirs, croix de chemin : un héritage qui se raconte.',
		href: '/tourisme/carte-interactive'
	}
];

const fallbackCTA: CTAData = {
	titre: 'Nous contacter',
	description: "L'équipe municipale vous accueille et répond à vos questions.",
	boutonLabel: 'Prendre rendez-vous',
	contacts: [
		{ type: 'address', value: 'Le Bourg' },
		{ type: 'phone', value: '05 55 00 00 00' },
		{ type: 'email', value: 'contact@mairie.fr' }
	]
};

const fallbackNews: NewsItemData[] = [
	{
		key: 'cr-conseil',
		date: '2026-05-12',
		category: 'Mairie',
		title: 'Compte-rendu du dernier conseil municipal',
		excerpt: 'Budget, voirie et projets communaux.'
	},
	{
		key: 'marche',
		date: '2026-05-08',
		category: 'Vie locale',
		title: 'Marché de producteurs',
		excerpt: 'Chaque mois sur la place du village.'
	},
	{
		key: 'travaux',
		date: '2026-05-01',
		category: 'Travaux',
		title: 'Rénovation de la salle des fêtes',
		excerpt: 'Le chantier se poursuit jusqu’à la fin de l’été.'
	}
];

const fallbackAgenda: AgendaEventData[] = [
	{ key: 'conseil', title: 'Séance du conseil municipal', date: '2026-09-15', time: '19:00 - 21:00', location: 'Salle du conseil, mairie' },
	{ key: 'marche', title: 'Marché des producteurs', date: '2026-09-18', time: '08:00 - 13:00', location: 'Place du bourg' },
	{ key: 'fete', title: 'Fête de la nature', date: '2026-09-25', time: '10:00 - 18:00', location: 'Étang communal' }
];

export default async function HomePage() {
	const [accueil, agendaItems, actualiteItems] = await Promise.all([
		getAccueilData(),
		getAgendaItems('agenda'),
		getActualitesItems('mairie/actualites')
	]);

	const today = new Date(new Date().toDateString());
	const events: AgendaEventData[] = agendaItems?.length
		? agendaItems.map((e) => ({ key: e.key, title: e.title, date: e.date, time: e.time, location: e.location }))
		: fallbackAgenda;
	const upcomingEvents = events
		.filter((e) => new Date(e.date) >= today)
		.sort((a, b) => a.date.localeCompare(b.date))
		.slice(0, 4);

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

			<section className="home-columns">
				<div className="container">
					<div className="home-columns__grid">
						<News articles={newsArticles} />
						<Agenda events={upcomingEvents.length ? upcomingEvents : fallbackAgenda} />
						<QuickAccess
							items={accueil?.quickAccessItems?.length ? accueil.quickAccessItems : fallbackQuickAccess}
						/>
					</div>
				</div>
			</section>

			<MayorWord data={accueil?.mayorWord ?? fallbackMayorWord} />
			<Discover cards={accueil?.discoverCards?.length ? accueil.discoverCards : fallbackDiscoverCards} />
			<CTA data={accueil?.cta ?? fallbackCTA} />
		</>
	);
}
