'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { FileText, Download, Filter, BookOpen } from 'lucide-react';
import PageHeader from '@themes/app/components/PageHeader';
import './style.scss';

const B = 'documents';

type DocumentType = 'Comptes-rendus' | 'Bulletins municipaux' | 'Budget' | 'Arrêtés' | 'Urbanisme';
type Doc = { title: string; type: DocumentType; date: string; href: string };

const docs: Doc[] = [
	{ title: 'Compte-rendu du conseil municipal', type: 'Comptes-rendus', date: '2024-11-14', href: '#' },
	{ title: 'Compte-rendu du conseil municipal', type: 'Comptes-rendus', date: '2024-09-19', href: '#' },
	{ title: 'Compte-rendu du conseil municipal', type: 'Comptes-rendus', date: '2024-06-06', href: '#' },
	{ title: 'Compte-rendu du conseil municipal', type: 'Comptes-rendus', date: '2024-03-28', href: '#' },
	{ title: 'Compte-rendu du conseil municipal', type: 'Comptes-rendus', date: '2024-01-18', href: '#' },
	{ title: 'Compte-rendu du conseil municipal', type: 'Comptes-rendus', date: '2023-11-09', href: '#' },
	{ title: 'Compte-rendu du conseil municipal', type: 'Comptes-rendus', date: '2023-09-14', href: '#' },
	{ title: 'Compte-rendu du conseil municipal', type: 'Comptes-rendus', date: '2023-06-22', href: '#' },
	{ title: 'Compte-rendu du conseil municipal', type: 'Comptes-rendus', date: '2023-03-16', href: '#' },
	{ title: 'Compte-rendu du conseil municipal', type: 'Comptes-rendus', date: '2023-01-12', href: '#' },
	{ title: 'Bulletin municipal — Été 2024', type: 'Bulletins municipaux', date: '2024-07-01', href: '#' },
	{ title: 'Bulletin municipal — Hiver 2023', type: 'Bulletins municipaux', date: '2023-12-01', href: '#' },
	{ title: 'Bulletin municipal — Été 2023', type: 'Bulletins municipaux', date: '2023-07-01', href: '#' },
	{ title: 'Bulletin municipal — Hiver 2022', type: 'Bulletins municipaux', date: '2022-12-01', href: '#' },
	{ title: 'Budget primitif 2024', type: 'Budget', date: '2024-03-28', href: '#' },
	{ title: 'Compte administratif 2023', type: 'Budget', date: '2024-03-28', href: '#' },
	{ title: 'Budget primitif 2023', type: 'Budget', date: '2023-03-16', href: '#' },
	{ title: "Arrêté — Restriction d'eau en période de sécheresse", type: 'Arrêtés', date: '2024-08-05', href: '#' },
	{ title: 'Arrêté — Fermeture temporaire voie communale n°4', type: 'Arrêtés', date: '2024-05-20', href: '#' },
	{ title: 'Arrêté — Organisation du marché annuel', type: 'Arrêtés', date: '2023-09-01', href: '#' },
	{ title: "Plan Local d'Urbanisme (PLU) — Document complet", type: 'Urbanisme', date: '2022-01-15', href: '#' },
	{ title: 'Règlement du PLU', type: 'Urbanisme', date: '2022-01-15', href: '#' },
	{ title: 'Enquête publique — Modification du PLU', type: 'Urbanisme', date: '2023-10-02', href: '#' },
];

const types: ('Tous' | DocumentType)[] = ['Tous', 'Comptes-rendus', 'Bulletins municipaux', 'Budget', 'Arrêtés', 'Urbanisme'];

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function DocumentsPage() {
	const [activeType, setActiveType] = useState<(typeof types)[number]>('Tous');
	const [activeYear, setActiveYear] = useState<number | 'Tous'>('Tous');
	const [stuck, setStuck]           = useState(false);
	const sentinelRef                 = useRef<HTMLDivElement>(null);

	const yearValues = useMemo(() => {
		const set = new Set(docs.map((d) => new Date(d.date).getFullYear()));
		return Array.from(set).sort((a, b) => b - a);
	}, []);

	const filtered = useMemo(() =>
		docs
			.filter((d) => (activeType === 'Tous' || d.type === activeType) && (activeYear === 'Tous' || new Date(d.date).getFullYear() === activeYear))
			.sort((a, b) => b.date.localeCompare(a.date)),
		[activeType, activeYear],
	);

	const counts = useMemo(() => {
		const map: Partial<Record<DocumentType | 'Tous', number>> = { Tous: docs.length };
		for (const d of docs) map[d.type] = (map[d.type] ?? 0) + 1;
		return map;
	}, []);

	useEffect(() => {
		const sentinel = sentinelRef.current;
		if (!sentinel) return;
		const observer = new IntersectionObserver(
			([entry]) => setStuck(!entry.isIntersecting),
			{ rootMargin: '-80px 0px 0px 0px', threshold: 0 },
		);
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

				{/* Barre de filtres sticky */}
				<div className={`${B}__toolbar${stuck ? ` ${B}__toolbar--stuck` : ''}`}>
					<div className={`${B}__toolbar-inner container`}>

						{/* Compteur */}
						<div className={`${B}__head`}>
							<div>
								<p className={`${B}__head-eyebrow`}>Archives</p>
								<h2 className={`${B}__head-count`}>
									<span className={`${B}__head-num`}>{filtered.length}</span>
									{' '}document{filtered.length > 1 ? 's' : ''}
								</h2>
							</div>
							<span className={`${B}__head-label`}>
								<Filter size={14} />
								Filtres
							</span>
						</div>

						{/* Filtres par catégorie */}
						<div className={`${B}__pills`}>
							{types.map((t) => (
								<button
									key={t}
									type="button"
									onClick={() => setActiveType(t)}
									className={`${B}__pill${activeType === t ? ` ${B}__pill--active` : ''}`}
								>
									<span>{t}</span>
									<span className={`${B}__pill-count`}>{counts[t as DocumentType | 'Tous'] ?? 0}</span>
								</button>
							))}
						</div>

						{/* Filtres par année */}
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

				{/* Grille de documents */}
				<div className={`${B}__body container`}>
					{filtered.length > 0 ? (
						<div className={`${B}__grid`}>
							{filtered.map((doc, i) => (
								<a key={i} href={doc.href} className={`${B}__card`}>
									<div className={`${B}__card-top`}>
										<span className={`${B}__card-badge`}>{doc.type}</span>
										<span className={`${B}__card-icon`}><FileText size={16} /></span>
									</div>
									<h3 className={`${B}__card-title`}>{doc.title}</h3>
									<div className={`${B}__card-foot`}>
										<span className={`${B}__card-date`}>{formatDate(doc.date)}</span>
										<span className={`${B}__card-dl`}><Download size={14} />PDF</span>
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
