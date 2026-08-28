'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Calendar, Newspaper, ArrowRight } from 'lucide-react';
import PageHeader from '@themes/accueillant/components/PageHeader';
import FilterBar from '@themes/accueillant/components/FilterBar';
import './style.scss';

const B = 'actualites';

export type ActualiteItemData = {
	key: string;
	title: string;
	category: string;
	date: string; // ISO
	excerpt: string;
	documentHref?: string;
};

type Props = {
	filters: string[];
	items: ActualiteItemData[];
};

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ActualitesLayout({ filters, items }: Props) {
	const [active, setActive] = useState(filters[0]);
	const [stuck, setStuck] = useState(false);
	const [filtersOpen, setFiltersOpen] = useState(false);
	const sentinelRef = useRef<HTMLDivElement>(null);

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
		() => (active === filters[0] ? items : items.filter((a) => a.category === active)).sort((a, b) => b.date.localeCompare(a.date)),
		[active, items, filters]
	);

	const counts = useMemo(() => {
		const map: Record<string, number> = { [filters[0]]: items.length };
		for (const a of items) map[a.category] = (map[a.category] ?? 0) + 1;
		return map;
	}, [items, filters]);

	return (
		<>
			<PageHeader
				breadcrumb="Actualités"
				eyebrowIcon={Newspaper}
				eyebrow="Votre mairie"
				title="Actualités"
				subtitle={<>Conseil municipal, vie locale, travaux et événements :<br />toutes les nouvelles de la commune.</>}
			/>

			<section className={`${B}__section`}>
				<div className={`${B}__head container`}>
					<p className={`${B}__head-eyebrow`}>Fil d'actualité</p>
					<h2 className={`${B}__head-title`}>
						<span className={`${B}__head-num`}>{filtered.length}</span> {filtered.length > 1 ? 'articles' : 'article'}
					</h2>
				</div>

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
					<div className={`${B}__grid`}>
						{filtered.map((article) => (
							<article key={article.key} className={`${B}__card`}>
								<div className={`${B}__card-top`}>
									<span className={`${B}__card-badge`}>{article.category}</span>
									<span className={`${B}__card-date`}>
										<Calendar size={12} />
										{formatDate(article.date)}
									</span>
								</div>
								<h2 className={`${B}__card-title`}>{article.title}</h2>
								<p className={`${B}__card-excerpt`}>{article.excerpt}</p>
								<div className={`${B}__card-link`}>
									Lire la suite <ArrowRight size={14} />
								</div>
							</article>
						))}
					</div>
				</div>
			</section>
		</>
	);
}
