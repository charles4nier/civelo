'use client';

import { useState, useMemo, useEffect, useRef, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import FilterBar from '@themes/accueillant/components/FilterBar';
import PageHeader from '@themes/accueillant/components/PageHeader';
import CtaBanner from '@themes/accueillant/components/CtaBanner';
import { LucideIconByName } from '@shared/lib/icons';
import './style.scss';

const CLASS_NAME = 'demarches';

export type DemarcheItemData = {
	key: string;
	category: string;
	icon: string;
	title: string;
	summary: string;
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
			<button className={`${CLASS_NAME}__item-header`} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
				<div className={`${CLASS_NAME}__item-icon`}>
					<LucideIconByName name={item.icon} size={18} strokeWidth={1.5} />
				</div>
				<div className={`${CLASS_NAME}__item-meta`}>
					<span className={`${CLASS_NAME}__item-cat`}>{item.category}</span>
					<span className={`${CLASS_NAME}__item-title`}>{item.title}</span>
					<span className={`${CLASS_NAME}__item-summary`}>{item.summary}</span>
				</div>
				<ChevronDown size={18} className={`${CLASS_NAME}__item-chevron${open ? ` ${CLASS_NAME}__item-chevron--open` : ''}`} />
			</button>
			<div className={`${CLASS_NAME}__item-body${open ? ` ${CLASS_NAME}__item-body--open` : ''}`}>
				<div className={`${CLASS_NAME}__item-body-inner`}>{item.content}</div>
			</div>
		</div>
	);
}

export default function DemarchesLayout({ filters, items }: Props) {
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
			<PageHeader
				breadcrumb="Mes démarches"
				eyebrow="Votre mairie"
				title="Mes démarches"
				subtitle={<>État civil, scolarité, urbanisme, environnement :<br />toutes les démarches en un seul endroit.</>}
			/>

			<section className={`${CLASS_NAME}__section`}>
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

					<CtaBanner
						eyebrow="Besoin d'aide ?"
						title="La mairie vous accompagne dans vos démarches"
						desc="Pour toute question, le secrétariat de mairie est à votre disposition aux heures d'ouverture."
						href="mailto:contact@commune.fr"
					/>
				</div>
			</section>
		</>
	);
}
