'use client';

import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import './style.scss';

const B = 'filter-bar';

type SecondaryGroup = {
	filters: string[];
	active: string;
	onSelect: (filter: string) => void;
};

type Props = {
	filters: string[];
	active: string;
	counts: Record<string, number>;
	onSelect: (filter: string) => void;
	stuck: boolean;
	filtersOpen: boolean;
	onToggle: () => void;
	variant?: 'default' | 'warm';
	secondary?: SecondaryGroup;
};

export default function FilterBar({
	filters,
	active,
	counts,
	onSelect,
	stuck,
	filtersOpen,
	onToggle,
	variant = 'default',
	secondary
}: Props) {
	const modifiers = [
		stuck && `${B}--stuck`,
		stuck && variant === 'warm' && `${B}--stuck-warm`
	]
		.filter(Boolean)
		.join(' ');

	const badgeCount = [
		active !== filters[0],
		secondary && secondary.active !== secondary.filters[0]
	].filter(Boolean).length;

	return (
		<div className={`${B} ${modifiers}`}>
			<div className="container">
				<button
					className={`${B}__toggle${variant === 'warm' ? ` ${B}__toggle--warm` : ''}`}
					onClick={onToggle}
					aria-expanded={filtersOpen}
				>
					<SlidersHorizontal size={14} aria-hidden="true" />
					<span>Filtres</span>
					{badgeCount > 0 && (
						<span className={`${B}__badge`}>{badgeCount}</span>
					)}
					<ChevronDown
						size={14}
						className={`${B}__arrow${filtersOpen ? ` ${B}__arrow--open` : ''}`}
						aria-hidden="true"
					/>
				</button>
				<div
					className={`${B}__panel${filtersOpen ? ` ${B}__panel--open` : ''}`}
				>
					<div className={`${B}__panel-inner`}>
						<div className={`${B}__pills`}>
							{filters.map((f) => (
								<button
									key={f}
									onClick={() => onSelect(f)}
									className={`${B}__pill${active === f ? ` ${B}__pill--active` : ''}`}
									aria-pressed={active === f}
								>
									{f}
									<span className={`${B}__count`}>
										{counts[f] ?? 0}
									</span>
								</button>
							))}
						</div>
						{secondary && (
							<div className={`${B}__pills ${B}__pills--numeric`}>
								{secondary.filters.map((f) => (
									<button
										key={f}
										onClick={() => secondary.onSelect(f)}
										className={`${B}__pill${secondary.active === f ? ` ${B}__pill--active` : ''}`}
										aria-pressed={secondary.active === f}
									>
										{f}
									</button>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
