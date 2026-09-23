import Link from 'next/link';
import { CalendarDays } from 'lucide-react';
import type { NextEventData } from '../QuickAccess';
import './style.scss';

const CLASS_NAME = 'agenda-highlight';

type Props = { events: NextEventData[] };

const monthShort = [
	'JANV.',
	'FÉVR.',
	'MARS',
	'AVR.',
	'MAI',
	'JUIN',
	'JUIL.',
	'AOÛT',
	'SEPT.',
	'OCT.',
	'NOV.',
	'DÉC.'
];

// L'événement principal a désormais son propre aplat (`--primary`, ci-dessous) —
// les 3 autres tournent sur les teintes restantes pour ne pas le répéter.
const SIDE_MODS = ['coral', 'leaf', 'sunshine'] as const;

function EventBlock({ event, mod, main = false }: { event: NextEventData; mod: string; main?: boolean }) {
	const eventDate = new Date(event.date);
	return (
		<div className={`${CLASS_NAME}__item ${CLASS_NAME}__item--${mod} ${main ? `${CLASS_NAME}__item--main` : ''}`}>
			{event.category && <span className={`${CLASS_NAME}__item-tag`}>{event.category}</span>}
			<div className={`${CLASS_NAME}__item-date`}>
				<span className={`${CLASS_NAME}__item-date-day`}>{eventDate.getDate()}</span>
				<span className={`${CLASS_NAME}__item-date-month`}>{monthShort[eventDate.getMonth()]}</span>
			</div>
			<p className={`${CLASS_NAME}__item-title`}>{event.title}</p>
			{main && event.desc && <p className={`${CLASS_NAME}__item-desc`}>{event.desc}</p>}
		</div>
	);
}

// Repris de style-edito-test — inspiré du bloc « Actualités » de
// toulouse.fr : un gros événement (pas de photo, un aplat de couleur du
// thème) + trois autres en colonne, légèrement décrochés (étiquette qui
// déborde en haut du bloc). Bandeau de titre + lien newsletter repris du
// même modèle, appliqué ici à « Agenda ».
export default function Agenda({ events }: Props) {
	const [mainEvent, ...rest] = events;
	if (!mainEvent) return null;
	const sideEvents = rest.slice(0, 3);

	return (
		<section id="agenda" className={CLASS_NAME}>
			<div className="container">
				<div className={`${CLASS_NAME}__header`}>
					<h2 className={`${CLASS_NAME}__heading`}>Agenda</h2>
					{/* Alignés ensemble, même style que "Toutes les actualités" (News) —
					    couleur commune ($foreground, `.btn-outline`), pas de vedette
					    l'un sur l'autre. La newsletter n'est pas encore fonctionnelle —
					    UI seule, même logique que la recherche du Hero. */}
					<div className={`${CLASS_NAME}__header-actions`}>
						<Link href="/agenda" className="btn-outline">
							<CalendarDays size={16} aria-hidden="true" />
							Voir l&rsquo;agenda
						</Link>
						<button type="button" className="btn-outline">
							S'inscrire à la newsletter
						</button>
					</div>
				</div>

				<div className={`${CLASS_NAME}__grid`}>
					<EventBlock event={mainEvent} mod="primary" main />
					<div className={`${CLASS_NAME}__side`}>
						{sideEvents.map((event, i) => (
							<EventBlock key={event.title + event.date} event={event} mod={SIDE_MODS[i % SIDE_MODS.length]} />
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
