import Link from 'next/link';
import { ArrowUpRight, CalendarDays, ArrowRight } from 'lucide-react';
import { LucideIconByName } from '@shared/lib/icons';
import './style.scss';

const CLASS_NAME = 'quick-access';

export type QuickAccessItemData = {
	key: string;
	icon: string;
	title: string;
	desc?: string;
	href: string;
};

export type NextEventData = {
	title: string;
	date: string; // ISO
};

type Props = {
	items: QuickAccessItemData[];
	nextEvent?: NextEventData | null;
	// Le chevauchement `-80px` (voir style.scss) est calibré pour flotter
	// par-dessus le bas du Hero (grande photo sombre en pleine largeur) —
	// c'est le seul cas où ce bloc suit directement le Hero (variante
	// défaut). En variante tourisme, il suit `MayorWord` (section claire,
	// padding normal) : le même chevauchement mordrait dans le padding bas
	// de `MayorWord` sans jamais l'atteindre visuellement, laissant un
	// grand vide entre les deux. `overlapPrevious: false` désactive ce
	// chevauchement dans ce cas.
	overlapPrevious?: boolean;
};

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

export default function QuickAccess({ items, nextEvent, overlapPrevious = true }: Props) {
	const nextEventDate = nextEvent ? new Date(nextEvent.date) : null;

	return (
		<section id="demarches" className={`${CLASS_NAME}${overlapPrevious ? '' : ` ${CLASS_NAME}--flush`}`}>
			<div className="container">
				<div className={`${CLASS_NAME}__card`}>
					<div className={`${CLASS_NAME}__header`}>
						<div>
							<p className="eyebrow">Services en ligne</p>
							<h2 className={`${CLASS_NAME}__title`}>L'essentiel en un clic</h2>
						</div>
					</div>

					<div className={`${CLASS_NAME}__grid`}>
						{items.map((item, i) => {
							const mod = ['primary', 'coral', 'leaf'][i % 3];
							return (
								<a key={item.key} href={item.href} className={`${CLASS_NAME}__item`}>
									<div className={`${CLASS_NAME}__item-icon ${CLASS_NAME}__item-icon--${mod}`}>
										<LucideIconByName name={item.icon} size={20} strokeWidth={2} aria-hidden="true" />
									</div>
									<h3 className={`${CLASS_NAME}__item-title`}>{item.title}</h3>
									{item.desc && <p className={`${CLASS_NAME}__item-desc`}>{item.desc}</p>}
									<ArrowUpRight size={16} className={`${CLASS_NAME}__item-arrow`} aria-hidden="true" />
								</a>
							);
						})}
					</div>

					{nextEvent && nextEventDate && (
						<div className={`${CLASS_NAME}__agenda`}>
							<div className={`${CLASS_NAME}__agenda-date`}>
								<span className={`${CLASS_NAME}__agenda-date-day`}>{nextEventDate.getDate()}</span>
								<span className={`${CLASS_NAME}__agenda-date-month`}>
									{monthShort[nextEventDate.getMonth()]}
								</span>
							</div>
							<div className={`${CLASS_NAME}__agenda-body`}>
								<p className={`${CLASS_NAME}__agenda-eyebrow`}>
									<CalendarDays size={14} aria-hidden="true" />
									Prochain rendez-vous
								</p>
								<p className={`${CLASS_NAME}__agenda-title`}>{nextEvent.title}</p>
							</div>
							<Link href="/agenda" className={`${CLASS_NAME}__agenda-link`}>
								Voir l&rsquo;agenda
								<ArrowRight size={16} aria-hidden="true" />
							</Link>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
