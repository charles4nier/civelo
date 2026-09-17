import type { EditorialSection } from '@themes/clocher/components/EditorialLayout/Sections';
import { paragraphsToRichText } from '@shared/lib/richText';

// Décision 84 — repli statique (Payload injoignable) : reprend le contenu
// réel qui vivait auparavant en dur dans ce composant, sous la forme des 3
// blocs Payload sur-mesure (Intro/triptyque, Texte centré, Titre+2
// colonnes+tuiles).
export const eyebrowText = 'Vivre à Saint-Hilaire-Bonneval';
export const sousTitre = 'Un village à taille humaine, au cœur du Limousin';

export const sections: EditorialSection[] = [
	{
		blockType: 'intro',
		positionImages: 'droite',
		eyebrow: 'Portrait',
		titre: 'Une commune rurale aux multiples atouts',
		corps: paragraphsToRichText([
			"Nichée au cœur de la Haute-Vienne, Saint-Hilaire-Bonneval est une commune rurale qui conjugue douceur de vivre, nature préservée et services de proximité. À quelques kilomètres de Limoges, elle offre un cadre de vie idéal pour les familles comme pour les personnes souhaitant s'éloigner de l'agitation urbaine.",
			"Avec ses étangs, ses forêts et son patrimoine bâti remarquable, la commune attire chaque année de nouveaux habitants séduits par la qualité de l'environnement et la richesse du tissu associatif et commercial local.",
			"La municipalité s'engage au quotidien pour maintenir et développer les services essentiels : école, commerces, infrastructures sportives et culturelles, afin que chacun puisse trouver ici sa place."
		]),
		imagePrincipale: { url: '/saint-hilaire-bonneval-village.jpg' },
		imageSecondaire1: { url: '/saint-hilaire-bonneval-forest.jpg' },
		imageSecondaire2: { url: '/saint-hilaire-bonneval-lake.jpg' }
	},
	{
		blockType: 'texteCentre',
		eyebrow: 'Cadre de vie',
		titre: 'Nature, calme et proximité avec Limoges',
		corps: paragraphsToRichText([
			"Saint-Hilaire-Bonneval bénéficie d'une situation géographique privilégiée, à moins de 20 minutes du centre de Limoges, tout en conservant le charme et la tranquillité d'un village rural. Ses habitants profitent du meilleur des deux mondes : la nature à portée de main et l'accès rapide aux services d'une grande ville.",
			"Le territoire communal est traversé par plusieurs cours d'eau et ponctué d'étangs qui constituent autant de lieux de promenade, de pêche et de détente. Les sentiers balisés permettent d'explorer à pied ou à vélo un paysage de bocage typiquement limousin, préservé et varié.",
			"L'école primaire publique, le terrain de sport, la salle des fêtes et les nombreuses associations assurent une vie locale dynamique, propice à l'épanouissement de tous, des plus jeunes aux séniors.",
			'La commune veille également à son développement durable : gestion raisonnée des espaces verts, entretien du patrimoine bâti, soutien aux initiatives locales et accompagnement des projets de ses habitants.'
		])
	},
	{
		blockType: 'titreColonnesTuiles',
		eyebrow: 'Services & vie locale',
		titre: 'Tout le nécessaire à portée de la commune',
		colonneGauche: paragraphsToRichText([
			"La commune dispose d'un tissu de commerces et d'artisans locaux qui répondent aux besoins du quotidien : alimentation, restauration, artisans du bâtiment, professionnels de santé et bien d'autres encore.",
			"L'école primaire publique accueille les enfants du village et des communes voisines dans un environnement sécurisé et bienveillant.",
			'Le réseau associatif est particulièrement riche : sport, culture, entraide, loisirs… Les associations animent la vie locale tout au long de l\'année.'
		]),
		colonneDroite: paragraphsToRichText([
			"La mairie assure l'ensemble des services administratifs de proximité : état civil, urbanisme, affichage légal, location de salles communales.",
			'Les infrastructures sportives et culturelles — terrain de foot, salle polyvalente, aires de jeux — sont entretenues et régulièrement améliorées.',
			'Saint-Hilaire-Bonneval s\'inscrit également dans une démarche de développement touristique en valorisant son patrimoine naturel et bâti.'
		]),
		tuiles: [
			{ valeur: '1 022', libelle: 'Habitants' },
			{ valeur: '28,9', suffixe: 'km²', libelle: 'Superficie' },
			{ valeur: '1', libelle: 'École primaire publique' },
			{ valeur: '15+', libelle: 'Commerces & artisans' }
		]
	}
];
