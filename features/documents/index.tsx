'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronRight, FileText, Download, BookOpen } from 'lucide-react';
import FilterBar from '@shared/components/FilterBar';
import './style.scss';

const CLASS_NAME = 'documents';

export type DocumentType =
	| 'Comptes-rendus'
	| 'Bulletins municipaux'
	| 'Budget'
	| 'Arrêtés'
	| 'Urbanisme';

export type Doc = {
	title: string;
	type: DocumentType;
	date: string;
	href: string;
};

export const docs: Doc[] = [
	// Comptes-rendus
	{
		title: 'Compte-rendu du conseil municipal',
		type: 'Comptes-rendus',
		date: '2024-11-14',
		href: '#'
	},
	{
		title: 'Compte-rendu du conseil municipal',
		type: 'Comptes-rendus',
		date: '2024-09-19',
		href: '#'
	},
	{
		title: 'Compte-rendu du conseil municipal',
		type: 'Comptes-rendus',
		date: '2024-06-06',
		href: '#'
	},
	{
		title: 'Compte-rendu du conseil municipal',
		type: 'Comptes-rendus',
		date: '2024-03-28',
		href: '#'
	},
	{
		title: 'Compte-rendu du conseil municipal',
		type: 'Comptes-rendus',
		date: '2024-01-18',
		href: '#'
	},
	{
		title: 'Compte-rendu du conseil municipal',
		type: 'Comptes-rendus',
		date: '2023-11-09',
		href: '#'
	},
	{
		title: 'Compte-rendu du conseil municipal',
		type: 'Comptes-rendus',
		date: '2023-09-14',
		href: '#'
	},
	{
		title: 'Compte-rendu du conseil municipal',
		type: 'Comptes-rendus',
		date: '2023-06-22',
		href: '#'
	},
	{
		title: 'Compte-rendu du conseil municipal',
		type: 'Comptes-rendus',
		date: '2023-03-16',
		href: '#'
	},
	{
		title: 'Compte-rendu du conseil municipal',
		type: 'Comptes-rendus',
		date: '2023-01-12',
		href: '#'
	},
	{
		title: 'Compte-rendu du conseil municipal',
		type: 'Comptes-rendus',
		date: '2022-11-17',
		href: '#'
	},
	{
		title: 'Compte-rendu du conseil municipal',
		type: 'Comptes-rendus',
		date: '2022-09-08',
		href: '#'
	},
	{
		title: 'Compte-rendu du conseil municipal',
		type: 'Comptes-rendus',
		date: '2022-06-23',
		href: '#'
	},

	// Bulletins
	{
		title: 'Bulletin municipal — Été 2024',
		type: 'Bulletins municipaux',
		date: '2024-07-01',
		href: '#'
	},
	{
		title: 'Bulletin municipal — Hiver 2023',
		type: 'Bulletins municipaux',
		date: '2023-12-01',
		href: '#'
	},
	{
		title: 'Bulletin municipal — Été 2023',
		type: 'Bulletins municipaux',
		date: '2023-07-01',
		href: '#'
	},
	{
		title: 'Bulletin municipal — Hiver 2022',
		type: 'Bulletins municipaux',
		date: '2022-12-01',
		href: '#'
	},
	{
		title: 'Bulletin municipal — Été 2022',
		type: 'Bulletins municipaux',
		date: '2022-07-01',
		href: '#'
	},

	// Budget
	{
		title: 'Budget primitif 2024',
		type: 'Budget',
		date: '2024-03-28',
		href: '#'
	},
	{
		title: 'Compte administratif 2023',
		type: 'Budget',
		date: '2024-03-28',
		href: '#'
	},
	{
		title: 'Budget primitif 2023',
		type: 'Budget',
		date: '2023-03-16',
		href: '#'
	},
	{
		title: 'Compte administratif 2022',
		type: 'Budget',
		date: '2023-03-16',
		href: '#'
	},

	// Arrêtés
	{
		title: "Arrêté — Restriction d'eau en période de sécheresse",
		type: 'Arrêtés',
		date: '2024-08-05',
		href: '#'
	},
	{
		title: 'Arrêté — Fermeture temporaire de la voie communale n°4',
		type: 'Arrêtés',
		date: '2024-05-20',
		href: '#'
	},
	{
		title: 'Arrêté — Organisation du marché annuel',
		type: 'Arrêtés',
		date: '2023-09-01',
		href: '#'
	},

	// Urbanisme
	{
		title: "Plan Local d'Urbanisme (PLU) — Document complet",
		type: 'Urbanisme',
		date: '2022-01-15',
		href: '#'
	},
	{
		title: 'Règlement du PLU',
		type: 'Urbanisme',
		date: '2022-01-15',
		href: '#'
	},
	{
		title: 'Enquête publique — Modification du PLU',
		type: 'Urbanisme',
		date: '2023-10-02',
		href: '#'
	}
];

const types: ('Tous' | DocumentType)[] = [
	'Tous',
	'Comptes-rendus',
	'Bulletins municipaux',
	'Budget',
	'Arrêtés',
	'Urbanisme'
];

const typeMeta: Record<DocumentType, string> = {
	'Comptes-rendus': 'primary',
	'Bulletins municipaux': 'coral',
	Budget: 'leaf',
	Arrêtés: 'terracotta',
	Urbanisme: 'muted'
};

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString('fr-FR', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
}

export default function DocumentsPage() {
	const [activeType, setActiveType] =
		useState<(typeof types)[number]>('Tous');
	const [activeYear, setActiveYear] = useState<number | 'Tous'>('Tous');
	const [filtersOpen, setFiltersOpen] = useState(false);
	const [stuck, setStuck] = useState(false);
	const sentinelRef = useRef<HTMLDivElement>(null);

	const yearValues = useMemo(() => {
		const set = new Set(docs.map((d) => new Date(d.date).getFullYear()));
		return Array.from(set).sort((a, b) => b - a);
	}, []);

	const yearFilters = useMemo(
		() => ['Toutes les années', ...yearValues.map(String)],
		[yearValues]
	);

	const filtered = useMemo(() => {
		return docs.filter((d) => {
			const matchType = activeType === 'Tous' || d.type === activeType;
			const matchYear =
				activeYear === 'Tous' ||
				new Date(d.date).getFullYear() === activeYear;
			return matchType && matchYear;
		});
	}, [activeType, activeYear]);

	const counts = useMemo(() => {
		const map: Partial<Record<DocumentType | 'Tous', number>> = {
			Tous: docs.length
		};
		for (const d of docs) map[d.type] = (map[d.type] ?? 0) + 1;
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
						<Link href="/mairie">Votre mairie</Link>
						<ChevronRight size={14} aria-hidden="true" />
						<span>Documents &amp; publications</span>
					</nav>
					<p className={`${CLASS_NAME}__eyebrow`}>
						<BookOpen size={14} aria-hidden="true" />
						Votre mairie
					</p>
					<h1 className={`${CLASS_NAME}__title`}>
						Documents &amp; publications
					</h1>
					<div className={`${CLASS_NAME}__divider`} />
					<p className={`${CLASS_NAME}__subtitle`}>
						Comptes-rendus, bulletins, budget, arrêtés et documents
						d'urbanisme :<br />
						tous les documents officiels de la commune en un seul
						endroit.
					</p>
				</div>
			</section>

			{/* Documents */}
			<section className={`${CLASS_NAME}__section`}>
				<div className={`${CLASS_NAME}__header container`}>
					<p className={`${CLASS_NAME}__header-eyebrow`}>
						Archives officielles
					</p>
					<h2 className={`${CLASS_NAME}__header-title`} aria-live="polite">
						{filtered.length}{' '}
						{filtered.length > 1 ? 'documents' : 'document'}
					</h2>
					<div className={`${CLASS_NAME}__header-divider`} />
				</div>

				<div ref={sentinelRef} style={{ height: 1 }} />
				<FilterBar
					filters={types}
					active={activeType}
					counts={counts as Record<string, number>}
					onSelect={(f) => {
						setActiveType(f as typeof activeType);
						setFiltersOpen(false);
					}}
					stuck={stuck}
					filtersOpen={filtersOpen}
					onToggle={() => setFiltersOpen((o) => !o)}
					variant="warm"
					secondary={{
						filters: yearFilters,
						active:
							activeYear === 'Tous'
								? 'Toutes les années'
								: String(activeYear),
						onSelect: (f) => {
							setActiveYear(
								f === 'Toutes les années' ? 'Tous' : Number(f)
							);
							setFiltersOpen(false);
						}
					}}
				/>

				<div className={`${CLASS_NAME}__body container`}>
					{filtered.length > 0 ? (
						<div className={`${CLASS_NAME}__grid`}>
							{filtered
								.sort((a, b) => b.date.localeCompare(a.date))
								.map((doc, i) => (
									<a
										key={i}
										href={doc.href}
										download={doc.href !== '#'}
										target={
											doc.href !== '#'
												? '_blank'
												: undefined
										}
										rel="noopener noreferrer"
										className={`${CLASS_NAME}__card`}
									>
										<div
											className={`${CLASS_NAME}__card-icon ${CLASS_NAME}__card-icon--${typeMeta[doc.type]}`}
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
												{doc.type}
											</span>
											<p
												className={`${CLASS_NAME}__card-title`}
											>
												{doc.title}
											</p>
											<span
												className={`${CLASS_NAME}__card-date`}
											>
												{formatDate(doc.date)}
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
								))}
						</div>
					) : (
						<p className={`${CLASS_NAME}__empty`}>
							Aucun document pour cette sélection.
						</p>
					)}
				</div>
			</section>
		</>
	);
}
