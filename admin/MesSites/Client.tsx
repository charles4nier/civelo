'use client';

import { Building2, ArrowRight, Settings } from 'lucide-react';
import CreateTenantButton from '../CreateTenantButton/Client';
import './style.scss';

type Tenant = { id: string; nom: string; domaine: string; theme: string; statutContrat: string };

const THEME_LABELS: Record<string, string> = { edito: 'Style édito', app: 'App', accueillant: 'Accueillant' };
const STATUT_LABELS: Record<string, string> = { actif: 'Actif', suspendu: 'Suspendu', resilie: 'Résilié' };

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

			<div className="mes-sites__grid">
				{tenants.map((t) => (
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
		</div>
	);
}
