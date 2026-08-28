import { CalendarDays } from 'lucide-react';
import './style.scss';

const CLASS_NAME = 'news';

export type NewsActuData = { key: string; date: string; category?: string; title: string; excerpt: string; documentHref?: string };
export type NewsAgendaData = { key: string; date: string; title: string; location: string };

const ACTU_MODS = ['coral', 'sky'] as const;
const AGENDA_MODS = ['sun', 'sky', 'coral'] as const;

const DATE_FORMAT = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' });
const MONTH_FORMAT = new Intl.DateTimeFormat('fr-FR', { month: 'short' });
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/\.$/, '');

const fallbackActus: NewsActuData[] = [
	{
		key: '0',
		date: '2026-05-12',
		category: 'Conseil municipal',
		title: 'Compte-rendu de la séance du 5 mai 2026',
		excerpt: "Budget primitif, voirie communale et nouveaux aménagements de l'étang.",
		documentHref: '/mairie/comptes-rendus'
	},
	{
		key: '1',
		date: '2026-05-08',
		category: 'Vie locale',
		title: 'Marché de producteurs : nouvelle saison',
		excerpt: 'Tous les samedis matin sur la place du village, de mai à septembre.',
		documentHref: '/mairie/actualites'
	}
];

const fallbackAgenda: NewsAgendaData[] = [
	{ key: '0', date: '2026-10-22', title: 'Marché des producteurs', location: 'Place de la Mairie · 08h00' },
	{ key: '1', date: '2026-10-28', title: 'Conseil municipal', location: 'Salle des actes · 19h00' },
	{ key: '2', date: '2026-11-05', title: 'Loto des associations', location: 'Foyer rural · 14h30' }
];

type Props = { actus?: NewsActuData[]; agenda?: NewsAgendaData[] };

export default function News({ actus = fallbackActus, agenda = fallbackAgenda }: Props) {
	return (
		<section id="actualites" className={CLASS_NAME}>
			<div className="container">
				<div className={`${CLASS_NAME}__header`}>
					<div>
						<span className="eyebrow">Actualités municipales</span>
						<h2 className={`${CLASS_NAME}__title`}>Les dernières nouvelles de la commune</h2>
					</div>
					<a href="/mairie/actualites" className={`${CLASS_NAME}__all-link`}>
						Toutes les actualités →
					</a>
				</div>

				<div className={`${CLASS_NAME}__grid`}>
					{actus.map((a, i) => (
						<article key={a.key} className={`${CLASS_NAME}__card`}>
							<span className={`${CLASS_NAME}__card-accent ${CLASS_NAME}__card-accent--${ACTU_MODS[i % ACTU_MODS.length]}`} />
							<div className={`${CLASS_NAME}__card-meta`}>
								<span className={`${CLASS_NAME}__card-date`}>
									<CalendarDays size={14} />
									{DATE_FORMAT.format(new Date(a.date))}
								</span>
								{a.category && (
									<>
										<span className={`${CLASS_NAME}__card-dot`}>•</span>
										<span className={`${CLASS_NAME}__card-tag`}>{a.category}</span>
									</>
								)}
							</div>
							<h3 className={`${CLASS_NAME}__card-title`}>{a.title}</h3>
							<p className={`${CLASS_NAME}__card-desc`}>{a.excerpt}</p>
							<a href={a.documentHref ?? '/mairie/actualites'} className={`${CLASS_NAME}__card-link`}>
								Lire la suite →
							</a>
						</article>
					))}

					<aside className={`${CLASS_NAME}__agenda`}>
						<h3 className={`${CLASS_NAME}__agenda-title`}>
							Prochains <span className={`${CLASS_NAME}__agenda-title-highlight`}>rendez-vous</span>
						</h3>
						<ul className={`${CLASS_NAME}__agenda-list`}>
							{agenda.map((e, i) => {
								const d = new Date(e.date);
								return (
									<li key={e.key} className={`${CLASS_NAME}__agenda-item`}>
										<div className={`${CLASS_NAME}__agenda-date ${CLASS_NAME}__agenda-date--${AGENDA_MODS[i % AGENDA_MODS.length]}`}>
											<span>{d.getDate().toString().padStart(2, '0')}</span>
											<span>{capitalize(MONTH_FORMAT.format(d))}</span>
										</div>
										<div className={`${CLASS_NAME}__agenda-info`}>
											<div className={`${CLASS_NAME}__agenda-item-title`}>{e.title}</div>
											<div className={`${CLASS_NAME}__agenda-place`}>{e.location}</div>
										</div>
									</li>
								);
							})}
						</ul>
						<a href="/agenda" className={`${CLASS_NAME}__agenda-cta`}>
							Voir tout l'agenda →
						</a>
					</aside>
				</div>
			</div>
		</section>
	);
}
