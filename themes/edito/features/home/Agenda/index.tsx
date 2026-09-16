import Link from 'next/link';
import { CalendarDays, ArrowRight } from 'lucide-react';
import type { NextEventData } from '../QuickAccess';
import './style.scss';

const CLASS_NAME = 'agenda-highlight';

type Props = { event: NextEventData };

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

// Variante tourisme (`Tenants.variante`) — la bande agenda n'est plus
// intégrée à `QuickAccess` (« L'essentiel en un clic ») mais devient son
// propre bloc, placé après les dernières actualités municipales. Reprend
// volontairement le même habillage visuel que `QuickAccess.__agenda` (bande
// dégradée, même date-box) pour rester cohérent, mais comme une section à
// part entière plutôt qu'imbriquée dans une carte.
export default function Agenda({ event }: Props) {
	const eventDate = new Date(event.date);

	return (
		<section id="agenda" className={CLASS_NAME}>
			<div className="container">
				<div className={`${CLASS_NAME}__card`}>
					<div className={`${CLASS_NAME}__date`}>
						<span className={`${CLASS_NAME}__date-day`}>{eventDate.getDate()}</span>
						<span className={`${CLASS_NAME}__date-month`}>{monthShort[eventDate.getMonth()]}</span>
					</div>
					<div className={`${CLASS_NAME}__body`}>
						<p className={`${CLASS_NAME}__eyebrow`}>
							<CalendarDays size={14} aria-hidden="true" />
							Prochain rendez-vous
						</p>
						<p className={`${CLASS_NAME}__title`}>{event.title}</p>
					</div>
					<Link href="/agenda" className={`${CLASS_NAME}__link`}>
						Voir l&rsquo;agenda
						<ArrowRight size={16} aria-hidden="true" />
					</Link>
				</div>
			</div>
		</section>
	);
}
