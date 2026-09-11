import Link from 'next/link';
import { Clock, MapPin, ArrowRight } from 'lucide-react';
import './style.scss';

const CLASS_NAME = 'agenda-block';

export type AgendaEventData = {
	key: string;
	title: string;
	date: string; // ISO
	time?: string;
	location: string;
};

type Props = { events: AgendaEventData[] };

const monthShort = [
	'Janv.',
	'Févr.',
	'Mars',
	'Avr.',
	'Mai',
	'Juin',
	'Juil.',
	'Août',
	'Sept.',
	'Oct.',
	'Nov.',
	'Déc.'
];

export default function Agenda({ events }: Props) {
	return (
		<div className={CLASS_NAME}>
			<div className={`${CLASS_NAME}__header`}>
				<h2 className={`${CLASS_NAME}__title`}>Agenda</h2>
				<Link href="/agenda" className={`${CLASS_NAME}__link`}>
					Voir tous les événements
					<ArrowRight size={14} aria-hidden="true" />
				</Link>
			</div>

			<div className={`${CLASS_NAME}__card`}>
				<ul className={`${CLASS_NAME}__list`}>
					{events.map((event) => {
						const d = new Date(event.date);
						return (
							<li key={event.key} className={`${CLASS_NAME}__item`}>
								<div className={`${CLASS_NAME}__date`}>
									<span className={`${CLASS_NAME}__date-day`}>{d.getDate()}</span>
									<span className={`${CLASS_NAME}__date-month`}>{monthShort[d.getMonth()]}</span>
								</div>
								<div className={`${CLASS_NAME}__body`}>
									<p className={`${CLASS_NAME}__item-title`}>{event.title}</p>
									{event.time && (
										<p className={`${CLASS_NAME}__meta`}>
											<Clock size={13} aria-hidden="true" />
											{event.time}
										</p>
									)}
									<p className={`${CLASS_NAME}__meta`}>
										<MapPin size={13} aria-hidden="true" />
										<span className={`${CLASS_NAME}__meta-truncate`}>{event.location}</span>
									</p>
								</div>
							</li>
						);
					})}
				</ul>
				<Link href="/agenda" className={`${CLASS_NAME}__cta`}>
					Voir tout l&rsquo;agenda
				</Link>
			</div>
		</div>
	);
}
