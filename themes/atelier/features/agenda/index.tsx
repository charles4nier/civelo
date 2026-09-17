import AgendaLayout, { type AgendaEventData } from '@themes/atelier/components/AgendaLayout';
import { getAgendaItems } from '@lib/payload';
import { events } from './data';

const fallbackEvents: AgendaEventData[] = events.map((e, i) => ({
	key: String(i),
	title: e.title,
	category: e.category,
	categoryVariant:
		e.category === 'Conseil municipal'
			? 'primary'
			: e.category === 'Manifestation'
				? 'coral'
				: e.category === 'Vie associative'
					? 'leaf'
					: 'muted',
	date: e.date,
	time: e.time,
	location: e.location,
	desc: e.desc
}));

const filters = ['Tous', 'Conseil municipal', 'Manifestation', 'Vie associative', 'Cérémonie'];

export default async function AgendaPage() {
	const eventsData = (await getAgendaItems('agenda')) ?? fallbackEvents;

	return <AgendaLayout filters={filters} events={eventsData} />;
}
