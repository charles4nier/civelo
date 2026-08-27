import { CalendarDays } from 'lucide-react';
import './style.scss';

const CLASS_NAME = 'news';

const actus = [
	{
		mod: 'coral',
		date: '12 Mai',
		tag: 'Conseil municipal',
		title: 'Compte-rendu de la séance du 5 mai 2026',
		desc: "Budget primitif, voirie communale et nouveaux aménagements de l'étang.",
		href: '/mairie/comptes-rendus'
	},
	{
		mod: 'sky',
		date: '08 Mai',
		tag: 'Vie locale',
		title: 'Marché de producteurs : nouvelle saison',
		desc: 'Tous les samedis matin sur la place du village, de mai à septembre.',
		href: '/mairie/actualites'
	}
];

const agenda = [
	{ day: '22', month: 'Oct', title: 'Marché des producteurs', place: 'Place de la Mairie · 08h00', mod: 'sun' },
	{ day: '28', month: 'Oct', title: 'Conseil municipal', place: 'Salle des actes · 19h00', mod: 'sky' },
	{ day: '05', month: 'Nov', title: 'Loto des associations', place: 'Foyer rural · 14h30', mod: 'coral' }
];

export default function News() {
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
					{actus.map((a) => (
						<article key={a.title} className={`${CLASS_NAME}__card`}>
							<span className={`${CLASS_NAME}__card-accent ${CLASS_NAME}__card-accent--${a.mod}`} />
							<div className={`${CLASS_NAME}__card-meta`}>
								<span className={`${CLASS_NAME}__card-date`}>
									<CalendarDays size={14} />
									{a.date}
								</span>
								<span className={`${CLASS_NAME}__card-dot`}>•</span>
								<span className={`${CLASS_NAME}__card-tag`}>{a.tag}</span>
							</div>
							<h3 className={`${CLASS_NAME}__card-title`}>{a.title}</h3>
							<p className={`${CLASS_NAME}__card-desc`}>{a.desc}</p>
							<a href={a.href} className={`${CLASS_NAME}__card-link`}>
								Lire la suite →
							</a>
						</article>
					))}

					<aside className={`${CLASS_NAME}__agenda`}>
						<h3 className={`${CLASS_NAME}__agenda-title`}>
							Prochains <span className={`${CLASS_NAME}__agenda-title-highlight`}>rendez-vous</span>
						</h3>
						<ul className={`${CLASS_NAME}__agenda-list`}>
							{agenda.map((e) => (
								<li key={e.title} className={`${CLASS_NAME}__agenda-item`}>
									<div className={`${CLASS_NAME}__agenda-date ${CLASS_NAME}__agenda-date--${e.mod}`}>
										<span>{e.day}</span>
										<span>{e.month}</span>
									</div>
									<div className={`${CLASS_NAME}__agenda-info`}>
										<div className={`${CLASS_NAME}__agenda-item-title`}>{e.title}</div>
										<div className={`${CLASS_NAME}__agenda-place`}>{e.place}</div>
									</div>
								</li>
							))}
						</ul>
						<a href="/mairie/actualites" className={`${CLASS_NAME}__agenda-cta`}>
							Voir tout l'agenda →
						</a>
					</aside>
				</div>
			</div>
		</section>
	);
}
