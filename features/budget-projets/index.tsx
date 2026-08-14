'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
	ChevronRight,
	FileText,
	Download,
	Landmark,
	Hammer
} from 'lucide-react';
import FilterBar from '@shared/components/FilterBar';
import { entries, type Entry, type ProjetStatus } from './data';
import './style.scss';

const CLASS_NAME = 'budget-projets';

const secondaryFilters = ['Tous', 'Budget', 'Projet'];

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString('fr-FR', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
}

const statusVariant: Record<ProjetStatus, string> = {
	'À venir': 'sunshine',
	'En cours': 'primary',
	Terminé: 'leaf'
};

export default function BudgetProjetsPage() {
	const [activeYear, setActiveYear] = useState('Toutes les années');
	const [activeKind, setActiveKind] =
		useState<(typeof secondaryFilters)[number]>('Tous');
	const [filtersOpen, setFiltersOpen] = useState(false);
	const [stuck, setStuck] = useState(false);
	const sentinelRef = useRef<HTMLDivElement>(null);

	const yearFilters = useMemo(() => {
		const set = new Set(entries.map((e) => new Date(e.date).getFullYear()));
		const years = Array.from(set)
			.sort((a, b) => b - a)
			.map(String);
		return ['Toutes les années', ...years];
	}, []);

	const filtered = useMemo(() => {
		return entries.filter((e) => {
			const matchYear =
				activeYear === 'Toutes les années' ||
				String(new Date(e.date).getFullYear()) === activeYear;
			const matchKind =
				activeKind === 'Tous' ||
				(activeKind === 'Budget' && e.kind === 'budget') ||
				(activeKind === 'Projet' && e.kind === 'projet');
			return matchYear && matchKind;
		});
	}, [activeYear, activeKind]);

	const counts = useMemo(() => {
		const map: Record<string, number> = {
			'Toutes les années': entries.length
		};
		for (const e of entries) {
			const y = String(new Date(e.date).getFullYear());
			map[y] = (map[y] ?? 0) + 1;
		}
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
						<Link href="/mairie/budget-projets">Votre mairie</Link>
						<ChevronRight size={14} aria-hidden="true" />
						<span>Budget &amp; projets</span>
					</nav>
					<p className={`${CLASS_NAME}__eyebrow`}>
						<Landmark size={14} aria-hidden="true" />
						Votre mairie
					</p>
					<h1 className={`${CLASS_NAME}__title`}>
						Budget &amp; projets
					</h1>
					<div className={`${CLASS_NAME}__divider`} />
					<p className={`${CLASS_NAME}__subtitle`}>
						Les finances de la commune et les grands travaux, année
						par année :<br />
						budgets votés, comptes administratifs et projets
						municipaux.
					</p>
				</div>
			</section>

			{/* Contenu */}
			<section className={`${CLASS_NAME}__section`}>
				<div className={`${CLASS_NAME}__header container`}>
					<p className={`${CLASS_NAME}__header-eyebrow`}>
						Finances &amp; travaux
					</p>
					<h2 className={`${CLASS_NAME}__header-title`} aria-live="polite">
						{filtered.length}{' '}
						{filtered.length > 1 ? 'résultats' : 'résultat'}
					</h2>
					<div className={`${CLASS_NAME}__header-divider`} />
				</div>

				<div ref={sentinelRef} style={{ height: 1 }} />
				<FilterBar
					filters={yearFilters}
					active={activeYear}
					counts={counts}
					onSelect={(f) => {
						setActiveYear(f);
						setFiltersOpen(false);
					}}
					stuck={stuck}
					filtersOpen={filtersOpen}
					onToggle={() => setFiltersOpen((o) => !o)}
					variant="warm"
					secondary={{
						filters: secondaryFilters,
						active: activeKind,
						onSelect: (f) => {
							setActiveKind(f as typeof activeKind);
							setFiltersOpen(false);
						}
					}}
				/>

				<div className={`${CLASS_NAME}__body container`}>
					{filtered.length > 0 ? (
						<div className={`${CLASS_NAME}__grid`}>
							{filtered
								.sort((a, b) => b.date.localeCompare(a.date))
								.map((entry: Entry, i) =>
									entry.kind === 'budget' ? (
										<a
											key={i}
											href={entry.href}
											download={entry.href !== '#'}
											target={
												entry.href !== '#'
													? '_blank'
													: undefined
											}
											rel="noopener noreferrer"
											className={`${CLASS_NAME}__card`}
										>
											<div
												className={`${CLASS_NAME}__card-icon ${CLASS_NAME}__card-icon--primary`}
											>
												<FileText
													size={18}
													strokeWidth={1.75}
													aria-hidden="true"
												/>
											</div>
											<div
												className={`${CLASS_NAME}__card-body`}
											>
												<span
													className={`${CLASS_NAME}__card-type`}
												>
													Budget
												</span>
												<p
													className={`${CLASS_NAME}__card-title`}
												>
													{entry.title}
												</p>
												<span
													className={`${CLASS_NAME}__card-date`}
												>
													{formatDate(entry.date)}
												</span>
											</div>
											<div
												className={`${CLASS_NAME}__card-download`}
											>
												<Download
													size={14}
													aria-hidden="true"
												/>
											</div>
										</a>
									) : (
										<article
											key={i}
											className={`${CLASS_NAME}__card ${CLASS_NAME}__card--projet`}
										>
											<div
												className={`${CLASS_NAME}__card-icon ${CLASS_NAME}__card-icon--coral`}
											>
												<Hammer
													size={18}
													strokeWidth={1.75}
													aria-hidden="true"
												/>
											</div>
											<div
												className={`${CLASS_NAME}__card-body`}
											>
												<span
													className={`${CLASS_NAME}__status ${CLASS_NAME}__status--${statusVariant[entry.status]}`}
												>
													{entry.status}
												</span>
												<p
													className={`${CLASS_NAME}__card-title`}
												>
													{entry.title}
												</p>
												<p
													className={`${CLASS_NAME}__card-desc`}
												>
													{entry.desc}
												</p>
												<span
													className={`${CLASS_NAME}__card-date`}
												>
													{formatDate(entry.date)}
												</span>
											</div>
										</article>
									)
								)}
						</div>
					) : (
						<p className={`${CLASS_NAME}__empty`}>
							Aucun résultat pour cette sélection.
						</p>
					)}
				</div>
			</section>
		</>
	);
}
