'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import ContactCard, { type ContactItem, type IconVariant } from '@themes/preau/components/ContactCard';
import FilterBar from '@themes/preau/components/FilterBar';
import PageHeader from '@themes/preau/components/PageHeader';
import CtaBanner from '@themes/preau/components/CtaBanner';
import { LucideIconByName } from '@shared/lib/icons';
import './style.scss';

const B = 'annuaire';

export type AnnuaireCardData = {
	key: string;
	// Nom d'icône lucide-react (ex. venu de Payload) plutôt qu'une référence
	// de composant — voir shared/lib/icons.ts.
	icon: string;
	iconVariant: IconVariant;
	category: string;
	name: string;
	badge?: string;
	description?: string;
	contacts?: ContactItem[];
};

type CtaProps = {
	eyebrow: string;
	title: string;
	desc: string;
	email: string;
	buttonLabel?: string;
};

type Props = {
	breadcrumbLabel: string;
	// Nom d'icône lucide-react (pas une référence de composant) — cette page
	// est un Client Component ('use client' ci-dessus), et une référence de
	// composant reçue en prop depuis un Server Component (la page qui utilise
	// ce layout) n'est pas sérialisable à travers cette frontière (planté en
	// conditions réelles : "Only plain objects can be passed to Client
	// Components from Server Components").
	eyebrowIcon: string;
	eyebrowText: string;
	title: string;
	subtitle: React.ReactNode;
	sectionEyebrow: string;
	countSingular: string;
	countPlural: string;
	filters: string[];
	cards: AnnuaireCardData[];
	cta?: CtaProps;
};

export default function AnnuaireLayout({
	breadcrumbLabel,
	eyebrowIcon,
	eyebrowText,
	title,
	subtitle,
	sectionEyebrow,
	countSingular,
	countPlural,
	filters,
	cards,
	cta,
}: Props) {
	const [active, setActive] = useState(filters[0]);
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
		() => (active === filters[0] ? cards : cards.filter((c) => c.category === active)),
		[active, cards, filters]
	);

	const counts = useMemo(() => {
		const map: Record<string, number> = { [filters[0]]: cards.length };
		for (const c of cards) map[c.category] = (map[c.category] ?? 0) + 1;
		return map;
	}, [cards, filters]);

	const count = filtered.length;
	const countLabel = count > 1 ? countPlural : countSingular;

	return (
		<>
			<PageHeader
				breadcrumb={breadcrumbLabel}
				eyebrowIcon={(props) => <LucideIconByName name={eyebrowIcon} {...props} />}
				eyebrow={eyebrowText}
				title={title}
				subtitle={subtitle}
			/>

			<section className={`${B}__section`}>
				<div className={`${B}__head container`}>
					<p className={`${B}__head-eyebrow`}>{sectionEyebrow}</p>
					<h2 className={`${B}__head-title`}>
						<span className={`${B}__head-num`}>{count}</span> {countLabel}
					</h2>
				</div>

				<div ref={sentinelRef} style={{ height: 1 }} />

				<FilterBar
					filters={filters}
					active={active}
					counts={counts}
					onSelect={(f) => { setActive(f); setFiltersOpen(false); }}
					stuck={stuck}
					filtersOpen={filtersOpen}
					onToggle={() => setFiltersOpen((o) => !o)}
					variant="warm"
				/>

				<div className={`${B}__body container`}>
					<div className={`${B}__grid`}>
						{filtered.map((card) => (
							<ContactCard
								key={card.key}
								icon={card.icon}
								iconVariant={card.iconVariant}
								category={card.category}
								name={card.name}
								badge={card.badge}
								description={card.description}
								contacts={card.contacts}
							/>
						))}
					</div>

					{cta && (
						<CtaBanner
							eyebrow={cta.eyebrow}
							title={cta.title}
							desc={cta.desc}
							href={`mailto:${cta.email}`}
							buttonLabel={cta.buttonLabel}
						/>
					)}
				</div>
			</section>
		</>
	);
}
