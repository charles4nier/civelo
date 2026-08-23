'use client';

import { useState, useMemo, useEffect, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronDown } from 'lucide-react';
import FilterBar from '@themes/style-edito/components/FilterBar';
import { LucideIconByName } from '@shared/lib/icons';
import './style.scss';

const CLASS_NAME = 'demarches';

export type DemarcheItemData = {
	key: string;
	category: string;
	// Nom d'icône lucide-react — voir shared/lib/icons.ts.
	icon: string;
	title: string;
	summary: string;
	// Rendu déjà résolu par l'appelant (RichText Payload côté Payload, JSX
	// statique côté repli) — voir features/demarches/index.tsx.
	content: ReactNode;
};

type Props = {
	filters: string[];
	items: DemarcheItemData[];
};

function AccordionItem({ item }: { item: DemarcheItemData }) {
	const [open, setOpen] = useState(false);

	return (
		<div className={`${CLASS_NAME}__item${open ? ` ${CLASS_NAME}__item--open` : ''}`}>
			<button
				className={`${CLASS_NAME}__item-header`}
				onClick={() => setOpen((o) => !o)}
				aria-expanded={open}
			>
				<div className={`${CLASS_NAME}__item-icon`}>
					<LucideIconByName name={item.icon} size={18} strokeWidth={1.5} aria-hidden="true" />
				</div>
				<div className={`${CLASS_NAME}__item-meta`}>
					<span className={`${CLASS_NAME}__item-cat`}>{item.category}</span>
					<span className={`${CLASS_NAME}__item-title`}>{item.title}</span>
					<span className={`${CLASS_NAME}__item-summary`}>{item.summary}</span>
				</div>
				<ChevronDown
					size={18}
					className={`${CLASS_NAME}__item-chevron${open ? ` ${CLASS_NAME}__item-chevron--open` : ''}`}
					aria-hidden="true"
				/>
			</button>
			<div className={`${CLASS_NAME}__item-body${open ? ` ${CLASS_NAME}__item-body--open` : ''}`}>
				<div className={`${CLASS_NAME}__item-body-inner`}>{item.content}</div>
			</div>
		</div>
	);
}

export default function DemarchesLayout({ filters, items }: Props) {
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
		() => (active === filters[0] ? items : items.filter((d) => d.category === active)),
		[active, items, filters]
	);

	const counts = useMemo(() => {
		const map: Record<string, number> = { [filters[0]]: items.length };
		for (const d of items) map[d.category] = (map[d.category] ?? 0) + 1;
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
						<span>Mes démarches</span>
					</nav>
					<p className={`${CLASS_NAME}__eyebrow`}>Mairie de Saint-Hilaire-Bonneval</p>
					<h1 className={`${CLASS_NAME}__title`}>Mes démarches</h1>
					<div className={`${CLASS_NAME}__divider`} />
					<p className={`${CLASS_NAME}__subtitle`}>
						État civil, scolarité, urbanisme, environnement :<br />
						toutes les démarches en un seul endroit.
					</p>
				</div>
			</section>

			{/* Démarches */}
			<section className={`${CLASS_NAME}__section`}>
				<div className={`${CLASS_NAME}__header container`}>
					<p className={`${CLASS_NAME}__header-eyebrow`}>Toutes les démarches</p>
					<h2 className={`${CLASS_NAME}__header-title`} aria-live="polite">
						{filtered.length} {filtered.length > 1 ? 'démarches' : 'démarche'}
					</h2>
					<div className={`${CLASS_NAME}__header-divider`} />
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
					variant="warm"
				/>

				<div className={`${CLASS_NAME}__body container`}>
					<div className={`${CLASS_NAME}__list`}>
						{filtered.map((item) => (
							<AccordionItem key={item.key} item={item} />
						))}
					</div>

					<div className={`${CLASS_NAME}__cta`}>
						<div>
							<p className={`${CLASS_NAME}__cta-eyebrow`}>Besoin d'aide ?</p>
							<h3 className={`${CLASS_NAME}__cta-title`}>
								La mairie vous accompagne dans vos démarches
							</h3>
							<p className={`${CLASS_NAME}__cta-desc`}>
								Pour toute question, le secrétariat de mairie est à votre disposition aux
								heures d'ouverture.
							</p>
						</div>
						<a href="mailto:mairie@saint-hilaire-bonneval.fr" className={`${CLASS_NAME}__cta-btn btn-primary`}>
							Contacter la mairie
						</a>
					</div>
				</div>
			</section>
		</>
	);
}
