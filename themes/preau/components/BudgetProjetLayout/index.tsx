'use client';

import { useMemo, useState } from 'react';
import { FileText, Download, Landmark } from 'lucide-react';
import PageHeader from '@themes/preau/components/PageHeader';
import './style.scss';

const B = 'budget-projet-layout';

export type BudgetItemData = { key: string; kind: 'budget'; title: string; date: string; href?: string };
export type ProjetItemData = {
	key: string;
	kind: 'projet';
	title: string;
	date: string;
	status: 'À venir' | 'En cours' | 'Terminé';
	desc?: string;
};
export type BudgetProjetItemData = BudgetItemData | ProjetItemData;

type Props = { items: BudgetProjetItemData[] };

const FILTERS = ['Tous', 'Budget', 'Projet'] as const;

const STATUS_CLASS: Record<ProjetItemData['status'], string> = {
	'À venir': 'sunshine',
	'En cours': 'primary',
	Terminé: 'leaf'
};

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function BudgetProjetLayout({ items }: Props) {
	const [active, setActive] = useState<(typeof FILTERS)[number]>('Tous');

	const filtered = useMemo(
		() =>
			items
				.filter((i) => active === 'Tous' || (active === 'Budget' ? i.kind === 'budget' : i.kind === 'projet'))
				.sort((a, b) => b.date.localeCompare(a.date)),
		[items, active]
	);

	return (
		<>
			<PageHeader
				breadcrumb="Budget & projets"
				eyebrowIcon={Landmark}
				eyebrow="Votre mairie"
				title="Budget & projets"
				subtitle={<>Budgets votés et projets municipaux en cours :<br />la vie financière de la commune, en toute transparence.</>}
			/>

			<section className={`${B}__section container`}>
				<div className={`${B}__filters`}>
					{FILTERS.map((f) => (
						<button
							key={f}
							type="button"
							className={`${B}__filter${active === f ? ` ${B}__filter--active` : ''}`}
							onClick={() => setActive(f)}
						>
							{f}
						</button>
					))}
				</div>

				{filtered.length > 0 ? (
					<div className={`${B}__list`}>
						{filtered.map((item) =>
							item.kind === 'budget' ? (
								<a key={item.key} href={item.href ?? '#'} className={`${B}__card`}>
									<div className={`${B}__card-icon`}>
										<FileText size={18} />
									</div>
									<div className={`${B}__card-body`}>
										<span className={`${B}__card-tag`}>Budget</span>
										<h3 className={`${B}__card-title`}>{item.title}</h3>
										<span className={`${B}__card-date`}>{formatDate(item.date)}</span>
									</div>
									{item.href && (
										<span className={`${B}__card-dl`}>
											<Download size={14} />
											PDF
										</span>
									)}
								</a>
							) : (
								<div key={item.key} className={`${B}__card`}>
									<div className={`${B}__card-icon ${B}__card-icon--alt`}>
										<Landmark size={18} />
									</div>
									<div className={`${B}__card-body`}>
										<span className={`${B}__card-tag`}>Projet</span>
										<h3 className={`${B}__card-title`}>{item.title}</h3>
										{item.desc && <p className={`${B}__card-desc`}>{item.desc}</p>}
										<span className={`${B}__card-date`}>{formatDate(item.date)}</span>
									</div>
									<span className={`${B}__status ${B}__status--${STATUS_CLASS[item.status]}`}>{item.status}</span>
								</div>
							)
						)}
					</div>
				) : (
					<p className={`${B}__empty`}>Aucune entrée pour ce filtre.</p>
				)}
			</section>
		</>
	);
}
