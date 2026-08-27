import Hero, { type HeroData } from './Hero';
import QuickAccess, { type QuickAccessItemData } from './QuickAccess';
import Discover, { type DiscoverCardData } from './Discover';
import MayorWord, { type MayorWordData } from './MayorWord';
import News, { type NewsItemData } from './News';
import CTA from './CTA';
import { getAccueilData, getAgendaItems, getActualitesItems, pickHomeActus } from '@lib/payload';

// `getAccueilData()` (partagée par les 3 thèmes) renvoie ses propres images
// de repli quand aucun fichier n'est uploadé — celles d'edito
// (`/saint-hilaire-bonneval-*.jpg`), absentes du dossier public de ce
// thème. Neutralisé ici : chaque sous-composant applique alors SON PROPRE
// repli (`data.image ?? '/xxx.jpg'`).
function ownImage(url: string | undefined): string | undefined {
	return url && !url.startsWith('/saint-hilaire-bonneval') ? url : undefined;
}

export default async function HomePage() {
	const [accueil, agendaItems, actualiteItems] = await Promise.all([
		getAccueilData(),
		getAgendaItems('agenda'),
		getActualitesItems('mairie/actualites')
	]);

	const hero: HeroData = accueil?.hero
		? { ...accueil.hero, image: ownImage(accueil.hero.image) }
		: { titre: 'Bienvenue sur le site de votre commune.' };

	const quickAccessItems: QuickAccessItemData[] = accueil?.quickAccessItems ?? [];

	const discoverCards: DiscoverCardData[] = (accueil?.discoverCards ?? []).map((c) => ({
		...c,
		image: ownImage(c.image)
	}));

	const mayorWord: MayorWordData | null = accueil?.mayorWord
		? { ...accueil.mayorWord, image: ownImage(accueil.mayorWord.image) }
		: null;

	const newsArticles: NewsItemData[] = actualiteItems
		? pickHomeActus(actualiteItems).map((a) => ({
				key: a.key,
				date: a.date,
				category: a.category,
				title: a.title,
				excerpt: a.excerpt,
				documentHref: a.documentHref
			}))
		: [];

	return (
		<>
			<Hero data={hero} />
			{quickAccessItems.length > 0 && <QuickAccess items={quickAccessItems} />}
			{discoverCards.length > 0 && <Discover cards={discoverCards} />}
			{mayorWord && <MayorWord data={mayorWord} />}
			{newsArticles.length > 0 && <News articles={newsArticles} />}
			<CTA data={accueil?.cta ?? null} />
		</>
	);
}
