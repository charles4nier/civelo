import ContactLayout, { type ContactCardData } from '@themes/atelier/components/ContactLayout';
import { getContactData } from '@lib/payload';

const fallbackCards: ContactCardData[] = [
	{
		key: 'phone',
		icon: 'Phone',
		iconVariant: 'primary',
		category: 'Par téléphone',
		name: '05 XX XX 62 00',
		description: 'Lundi – vendredi, 9h – 12h et 14h – 17h.',
		contacts: [{ type: 'phone', value: '05 XX XX 62 00' }]
	},
	{
		key: 'email',
		icon: 'Mail',
		iconVariant: 'leaf',
		category: 'Par email',
		name: 'mairie@saint-martin.fr',
		description: 'Réponse sous 48h ouvrées.',
		contacts: [{ type: 'email', value: 'mairie@saint-martin.fr' }]
	},
	{
		key: 'address',
		icon: 'MapPin',
		iconVariant: 'coral',
		category: 'En personne',
		name: 'Mairie de Saint-Martin',
		description: 'Le Bourg, 87000 Saint-Martin.',
		contacts: [{ type: 'address', value: 'Le Bourg, 87000 Saint-Martin' }]
	}
];

export default async function ContactPage() {
	const data = await getContactData('contact');

	return (
		<ContactLayout
			cards={data?.cards ?? fallbackCards}
			formulaireActif={data?.formulaireActif ?? true}
		/>
	);
}
