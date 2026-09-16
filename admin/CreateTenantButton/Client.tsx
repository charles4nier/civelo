'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, useModal, Button, useAuth, toast } from '@payloadcms/ui';
import './style.scss';

const MODAL_SLUG = 'create-tenant';

const THEMES = [
	{ value: 'edito', label: 'Style édito' },
	{ value: 'moderne', label: 'Moderne' },
	{ value: 'accueillant', label: 'Accueillant' },
	{ value: 'classique', label: 'Classique' }
];

// Disposition de la page d'accueil (`Tenants.variante`) — pour l'instant
// seul le thème « Style édito » en tient compte (voir
// themes/edito/features/home/index.tsx), les autres thèmes l'ignorent
// silencieusement. Pensé pour grandir : ajouter une variante = une ligne ici
// + une option dans le `select` de Tenants.ts.
const VARIANTES = [
	{ value: 'defaut', label: 'Par défaut' },
	{ value: 'tourisme', label: 'Tourisme' }
];

type Props = { isSuperAdminConsole: boolean };

// "Je veux un create qui ouvre une popin qui permet de générer un nouveau
// tenant." Crée la fiche commune, dont les 18 pages génériques se posent
// automatiquement via le hook `afterChange` de cette collection — rien à
// faire ici pour ça. Le domaine est ensuite ajouté comme domaine
// personnalisé Scalingo via un appel séparé (`/api/tenant-domain/[id]`,
// voir `lib/scalingoDomains.ts`) : seule la configuration DNS chez le
// registraire de la commune reste hors de portée d'une automatisation —
// personne d'autre que la commune ne peut la faire à sa place.
export default function CreateTenantButton({ isSuperAdminConsole }: Props) {
	const { openModal, closeModal } = useModal();
	const router = useRouter();
	const { user } = useAuth();
	const [nom, setNom] = useState('');
	const [domaine, setDomaine] = useState('');
	const [theme, setTheme] = useState('edito');
	const [variante, setVariante] = useState('defaut');
	const [submitting, setSubmitting] = useState(false);

	// Deux gardes combinées, même raison que le lien "Communes" de la nav
	// (admin/Nav/Client.tsx, bug du 27/08/2026) : le rôle seul ne suffit
	// pas, un super-admin verrouillé sur le domaine d'une commune (via
	// `middleware.ts`) reste super-admin — `isSuperAdminConsole` (calculé
	// côté serveur, voir `index.tsx`) exclut ce cas. La protection réelle
	// reste `create: isSuperAdmin` côté collection, ceci évite juste
	// d'afficher un bouton qui n'a de sens que sur la console dédiée.
	if (user?.role !== 'super-admin' || !isSuperAdminConsole) return null;

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		setSubmitting(true);
		try {
			const res = await fetch('/api/tenants', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ nom, domaine, theme, variante })
			});
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data?.errors?.[0]?.message || data?.message || 'Échec de la création.');
			}

			// Séparé de la création elle-même : le seed des 18 pages (hook
			// `afterChange` de `Tenants.ts`) est déjà fiable et silencieux ;
			// l'enregistrement du domaine peut échouer pour des raisons hors
			// de notre contrôle (jeton API absent, domaine déjà pris ailleurs,
			// limite des 20 domaines...) et l'admin doit le savoir clairement
			// plutôt que de découvrir plus tard que le domaine ne répond pas.
			const newTenantId = data?.doc?.id;
			let domainMessage = '';
			if (newTenantId) {
				try {
					const domainRes = await fetch(`/api/tenant-domain/${newTenantId}`, { method: 'POST', credentials: 'include' });
					const domainData = await domainRes.json();
					if (domainData.status === 'created' || domainData.status === 'already-exists') {
						domainMessage = ` Domaine à pointer en CNAME vers ${domainData.cnameTarget}.`;
					} else if (domainData.status === 'not-configured') {
						domainMessage = ' Enregistrement automatique du domaine désactivé (SCALINGO_API_TOKEN absent) — à faire à la main.';
					} else {
						domainMessage = ` Domaine à ajouter à la main (échec auto : ${domainData.message ?? 'inconnu'}).`;
					}
				} catch {
					domainMessage = ' Domaine à ajouter à la main (échec de la requête).';
				}
			}

			toast.success(`« ${nom} » créé, avec ses 18 pages générées automatiquement.${domainMessage}`);
			setNom('');
			setDomaine('');
			setTheme('edito');
			setVariante('defaut');
			closeModal(MODAL_SLUG);
			router.refresh();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Échec de la création.');
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="create-tenant">
			<Button buttonStyle="primary" icon={['plus']} onClick={() => openModal(MODAL_SLUG)}>
				Nouveau site
			</Button>

			<Modal slug={MODAL_SLUG} className="create-tenant__modal">
				<div className="create-tenant__panel">
					<h2 className="create-tenant__title">Créer un nouveau site</h2>
					<p className="create-tenant__hint">
						Ses 18 pages sont générées automatiquement, et le domaine est ajouté automatiquement à l'appli Scalingo — il
						ne reste que la configuration DNS chez le registraire de la commune (CNAME donné après création).
					</p>

					<form onSubmit={handleSubmit} className="create-tenant__form">
						<label className="create-tenant__field">
							<span>Nom de la commune</span>
							<input
								value={nom}
								onChange={(e) => setNom(e.target.value)}
								required
								placeholder="Commune de Saint-Exemple"
							/>
						</label>

						<label className="create-tenant__field">
							<span>Domaine</span>
							<input
								value={domaine}
								onChange={(e) => setDomaine(e.target.value)}
								required
								placeholder="macommune.fr"
							/>
						</label>

						<label className="create-tenant__field">
							<span>Thème</span>
							<select value={theme} onChange={(e) => setTheme(e.target.value)}>
								{THEMES.map((t) => (
									<option key={t.value} value={t.value}>
										{t.label}
									</option>
								))}
							</select>
						</label>

						<label className="create-tenant__field">
							<span>Variante</span>
							<select value={variante} onChange={(e) => setVariante(e.target.value)}>
								{VARIANTES.map((v) => (
									<option key={v.value} value={v.value}>
										{v.label}
									</option>
								))}
							</select>
						</label>

						<div className="create-tenant__actions">
							<button type="button" className="create-tenant__cancel" onClick={() => closeModal(MODAL_SLUG)}>
								Annuler
							</button>
							<Button type="submit" buttonStyle="primary" disabled={submitting}>
								{submitting ? 'Création…' : 'Créer le site'}
							</Button>
						</div>
					</form>
				</div>
			</Modal>
		</div>
	);
}
