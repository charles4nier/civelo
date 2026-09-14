'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { FileText, Download, Filter, BookOpen } from 'lucide-react';
import PageHeader from '@themes/moderne/components/PageHeader';
import './style.scss';

const B = 'documents';

export type DocumentItemData = {
	key: string;
	title: string;
	type: string;
	date: string; // ISO
	href?: string;
};

type Props = {
	types: string[];
	items: DocumentItemData[];
};

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function DocumentsLayout({ types, items }: Props) {
	const [activeType, setActiveType] = useState<string>(types[0]);
	const [activeYear, setActiveYear] = useState<number | 'Tous'>('Tous');
	const [stuck, setStuck] = useState(false);
	const sentinelRef = useRef<HTMLDivElement>(null);

	const yearValues = useMemo(() => {
		const set = new Set(items.map((d) => new Date(d.date).getFullYear()));
		return Array.from(set).sort((a, b) => b - a);
	}, [items]);

	const filtered = useMemo(
		() =>
			items
				.filter(
					(d) =>
						(activeType === types[0] || d.type === activeType) &&
						(activeYear === 'Tous' || new Date(d.date).getFullYear() === activeYear)
				)
				.sort((a, b) => b.date.localeCompare(a.date)),
		[items, activeType, activeYear, types]
	);

	const counts = useMemo(() => {
		const map: Record<string, number> = { [types[0]]: items.length };
		for (const d of items) map[d.type] = (map[d.type] ?? 0) + 1;
		return map;
	}, [items, types]);

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

	return (
		<>
			<PageHeader
				breadcrumb="Documents & publications"
				eyebrowIcon={BookOpen}
				eyebrow="Votre mairie"
				title="Documents &amp; publications"
				subtitle={<>Comptes-rendus, bulletins, budget, arrêtés et documents d'urbanisme :<br />tous les documents officiels de la commune en un seul endroit.</>}
			/>

			<section className={`${B}__section`}>
				<div ref={sentinelRef} style={{ height: 1 }} />

				<div className={`${B}__toolbar${stuck ? ` ${B}__toolbar--stuck` : ''}`}>
					<div className={`${B}__toolbar-inner container`}>
						<div className={`${B}__head`}>
							<div>
								<p className={`${B}__head-eyebrow`}>Archives</p>
								<h2 className={`${B}__head-count`}>
									<span className={`${B}__head-num`}>{filtered.length}</span> document{filtered.length > 1 ? 's' : ''}
								</h2>
							</div>
							<span className={`${B}__head-label`}>
								<Filter size={14} />
								Filtres
							</span>
						</div>

						<div className={`${B}__pills`}>
							{types.map((t) => (
								<button
									key={t}
									type="button"
									onClick={() => setActiveType(t)}
									className={`${B}__pill${activeType === t ? ` ${B}__pill--active` : ''}`}
								>
									<span>{t}</span>
									<span className={`${B}__pill-count`}>{counts[t] ?? 0}</span>
								</button>
							))}
						</div>

						<div className={`${B}__years`}>
							{(['Tous' as const, ...yearValues]).map((y) => (
								<button
									key={String(y)}
									type="button"
									onClick={() => setActiveYear(y)}
									className={`${B}__year${activeYear === y ? ` ${B}__year--active` : ''}`}
								>
									{y === 'Tous' ? 'Toutes les années' : y}
								</button>
							))}
						</div>
					</div>
				</div>

				<div className={`${B}__body container`}>
					{filtered.length > 0 ? (
						<div className={`${B}__grid`}>
							{filtered.map((doc) => (
								<a key={doc.key} href={doc.href ?? '#'} className={`${B}__card`}>
									<div className={`${B}__card-top`}>
										<span className={`${B}__card-badge`}>{doc.type}</span>
										<span className={`${B}__card-icon`}>
											<FileText size={16} />
										</span>
									</div>
									<h3 className={`${B}__card-title`}>{doc.title}</h3>
									<div className={`${B}__card-foot`}>
										<span className={`${B}__card-date`}>{formatDate(doc.date)}</span>
										<span className={`${B}__card-dl`}>
											<Download size={14} />
											PDF
										</span>
									</div>
								</a>
							))}
						</div>
					) : (
						<p className={`${B}__empty`}>Aucun document ne correspond à votre sélection.</p>
					)}
				</div>
			</section>
		</>
	);
}
