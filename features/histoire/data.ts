import type { EditorialSection } from '@shared/components/EditorialLayout/Sections';
import { paragraphsToRichText } from '@shared/lib/richText';

// Décision 84 — repli statique (Payload injoignable). Contenu Lorem ipsum
// repris tel quel de l'ancien composant en dur : pas d'historique réel de la
// commune disponible ici, à remplacer par le client directement dans
// l'admin.
export const eyebrowText = 'Patrimoine & Mémoire';
export const sousTitre = 'Un village aux racines profondes, au cœur du Limousin';

export const sections: EditorialSection[] = [
	{
		blockType: 'intro',
		positionImages: 'droite',
		eyebrow: 'Aux origines',
		titre: 'Des premières traces à la formation de la commune',
		corps: paragraphsToRichText([
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
			'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
			'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa quae ab illo inventore veritatis.'
		]),
		imagePrincipale: { url: '/saint-hilaire-bonneval-village.jpg' },
		imageSecondaire1: { url: '/saint-hilaire-bonneval-forest.jpg' },
		imageSecondaire2: { url: '/saint-hilaire-bonneval-lake.jpg' }
	},
	{
		blockType: 'texteCentre',
		eyebrow: 'Évolution',
		titre: 'Un bourg qui grandit au fil des siècles',
		corps: paragraphsToRichText([
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.',
			'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit. Ut labore et dolore magnam aliquam quaerat voluptatem.',
			'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.',
			'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint.'
		])
	},
	{
		blockType: 'titreColonnesTuiles',
		eyebrow: "Aujourd'hui",
		titre: 'Tourisme, agriculture et patrimoine vivant',
		colonneGauche: paragraphsToRichText([
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
			'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
		]),
		colonneDroite: paragraphsToRichText([
			'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa quae ab illo inventore veritatis.',
			'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.'
		]),
		tuiles: [
			{ valeur: 'XI', suffixe: 'ᵉ s.', libelle: 'Premières mentions historiques' },
			{ valeur: '1875', libelle: 'Aménagement du patrimoine naturel' },
			{ valeur: '1934', libelle: 'Développement économique local' },
			{ valeur: '50 km', libelle: 'De sentiers balisés' }
		]
	}
];
