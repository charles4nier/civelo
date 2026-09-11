'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronRight, FileText, Download, BookOpen } from 'lucide-react';
import FilterBar from '@themes/classique/components/FilterBar';
import type { IconVariant } from '@themes/classique/components/ContactCard';
import './style.scss';

const CLASS_NAME = 'documents';

export type DocumentItemData = {
	key: string;
	title: string;
	type: string;
	typeVariant: IconVariant;
	date: string; // ISO
	href?: string;
};

type Props = {
	filters: string[];
	items: DocumentItemData[];
};

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString('fr-FR', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
}

export default function DocumentLayout({ filters, items }: Props) {
	const [activeType, setActiveType] = useState<string>(filters[0]);
	const [activeYear, setActiveYear] = useState<number | 'Tous'>('Tous');
	const [filtersOpen, setFiltersOpen] = useState(false);
	const [stuck, setStuck] = useState(false);
	const sentinelRef = useRef<HTMLDivElement>(null);

	const yearValues = useMemo(() => {
		const set = new Set(items.map((d) => new Date(d.date).getFullYear()));
		return Array.from(set).sort((a, b) => b - a);
	}, [items]);

	const yearFilters = useMemo(() => ['Toutes les années', ...yearValues.map(String)], [yearValues]);

	const filtered = useMemo(() => {
		return items.filter((d) => {
			const matchType = activeType === filters[0] || d.type === activeType;
			const matchYear = activeYear === 'Tous' || new Date(d.date).getFullYear() === activeYear;
			return matchType && matchYear;
		});
	}, [activeType, activeYear, items, filters]);

	const counts = useMemo(() => {
		const map: Record<string, number> = { [filters[0]]: items.length };
		for (const d of items) map[d.type] = (map[d.type] ?? 0) + 1;
		return map;
	}, [items, filters]);

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
				<div className={`${CLASS_NAME}__hero-blur ${CLASS_NAME}__hero-blur--top`} />
				<div className={`${CLASS_NAME}__hero-blur ${CLASS_NAME}__hero-blur--bottom`} />
				<div className={`${CLASS_NAME}__hero-content`}>
					<nav className={`${CLASS_NAME}__breadcrumb`} aria-label="Fil d'Ariane">
						<Link href="/">Accueil</Link>
						<ChevronRight size={14} aria-hidden="true" />
						<Link href="/mairie">Votre mairie</Link>
						<ChevronRight size={14} aria-hidden="true" />
						<span>Documents &amp; publications</span>
					</nav>
					<p className={`${CLASS_NAME}__eyebrow`}>
						<BookOpen size={14} aria-hidden="true" />
						Votre mairie
					</p>
					<h1 className={`${CLASS_NAME}__title`}>Documents &amp; publications</h1>
					<div className={`${CLASS_NAME}__divider`} />
					<p className={`${CLASS_NAME}__subtitle`}>
						Comptes-rendus, bulletins, budget, arrêtés et documents d'urbanisme :<br />
						tous les documents officiels de la commune en un seul endroit.
					</p>
				</div>
			</section>

			{/* Documents */}
			<section className={`${CLASS_NAME}__section`}>
				<div className={`${CLASS_NAME}__header container`}>
					<p className={`${CLASS_NAME}__header-eyebrow`}>Archives officielles</p>
					<h2 className={`${CLASS_NAME}__header-title`} aria-live="polite">
						{filtered.length} {filtered.length > 1 ? 'documents' : 'document'}
					</h2>
					<div className={`${CLASS_NAME}__header-divider`} />
				</div>

				<div ref={sentinelRef} style={{ height: 1 }} />
				<FilterBar
					filters={filters}
					active={activeType}
					counts={counts}
					onSelect={(f) => {
						setActiveType(f);
						setFiltersOpen(false);
					}}
					stuck={stuck}
					filtersOpen={filtersOpen}
					onToggle={() => setFiltersOpen((o) => !o)}
					variant="warm"
					secondary={{
						filters: yearFilters,
						active: activeYear === 'Tous' ? 'Toutes les années' : String(activeYear),
						onSelect: (f) => {
							setActiveYear(f === 'Toutes les années' ? 'Tous' : Number(f));
							setFiltersOpen(false);
						}
					}}
				/>

				<div className={`${CLASS_NAME}__body container`}>
					{filtered.length > 0 ? (
						<div className={`${CLASS_NAME}__grid`}>
							{filtered
								.sort((a, b) => b.date.localeCompare(a.date))
								.map((doc) => (
									<a
										key={doc.key}
										href={doc.href ?? '#'}
										download={Boolean(doc.href)}
										target={doc.href ? '_blank' : undefined}
										rel="noopener noreferrer"
										className={`${CLASS_NAME}__card`}
									>
										<div className={`${CLASS_NAME}__card-icon ${CLASS_NAME}__card-icon--${doc.typeVariant}`}>
											<FileText size={18} strokeWidth={1.75} aria-hidden="true" />
										</div>
										<div className={`${CLASS_NAME}__card-body`}>
											<span className={`${CLASS_NAME}__card-type`}>{doc.type}</span>
											<p className={`${CLASS_NAME}__card-title`}>{doc.title}</p>
											<span className={`${CLASS_NAME}__card-date`}>{formatDate(doc.date)}</span>
										</div>
										<div className={`${CLASS_NAME}__card-download`}>
											<Download size={14} aria-hidden="true" />
										</div>
									</a>
								))}
						</div>
					) : (
						<p className={`${CLASS_NAME}__empty`}>Aucun document pour cette sélection.</p>
					)}
				</div>
			</section>
		</>
	);
}
