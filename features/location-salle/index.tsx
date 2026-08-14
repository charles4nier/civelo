import CatalogueLieuxLayout, { type CatalogueLieuxSalleData } from '@shared/components/CatalogueLieuxLayout';
import { getCatalogueLieuxItems } from '../../lib/payload';

const fallbackSalles: CatalogueLieuxSalleData[] = [
	{
		key: 'polyvalente',
		nom: 'Salle polyvalente',
		description: 'Location à caractère associatif ou familial.',
		icone: 'Building2',
		groupesTarifs: [
			{
				label: 'Manifestations',
				lignes: [
					{ public: 'Associations de la commune', prix: 'Gratuit', caution: 'Caution 160 €' },
					{ public: 'Habitants de la commune', prix: '260 €', caution: 'Caution 260 €' },
					{ public: 'Personnes extérieures', prix: '350 €', caution: 'Caution 350 €' }
				]
			},
			{
				label: "Vins d'honneur",
				lignes: [
					{ public: 'Habitants de la commune', prix: '110 €', caution: 'Caution 250 €' },
					{ public: 'Personnes extérieures', prix: '160 €', caution: 'Caution 350 €' }
				]
			}
		],
		notes: [
			{ texte: 'Assurance obligatoire · État des lieux avant et après utilisation', type: 'info' }
		]
	},
	{
		key: 'restaurant-scolaire',
		nom: 'Salle du restaurant scolaire',
		description:
			'Disponible uniquement le week-end pour les associations et particuliers, pour des manifestations à caractère familial ou associatif.',
		icone: 'UtensilsCrossed',
		groupesTarifs: [
			{
				label: 'Location',
				lignes: [
					{ public: 'Habitants de la commune', prix: '650 €', caution: '+ cautions' },
					{ public: 'Personnes extérieures', prix: '750 €', caution: '+ cautions' }
				]
			},
			{
				label: 'Cautions',
				lignes: [
					{ public: 'Dégradation des locaux ou du matériel', prix: '1 000 €' },
					{ public: 'Nettoyage insuffisant ou mobilier non remis en place', prix: '120 €' }
				]
			}
		],
		notes: [
			{
				texte:
					'Traiteur obligatoire — lui seul et son personnel sont autorisés à utiliser le réfrigérateur, le four, la cuisinière à gaz et le lave-vaisselle.',
				type: 'condition'
			}
		]
	}
];

export default async function LocationSallePage() {
	const salles = (await getCatalogueLieuxItems('location-salle')) ?? fallbackSalles;

	return <CatalogueLieuxLayout salles={salles} />;
}
