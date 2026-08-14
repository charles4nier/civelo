'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronRight, CalendarDays, Clock, MapPin } from 'lucide-react';
import FilterBar from '@shared/components/FilterBar';
import { events, type EventCategory } from './data';
import './style.scss';

const CLASS_NAME = 'agenda';

const filters: ('Tous' | EventCategory)[] = [
	'Tous',
	'Conseil municipal',
	'Manifestation',
	'Vie associative',
	'Cérémonie'
];

const categoryVariant: Record<EventCategory, string> = {
	'Conseil municipal': 'primary',
	Manifestation: 'coral',
	'Vie associative': 'leaf',
	Cérémonie: 'muted'
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

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString('fr-FR', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
}

export default function AgendaPage() {
	const [active, setActive] = useState<(typeof filters)[number]>('Tous');
	const [filtersOpen, setFiltersOpen] = useState(false);
	const [stuck, setStuck] = useState(false);
	const sentinelRef = useRef<HTMLDivElement>(null);
	const today = useMemo(() => new Date(new Date().toDateString()), []);

	const filtered = useMemo(() => {
		return events
			.filter((e) => active === 'Tous' || e.category === active)
			.sort((a, b) => a.date.localeCompare(b.date));
	}, [active]);

	const counts = useMemo(() => {
		const map: Record<string, number> = { Tous: events.length };
		for (const e of events) map[e.category] = (map[e.category] ?? 0) + 1;
		return map;
	}, []);

	useEffect(() => {
		const sentinel = sentinelRef.current;
		if (!sentinel) return;
		const observer = new IntersectionObserver(
			([entry]) => setStuck(!entry.isIntersecting),
			{ rootMargin: '-80px 0px 0px 0px', threshold: 0 }
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	}, []);

	return (
		<>
			{/* Hero */}
			<section className={`${CLASS_NAME}__hero`}>
				<div
					className={`${CLASS_NAME}__hero-blur ${CLASS_NAME}__hero-blur--top`}
				/>
				<div
					className={`${CLASS_NAME}__hero-blur ${CLASS_NAME}__hero-blur--bottom`}
				/>
				<div className={`${CLASS_NAME}__hero-content`}>
					<nav className={`${CLASS_NAME}__breadcrumb`} aria-label="Fil d'Ariane">
						<Link href="/">Accueil</Link>
						<ChevronRight size={14} aria-hidden="true" />
						<span>Agenda</span>
					</nav>
					<p className={`${CLASS_NAME}__eyebrow`}>
						<CalendarDays size={14} aria-hidden="true" />
						L&rsquo;essentiel
					</p>
					<h1 className={`${CLASS_NAME}__title`}>Agenda</h1>
					<div className={`${CLASS_NAME}__divider`} />
					<p className={`${CLASS_NAME}__subtitle`}>
						Conseils municipaux, marchés, fêtes et cérémonies :
						<br />
						tous les rendez-vous de la commune.
					</p>
				</div>
			</section>

			{/* Événements */}
			<section className={`${CLASS_NAME}__section`}>
				<div className={`${CLASS_NAME}__header container`}>
					<p className={`${CLASS_NAME}__header-eyebrow`}>
						Rendez-vous communaux
					</p>
					<h2 className={`${CLASS_NAME}__header-title`} aria-live="polite">
						{filtered.length}{' '}
						{filtered.length > 1 ? 'événements' : 'événement'}
					</h2>
					<div className={`${CLASS_NAME}__header-divider`} />
				</div>

				<div ref={sentinelRef} style={{ height: 1 }} />
				<FilterBar
					filters={filters}
					active={active}
					counts={counts}
					onSelect={(f) => {
						setActive(f as typeof active);
						setFiltersOpen(false);
					}}
					stuck={stuck}
					filtersOpen={filtersOpen}
					onToggle={() => setFiltersOpen((o) => !o)}
					variant="warm"
				/>

				<div className={`${CLASS_NAME}__body container`}>
					{filtered.length > 0 ? (
						<div className={`${CLASS_NAME}__list`}>
							{filtered.map((e, i) => {
								const d = new Date(e.date);
								const isPast = d < today;
								return (
									<article
										key={i}
										className={`${CLASS_NAME}__event${isPast ? ` ${CLASS_NAME}__event--past` : ''}`}
									>
										<div
											className={`${CLASS_NAME}__event-date`}
										>
											<span
												className={`${CLASS_NAME}__event-day`}
											>
												{d.getDate()}
											</span>
											<span
												className={`${CLASS_NAME}__event-month`}
											>
												{monthShort[d.getMonth()]}
											</span>
										</div>
										<div
											className={`${CLASS_NAME}__event-body`}
										>
											<div
												className={`${CLASS_NAME}__event-top`}
											>
												<span
													className={`${CLASS_NAME}__event-category ${CLASS_NAME}__event-category--${categoryVariant[e.category]}`}
												>
													{e.category}
												</span>
												{isPast && (
													<span
														className={`${CLASS_NAME}__event-past-tag`}
													>
														Passé
													</span>
												)}
											</div>
											<h3
												className={`${CLASS_NAME}__event-title`}
											>
												{e.title}
											</h3>
											<p
												className={`${CLASS_NAME}__event-desc`}
											>
												{e.desc}
											</p>
											<div
												className={`${CLASS_NAME}__event-meta`}
											>
												<span>
													<CalendarDays
														size={13}
														aria-hidden="true"
													/>{' '}
													{formatDate(e.date)}
												</span>
												{e.time && (
													<span>
														<Clock
															size={13}
															aria-hidden="true"
														/>{' '}
														{e.time}
													</span>
												)}
												<span>
													<MapPin
														size={13}
														aria-hidden="true"
													/>{' '}
													{e.location}
												</span>
											</div>
										</div>
									</article>
								);
							})}
						</div>
					) : (
						<p className={`${CLASS_NAME}__empty`}>
							Aucun événement pour cette sélection.
						</p>
					)}
				</div>
			</section>
		</>
	);
}
