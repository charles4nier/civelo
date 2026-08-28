import AgendaLayout, { type AgendaEventData } from '@themes/accueillant/components/AgendaLayout';
import { getAgendaItems } from '@lib/payload';

const fallbackEvents: AgendaEventData[] = [
	{ key: '1', title: 'Conseil municipal', category: 'Conseil municipal', date: '2026-05-12', time: '19h00', location: 'Salle du conseil' },
	{ key: '2', title: 'Marché de producteurs', category: 'Vie associative', date: '2026-05-17', location: 'Place du village', desc: 'Tous les samedis matin de mai à septembre.' },
	{ key: '3', title: 'Fête de la commune', category: 'Manifestation', date: '2026-07-14', time: '18h00', location: 'Le Bourg', desc: 'Animations, feu d\'artifice et bal populaire.' }
];

const filters = ['Tous', 'Conseil municipal', 'Manifestation', 'Vie associative', 'Cérémonie'];

export default async function AgendaPage() {
	const events = (await getAgendaItems('agenda')) ?? fallbackEvents;

	return <AgendaLayout filters={filters} events={events} />;
}
