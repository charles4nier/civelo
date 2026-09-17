import Hero, { type HeroData } from './Hero';
import QuickAccess, { type QuickAccessItemData } from './QuickAccess';
import Discover, { type DiscoverCardData } from './Discover';
import MayorWord, { type MayorWordData } from './MayorWord';
import News, { type NewsActuData, type NewsAgendaData } from './News';
import CTA, { type CTAData } from './CTA';
import { getAccueilData, getAgendaItems, getActualitesItems, getIdentiteData, pickHomeActus } from '@lib/payload';

// `getAccueilData()` (partagée par les 3 thèmes) renvoie ses propres images
// de repli quand aucun fichier n'est uploadé — celles d'edito
// (`/saint-hilaire-bonneval-*.jpg`), absentes du dossier public de ce
// thème. Neutralisé ici : chaque sous-composant applique alors SON PROPRE
// repli (`data.image ?? '/xxx.jpg'`).
function ownImage(url: string | undefined): string | undefined {
	return url && !url.startsWith('/saint-hilaire-bonneval') ? url : undefined;
}

export default async function HomePage() {
	const [accueil, agendaItems, actualiteItems, identite] = await Promise.all([
		getAccueilData(),
		getAgendaItems('agenda'),
		getActualitesItems('mairie/actualites'),
		getIdentiteData()
	]);

	const nomCommune = identite.titre;

	const hero: HeroData = accueil?.hero
		? { ...accueil.hero, image: ownImage(accueil.hero.image) }
		: { titre: 'Bienvenue sur le site de votre commune.' };

	const quickAccessItems: QuickAccessItemData[] | undefined = accueil?.quickAccessItems?.length
		? accueil.quickAccessItems
		: undefined;

	const discoverCards: DiscoverCardData[] | undefined = accueil?.discoverCards?.length
		? accueil.discoverCards.map((c) => ({ ...c, image: ownImage(c.image) }))
		: undefined;

	const mayorWord: MayorWordData | null = accueil?.mayorWord
		? { citation: accueil.mayorWord.citation, nomSignataire: accueil.mayorWord.nomSignataire }
		: null;

	const actus: NewsActuData[] | undefined = actualiteItems
		? pickHomeActus(actualiteItems, 2).map((a) => ({
				key: a.key,
				date: a.date,
				category: a.category,
				title: a.title,
				excerpt: a.excerpt,
				documentHref: a.documentHref
			}))
		: undefined;

	const agenda: NewsAgendaData[] | undefined = agendaItems?.length
		? agendaItems.slice(0, 3).map((e) => ({ key: e.key, date: e.date, title: e.title, location: e.location }))
		: undefined;

	const cta: CTAData | null = accueil?.cta ?? null;

	return (
		<>
			<Hero data={hero} />
			<QuickAccess items={quickAccessItems} />
			<Discover cards={discoverCards} />
			<MayorWord data={mayorWord} nomCommune={nomCommune} />
			<News actus={actus} agenda={agenda} />
			<CTA data={cta} nomCommune={nomCommune} />
		</>
	);
}
