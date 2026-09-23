import Hero, { type HeroData } from './Hero';
import QuickAccess, { type QuickAccessItemData, type NextEventData } from './QuickAccess';
import Discover, { type DiscoverCardData } from './Discover';
import Slideshow, { type SlideshowItemData } from './Slideshow';
import Agenda from './Agenda';
import MayorWord, { type MayorWordData } from './MayorWord';
import News, { type NewsItemData } from './News';
import CTA, { type CTAData } from './CTA';
import { getAccueilData, getAgendaItems, getActualitesItems, pickHomeActus, getCurrentVariant, getIdentiteData } from '@lib/payload';
import { events as fallbackEvents } from '@themes/atelier/features/agenda/data';
import './tourisme.scss';

const fallbackHero: HeroData = {
	image: '/saint-hilaire-bonneval-hero.jpg'
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
	// Contact et Carte interactive sont désormais ajoutés automatiquement par
	// `QuickAccess` lui-même (`STRUCTURAL_ITEMS`), même quand `quickAccessItems`
	// vient de Payload et ne les liste pas — plus besoin de les lister ici.
];

const fallbackMayorWord: MayorWordData = {
	image: '/saint-hilaire-bonneval-village.jpg',
	citation:
		"Saint-Martin, c'est l'histoire d'un village qui avance sans renier ses racines. Un lieu où la nature dicte le tempo, où les liens se tissent autour de projets partagés. Avec l'ensemble du conseil municipal, nous travaillons chaque jour pour faire vivre cette commune et la transmettre, embellie, aux générations futures.",
	nomSignataire: 'Monsieur le Maire',
	afficherEncart: true,
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

// Section « Diaporama » (variante tourisme et défaut, cf. plus bas) — 3
// diapositives de repli si aucune n'est saisie côté Payload.
const fallbackSlideshow: SlideshowItemData[] = [
	{
		key: 'fete-remparts',
		image: '/saint-hilaire-bonneval-village.jpg',
		titre: 'Fête des Remparts',
		description:
			'Le week-end des 12 et 13 juillet, le village remonte le temps : artisanat, costumes, animations et repas champêtre au cœur du bourg. Un rendez-vous à ne pas manquer.',
		badgeNombre: '12 & 13',
		badgeLibelle: 'Juillet · Rendez-vous au village',
		boutonLabel: 'Voir le programme',
		href: '/agenda'
	},
	{
		key: 'commerces',
		image: '/saint-hilaire-bonneval-hero.jpg',
		titre: 'Commerces & hébergements',
		description:
			'Restaurants, boulangerie, épicerie, artisans, gîtes et chambres d’hôtes : au cœur du bourg, tout ce qu’il faut pour goûter la vie du village — de passage ou pour tout un séjour.',
		boutonLabel: 'Découvrir les commerces',
		href: '/commerces'
	},
	{
		key: 'carte-interactive',
		image: '/saint-hilaire-bonneval-lake.jpg',
		titre: 'La carte interactive',
		description:
			'Étangs, sentiers balisés, patrimoine et points d’intérêt : suivez la carte interactive pour préparer vos balades et explorer chaque recoin de la commune.',
		badgeNombre: '40 km',
		badgeLibelle: 'De sentiers balisés à explorer',
		boutonLabel: 'Ouvrir la carte interactive',
		href: '/tourisme/carte-interactive'
	}
];

const fallbackCTA: CTAData = {
	titre: 'Nous contacter',
	description:
		'La mairie vous accueille du lundi au vendredi, de 9h à 12h et de 14h à 17h. Le secrétariat reste à votre disposition pour toute démarche.',
	boutonLabel: 'Prendre rendez-vous',
	contacts: [
		{ type: 'address', value: 'Le Bourg, 87000 Saint-Martin' },
		{ type: 'phone', value: '05 XX XX 61 65' },
		{ type: 'email', value: 'contact@saint-martin.fr' }
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
	const [accueil, agendaItems, actualiteItems, variant, identite] = await Promise.all([
		getAccueilData(),
		getAgendaItems('agenda'),
		getActualitesItems('mairie/actualites'),
		getCurrentVariant(),
		getIdentiteData()
	]);
	const nomCommune = identite.titre;

	const today = new Date(new Date().toDateString());
	const events: NextEventData[] = agendaItems ?? fallbackEvents.map((e) => ({ title: e.title, date: e.date }));
	// 1 événement principal + jusqu'à 3 autres (voir `Agenda/index.tsx`,
	// inspiré du bloc « Actualités » de toulouse.fr : un gros + trois petits).
	const upcomingEvents = events
		.filter((e) => new Date(e.date) >= today)
		.sort((a, b) => a.date.localeCompare(b.date));

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

	const quickAccessItems = accueil?.quickAccessItems?.length ? accueil.quickAccessItems : fallbackQuickAccess;
	const discoverCards = accueil?.discoverCards?.length ? accueil.discoverCards : fallbackDiscoverCards;
	const slides = accueil?.slideshow?.length ? accueil.slideshow : fallbackSlideshow;

	const hero = <Hero data={accueil?.hero ?? fallbackHero} />;
	// Toggle éditorial explicite (`accueil.afficherSlideshow`, même pattern
	// que `mayorWord.afficherEncart`) — indépendant du fait qu'il y ait des
	// diapositives ou non, pour pouvoir masquer temporairement la section
	// sans vider le contenu déjà saisi.
	const slideshow =
		accueil?.afficherSlideshow !== false && slides.length > 0 ? <Slideshow slides={slides} /> : null;
	const news = <News articles={newsArticles} />;
	const mayorWord = <MayorWord data={accueil?.mayorWord ?? fallbackMayorWord} nomCommune={nomCommune} />;
	const discover = <Discover cards={discoverCards} />;
	const cta = <CTA data={accueil?.cta ?? fallbackCTA} nomCommune={nomCommune} />;

	// Variante tourisme (`Tenants.variante`, pour l'instant uniquement gérée
	// par le thème édito) — mêmes blocs que la variante par défaut, disposés
	// différemment. Le Hero ne change jamais, quelle que soit la variante. Le
	// diaporama est 2ᵉ bloc en tourisme, 3ᵉ en défaut (le Hero n'est jamais
	// compté comme un bloc). L'agenda n'est plus intégré à « L'essentiel en un
	// clic » (`QuickAccess`, dont le style repris de style-edito-test n'a plus
	// de place pour l'accueillir) : dans les deux variantes, c'est désormais
	// son propre bloc (`Agenda`) — en tourisme sous les dernières actualités
	// municipales, en défaut juste après `QuickAccess` (son emplacement
	// précédent, quand il vivait encore dans la carte).
	//
	// Les wrappers de section (`Discover` et `News`, avec leur bande décorative
	// éventuelle) restent chacun à leur position habituelle — seul le CONTENU
	// (`DiscoverGrid`/`NewsGrid`, choisi par leur prop `variant`) est échangé
	// entre les deux, pour qu'Actualités apparaisse juste après le Hero et
	// Tourisme & Patrimoine juste après le Diaporama.
	if (variant === 'tourisme') {
		return (
			<div className="tourisme-layout">
				{hero}
				<Discover cards={discoverCards} articles={newsArticles} variant="tourisme" />
				{slideshow}
				<News articles={newsArticles} cards={discoverCards} variant="tourisme" />
				{upcomingEvents.length > 0 && <Agenda events={upcomingEvents} />}
				{mayorWord}
				<QuickAccess items={quickAccessItems} />
				{cta}
			</div>
		);
	}

	return (
		<>
			{hero}
			<QuickAccess items={quickAccessItems} />
			{upcomingEvents.length > 0 && <Agenda events={upcomingEvents} />}
			{news}
			{slideshow}
			{mayorWord}
			{discover}
			{cta}
		</>
	);
}
