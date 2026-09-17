import ContactLayout, { type ContactCardData } from '@themes/preau/components/ContactLayout';
import { getContactData } from '@lib/payload';

const fallbackCards: ContactCardData[] = [
	{
		key: 'phone',
		icon: 'Phone',
		iconVariant: 'primary',
		category: 'Par téléphone',
		name: '05 55 00 00 00',
		description: 'Lundi – vendredi, 9h – 12h et 14h – 17h.',
		contacts: [{ type: 'phone', value: '05 55 00 00 00' }]
	},
	{
		key: 'email',
		icon: 'Mail',
		iconVariant: 'leaf',
		category: 'Par email',
		name: 'contact@commune.fr',
		description: 'Réponse sous 48h ouvrées.',
		contacts: [{ type: 'email', value: 'contact@commune.fr' }]
	},
	{
		key: 'address',
		icon: 'MapPin',
		iconVariant: 'coral',
		category: 'En personne',
		name: 'Mairie de la commune',
		description: 'Le Bourg, 00000 La Commune.',
		contacts: [{ type: 'address', value: 'Le Bourg, 00000 La Commune' }]
	}
];

export default async function ContactPage() {
	const data = await getContactData('contact');

	return <ContactLayout cards={data?.cards ?? fallbackCards} formulaireActif={data?.formulaireActif ?? true} />;
}
