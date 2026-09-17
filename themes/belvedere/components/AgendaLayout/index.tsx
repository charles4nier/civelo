'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Clock, MapPin, CalendarDays } from 'lucide-react';
import PageHeader from '@themes/belvedere/components/PageHeader';
import FilterBar from '@themes/belvedere/components/FilterBar';
import './style.scss';

const B = 'agenda-layout';

export type AgendaEventData = {
	key: string;
	title: string;
	category?: string;
	date: string; // ISO
	time?: string;
	location: string;
	desc?: string;
};

type Props = {
	filters: string[];
	events: AgendaEventData[];
};

const MONTH_SHORT = ['JANV.', 'FÉVR.', 'MARS', 'AVR.', 'MAI', 'JUIN', 'JUIL.', 'AOÛT', 'SEPT.', 'OCT.', 'NOV.', 'DÉC.'];

export default function AgendaLayout({ filters, events }: Props) {
	const [active, setActive] = useState(filters[0]);
	const [stuck, setStuck] = useState(false);
	const [filtersOpen, setFiltersOpen] = useState(false);
	const sentinelRef = useRef<HTMLDivElement>(null);
	const today = useMemo(() => new Date(new Date().toDateString()), []);

	useEffect(() => {
		const sentinel = sentinelRef.current;
		if (!sentinel) return;
		const observer = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting), {
			rootMargin: '-80px 0px 0px 0px',
			threshold: 0
		});
		observer.observe(sentinel);
		return () => observer.disconnect();
	}, []);

	const filtered = useMemo(
		() =>
			(active === filters[0] ? events : events.filter((e) => e.category === active))
				.filter((e) => new Date(e.date) >= today)
				.sort((a, b) => a.date.localeCompare(b.date)),
		[active, events, filters, today]
	);

	const counts = useMemo(() => {
		const map: Record<string, number> = { [filters[0]]: events.length };
		for (const e of events) if (e.category) map[e.category] = (map[e.category] ?? 0) + 1;
		return map;
	}, [events, filters]);

	return (
		<>
			<PageHeader
				breadcrumb="Agenda"
				eyebrowIcon={CalendarDays}
				eyebrow="Vie locale"
				title="Agenda"
				subtitle={<>Conseils municipaux, manifestations et vie associative :<br />tous les rendez-vous à venir dans la commune.</>}
			/>

			<section className={`${B}__section`}>
				<div ref={sentinelRef} style={{ height: 1 }} />
				<FilterBar
					filters={filters}
					active={active}
					counts={counts}
					onSelect={(f) => {
						setActive(f);
						setFiltersOpen(false);
					}}
					stuck={stuck}
					filtersOpen={filtersOpen}
					onToggle={() => setFiltersOpen((o) => !o)}
				/>

				<div className={`${B}__body container`}>
					{filtered.length > 0 ? (
						<div className={`${B}__list`}>
							{filtered.map((e) => {
								const d = new Date(e.date);
								return (
									<article key={e.key} className={`${B}__card`}>
										<div className={`${B}__date`}>
											<span className={`${B}__date-day`}>{d.getDate()}</span>
											<span className={`${B}__date-month`}>{MONTH_SHORT[d.getMonth()]}</span>
										</div>
										<div className={`${B}__body-content`}>
											{e.category && <span className={`${B}__card-badge`}>{e.category}</span>}
											<h3 className={`${B}__card-title`}>{e.title}</h3>
											{e.desc && <p className={`${B}__card-desc`}>{e.desc}</p>}
											<div className={`${B}__card-meta`}>
												{e.time && (
													<span className={`${B}__card-meta-item`}>
														<Clock size={13} />
														{e.time}
													</span>
												)}
												<span className={`${B}__card-meta-item`}>
													<MapPin size={13} />
													{e.location}
												</span>
											</div>
										</div>
									</article>
								);
							})}
						</div>
					) : (
						<p className={`${B}__empty`}>Aucun événement à venir pour le moment.</p>
					)}
				</div>
			</section>
		</>
	);
}
