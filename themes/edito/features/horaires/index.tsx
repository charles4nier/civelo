import HorairesLayout, { type HorairesContactData } from '@themes/edito/components/HorairesLayout';
import { getHorairesData } from '@lib/payload';

const fallbackSchedule = [
	{ day: 'Lundi', morning: '9h – 12h', afternoon: '14h – 17h' },
	{ day: 'Mardi', morning: '9h – 12h', afternoon: '14h – 17h' },
	{ day: 'Mercredi', morning: '9h – 12h', afternoon: '14h – 17h' },
	{ day: 'Jeudi', morning: '9h – 12h', afternoon: '14h – 17h' },
	{ day: 'Vendredi', morning: '9h – 12h', afternoon: '14h – 17h' },
	{ day: 'Samedi', morning: 'Fermé', afternoon: 'Fermé' },
	{ day: 'Dimanche', morning: 'Fermé', afternoon: 'Fermé' }
];

const fallbackFermetures = ['24 décembre (après-midi)', '1er janvier', 'Lundi de Pâques', '1er mai'];

const fallbackContacts: HorairesContactData[] = [
	{
		key: 'secretariat',
		icon: 'Phone',
		iconVariant: 'primary',
		category: 'Secrétariat',
		name: 'Accueil mairie',
		description: 'Renseignements généraux, état civil, démarches administratives.',
		contacts: [
			{ type: 'phone', value: '05 55 00 60 15' },
			{ type: 'email', value: 'mairie@saint-hilaire-bonneval.fr' }
		]
	},
	{
		key: 'urbanisme',
		icon: 'Building2',
		iconVariant: 'leaf',
		category: 'Sur rendez-vous',
		name: 'Service urbanisme',
		description: 'Permis de construire, déclarations préalables, PLU. Le mardi matin uniquement.',
		contacts: [{ type: 'phone', value: '05 55 00 60 20' }]
	},
	{
		key: 'securite',
		icon: 'ShieldAlert',
		iconVariant: 'muted',
		category: 'Sécurité',
		name: 'Police municipale / Gendarmerie',
		description: 'Gendarmerie de Saint-Hilaire-Bonneval.',
		contacts: [{ type: 'phone', value: '05 55 00 60 17' }]
	},
	{
		key: 'pompiers',
		icon: 'Flame',
		iconVariant: 'coral',
		category: 'Urgence',
		name: 'Pompiers',
		description: 'Incendie et secours, numéro national disponible 24h/24.',
		contacts: [{ type: 'phone', value: '18' }]
	}
];

export default async function HorairesPage() {
	const data = await getHorairesData('mairie/horaires');

	return (
		<HorairesLayout
			schedule={data?.schedule ?? fallbackSchedule}
			fermetures={data?.fermetures ?? fallbackFermetures}
			contacts={data?.contacts ?? fallbackContacts}
		/>
	);
}
