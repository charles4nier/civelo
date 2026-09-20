import HorairesLayout, { type HorairesContactData } from '@themes/preau/components/HorairesLayout';
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
		contacts: [{ type: 'phone', value: '05 XX XX 00 00' }, { type: 'email', value: 'contact@commune.fr' }]
	},
	{
		key: 'urbanisme',
		icon: 'Building2',
		iconVariant: 'leaf',
		category: 'Sur rendez-vous',
		name: 'Service urbanisme',
		description: 'Permis de construire, déclarations préalables, PLU.',
		contacts: [{ type: 'phone', value: '05 XX XX 00 00' }]
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
