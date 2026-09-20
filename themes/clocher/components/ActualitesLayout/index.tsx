'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Calendar, ChevronRight, Newspaper, Download, Tag } from 'lucide-react';
import FilterBar from '@themes/clocher/components/FilterBar';
import type { IconVariant } from '@themes/clocher/components/ContactCard';
import './style.scss';

const CLASS_NAME = 'actualites';

export type ActualiteItemData = {
	key: string;
	title: string;
	category: string;
	categoryVariant: IconVariant;
	date: string; // ISO
	excerpt: string;
	documentHref?: string;
};

type Props = {
	filters: string[];
	items: ActualiteItemData[];
};

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString('fr-FR', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
}

export default function ActualitesLayout({ filters, items }: Props) {
	const [active, setActive] = useState<string>(filters[0]);
	const [stuck, setStuck] = useState(false);
	const [filtersOpen, setFiltersOpen] = useState(false);
	const sentinelRef = useRef<HTMLDivElement>(null);

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

	const filtered = useMemo(
		() => (active === filters[0] ? items : items.filter((a) => a.category === active)),
		[active, items, filters]
	);

	const counts = useMemo(() => {
		const map: Record<string, number> = { [filters[0]]: items.length };
		for (const a of items) map[a.category] = (map[a.category] ?? 0) + 1;
		return map;
	}, [items, filters]);

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
						<span>Actualités</span>
					</nav>
					<p className={`${CLASS_NAME}__eyebrow`}>
						<Newspaper size={14} aria-hidden="true" />
						Mairie de Saint-Martin
					</p>
					<h1 className={`${CLASS_NAME}__title`}>Actualités</h1>
					<div className={`${CLASS_NAME}__divider`} />
					<p className={`${CLASS_NAME}__subtitle`}>
						Conseil municipal, vie locale, travaux et événements :
						<br />
						toutes les nouvelles de la commune.
					</p>
				</div>
			</section>

			{/* Articles */}
			<section className={`${CLASS_NAME}__section`}>
				<div className={`${CLASS_NAME}__inner container`}>
					<div className={`${CLASS_NAME}__header`}>
						<p className={`${CLASS_NAME}__header-eyebrow`}>Fil d'actualité</p>
						<h2 className={`${CLASS_NAME}__header-title`} aria-live="polite">
							{filtered.length} {filtered.length > 1 ? 'articles' : 'article'}
						</h2>
						<div className={`${CLASS_NAME}__header-divider`} />
					</div>

					<div ref={sentinelRef} style={{ height: 1, marginBottom: -1 }} />
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
						variant="warm"
					/>

					<div className={`${CLASS_NAME}__grid`}>
						{filtered.map((article) =>
							article.documentHref ? (
								<Link
									key={article.key}
									href={article.documentHref}
									className={`${CLASS_NAME}__card ${CLASS_NAME}__card--document`}
								>
									<div className={`${CLASS_NAME}__card-top`}>
										<span
											className={`${CLASS_NAME}__card-cat ${CLASS_NAME}__card-cat--${article.categoryVariant}`}
										>
											<Tag size={11} aria-hidden="true" />
											{article.category}
										</span>
										<span className={`${CLASS_NAME}__card-date`}>
											<Calendar size={12} aria-hidden="true" />
											{formatDate(article.date)}
										</span>
									</div>
									<h2 className={`${CLASS_NAME}__card-title`}>{article.title}</h2>
									<p className={`${CLASS_NAME}__card-excerpt`}>{article.excerpt}</p>
									<div className={`${CLASS_NAME}__card-link`}>
										Voir le document
										<Download size={14} aria-hidden="true" />
									</div>
								</Link>
							) : (
								<article key={article.key} className={`${CLASS_NAME}__card`}>
									<div className={`${CLASS_NAME}__card-top`}>
										<span
											className={`${CLASS_NAME}__card-cat ${CLASS_NAME}__card-cat--${article.categoryVariant}`}
										>
											<Tag size={11} aria-hidden="true" />
											{article.category}
										</span>
										<span className={`${CLASS_NAME}__card-date`}>
											<Calendar size={12} aria-hidden="true" />
											{formatDate(article.date)}
										</span>
									</div>
									<h2 className={`${CLASS_NAME}__card-title`}>{article.title}</h2>
									<p className={`${CLASS_NAME}__card-excerpt`}>{article.excerpt}</p>
								</article>
							)
						)}
					</div>
				</div>
			</section>
		</>
	);
}
