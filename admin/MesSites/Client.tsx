'use client';

import { useMemo, useState } from 'react';
import { Building2, ArrowRight, Settings, Search } from 'lucide-react';
import CreateTenantButton from '../CreateTenantButton/Client';
import './style.scss';

type Tenant = { id: string; nom: string; domaine: string; theme: string; statutContrat: string; createdAt?: string };

const THEME_LABELS: Record<string, string> = { edito: 'Style édito', app: 'App', accueillant: 'Accueillant' };
const STATUT_LABELS: Record<string, string> = { actif: 'Actif', suspendu: 'Suspendu', resilie: 'Résilié' };
const STATUT_ORDER = ['actif', 'suspendu', 'resilie'];

type Props = { tenants: Tenant[] };

// Bascule de tenant en écriture directe du cookie `payload-tenant` — même
// mécanisme que le sélecteur du plugin multi-tenant (voir `middleware.ts`).
// Navigation complète (pas un `router.push`) volontaire : force une
// résolution serveur fraîche de la liste de pages avec le nouveau tenant,
// plutôt que de dépendre de l'état client interne du plugin.
function openSite(tenantId: string) {
	document.cookie = `payload-tenant=${tenantId}; path=/; SameSite=Lax`;
	window.location.href = '/admin/collections/pages';
}

export default function MesSitesClient({ tenants }: Props) {
	const [search, setSearch] = useState('');

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return tenants;
		return tenants.filter((t) => t.nom.toLowerCase().includes(q) || t.domaine.toLowerCase().includes(q));
	}, [tenants, search]);

	const statutCounts = useMemo(() => {
		const counts: Record<string, number> = {};
		for (const t of tenants) counts[t.statutContrat] = (counts[t.statutContrat] ?? 0) + 1;
		return counts;
	}, [tenants]);

	const themeCounts = useMemo(() => {
		const counts: Record<string, number> = {};
		for (const t of tenants) counts[t.theme] = (counts[t.theme] ?? 0) + 1;
		return counts;
	}, [tenants]);

	const recent = useMemo(
		() =>
			[...tenants]
				.filter((t) => t.createdAt)
				.sort((a, b) => (b.createdAt! > a.createdAt! ? 1 : -1))
				.slice(0, 3),
		[tenants]
	);

	return (
		<div className="mes-sites">
			<div className="mes-sites__header">
				<div>
					<h1 className="mes-sites__title">Mes sites</h1>
					<p className="mes-sites__subtitle">
						{tenants.length} commune{tenants.length > 1 ? 's' : ''}
					</p>
				</div>
				<CreateTenantButton isSuperAdminConsole />
			</div>

			<div className="mes-sites__layout">
				<div className="mes-sites__main">
					<div className="mes-sites__search">
						<Search size={16} aria-hidden="true" />
						<input
							type="text"
							placeholder="Rechercher un site (nom, domaine)…"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>

					{filtered.length === 0 ? (
						<p className="mes-sites__empty">Aucun site ne correspond à « {search} ».</p>
					) : (
						<div className="mes-sites__grid">
							{filtered.map((t) => (
								<div key={t.id} className="mes-sites__card">
									<button type="button" className="mes-sites__card-main" onClick={() => openSite(t.id)}>
										<div className="mes-sites__card-icon">
											<Building2 size={20} aria-hidden="true" />
										</div>
										<div className="mes-sites__card-body">
											<h2 className="mes-sites__card-name">{t.nom}</h2>
											<p className="mes-sites__card-domain">{t.domaine}</p>
											<div className="mes-sites__card-meta">
												<span className="mes-sites__card-theme">{THEME_LABELS[t.theme] ?? t.theme}</span>
												<span className={`mes-sites__card-statut mes-sites__card-statut--${t.statutContrat}`}>
													{STATUT_LABELS[t.statutContrat] ?? t.statutContrat}
												</span>
											</div>
										</div>
										<ArrowRight size={18} className="mes-sites__card-arrow" aria-hidden="true" />
									</button>
									<a
										href={`/admin/collections/tenants/${t.id}`}
										className="mes-sites__card-settings"
										title="Modifier la fiche commune (domaine, thème, statut…)"
										onClick={(e) => e.stopPropagation()}
									>
										<Settings size={15} aria-hidden="true" />
									</a>
								</div>
							))}
						</div>
					)}
				</div>

				<aside className="mes-sites__aside">
					<div className="mes-sites__aside-block">
						<h3 className="mes-sites__aside-title">Statuts</h3>
						<ul className="mes-sites__stat-list">
							{STATUT_ORDER.filter((s) => statutCounts[s]).map((s) => (
								<li key={s} className="mes-sites__stat-row">
									<span className={`mes-sites__stat-dot mes-sites__stat-dot--${s}`} />
									<span className="mes-sites__stat-label">{STATUT_LABELS[s] ?? s}</span>
									<span className="mes-sites__stat-count">{statutCounts[s]}</span>
								</li>
							))}
						</ul>
					</div>

					<div className="mes-sites__aside-block">
						<h3 className="mes-sites__aside-title">Thèmes</h3>
						<ul className="mes-sites__stat-list">
							{Object.entries(themeCounts).map(([theme, count]) => (
								<li key={theme} className="mes-sites__stat-row">
									<span className="mes-sites__stat-label">{THEME_LABELS[theme] ?? theme}</span>
									<span className="mes-sites__stat-count">{count}</span>
								</li>
							))}
						</ul>
					</div>

					{recent.length > 0 && (
						<div className="mes-sites__aside-block">
							<h3 className="mes-sites__aside-title">Derniers créés</h3>
							<ul className="mes-sites__recent-list">
								{recent.map((t) => (
									<li key={t.id}>
										<button type="button" className="mes-sites__recent-item" onClick={() => openSite(t.id)}>
											{t.nom}
										</button>
									</li>
								))}
							</ul>
						</div>
					)}
				</aside>
			</div>
		</div>
	);
}
