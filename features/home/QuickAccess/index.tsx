import Link from 'next/link';
import {
	FileText,
	Gavel,
	Phone,
	ArrowUpRight,
	CalendarDays,
	ArrowRight
} from 'lucide-react';
import { events } from '@features/agenda/data';
import './style.scss';

const CLASS_NAME = 'quick-access';

const items = [
	{
		icon: FileText,
		title: 'Démarches administratives',
		desc: 'État civil, urbanisme, demandes en quelques clics.',
		mod: 'primary',
		href: '/demarches'
	},
	{
		icon: Gavel,
		title: 'Délibérations & Actes',
		desc: 'Comptes-rendus du conseil municipal et arrêtés.',
		mod: 'coral',
		href: '/mairie/publications'
	},
	{
		icon: Phone,
		title: 'Services & Urgences',
		desc: 'Numéros utiles et services publics à proximité.',
		mod: 'leaf',
		href: '/numeros-utiles'
	}
] as const;

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

export default function QuickAccess() {
	const today = new Date(new Date().toDateString());
	const nextEvent = events
		.filter((e) => new Date(e.date) >= today)
		.sort((a, b) => a.date.localeCompare(b.date))[0];
	const nextEventDate = nextEvent ? new Date(nextEvent.date) : null;

	return (
		<section id="demarches" className={CLASS_NAME}>
			<div className="container">
				<div className={`${CLASS_NAME}__card`}>
					<div className={`${CLASS_NAME}__header`}>
						<div>
							<p className="eyebrow">Services en ligne</p>
							<h2 className={`${CLASS_NAME}__title`}>
								L'essentiel en un clic
							</h2>
						</div>
					</div>

					<div className={`${CLASS_NAME}__grid`}>
						{items.map((item) => {
							const Icon = item.icon;
							return (
								<a
									key={item.title}
									href={item.href}
									className={`${CLASS_NAME}__item`}
								>
									<div
										className={`${CLASS_NAME}__item-icon ${CLASS_NAME}__item-icon--${item.mod}`}
									>
										<Icon
											size={20}
											strokeWidth={2}
											aria-hidden="true"
										/>
									</div>
									<h3 className={`${CLASS_NAME}__item-title`}>
										{item.title}
									</h3>
									<p className={`${CLASS_NAME}__item-desc`}>
										{item.desc}
									</p>
									<ArrowUpRight
										size={16}
										className={`${CLASS_NAME}__item-arrow`}
										aria-hidden="true"
									/>
								</a>
							);
						})}
					</div>

					{nextEvent && nextEventDate && (
						<div className={`${CLASS_NAME}__agenda`}>
							<div className={`${CLASS_NAME}__agenda-date`}>
								<span
									className={`${CLASS_NAME}__agenda-date-day`}
								>
									{nextEventDate.getDate()}
								</span>
								<span
									className={`${CLASS_NAME}__agenda-date-month`}
								>
									{monthShort[nextEventDate.getMonth()]}
								</span>
							</div>
							<div className={`${CLASS_NAME}__agenda-body`}>
								<p className={`${CLASS_NAME}__agenda-eyebrow`}>
									<CalendarDays
										size={14}
										aria-hidden="true"
									/>
									Prochain rendez-vous
								</p>
								<p className={`${CLASS_NAME}__agenda-title`}>
									{nextEvent.title}
								</p>
							</div>
							<Link
								href="/agenda"
								className={`${CLASS_NAME}__agenda-link`}
							>
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
