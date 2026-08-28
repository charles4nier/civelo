'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, useModal, Button, toast } from '@payloadcms/ui';
import { Settings, Trash2, Pencil, ChevronLeft } from 'lucide-react';
import './SiteSettingsMenu.scss';

type Tenant = { id: string; nom: string; domaine: string };

type Props = { tenant: Tenant };

// Popin de réglages par site, ouverte depuis l'icône engrenage de sa carte
// (`MesSites/Client.tsx`) — remplace l'ancien lien direct vers la fiche
// Payload brute. "Supprimer le site" est la première entrée, d'autres
// suivront (demande explicite : "il y aura d'autres options après").
//
// Le nettoyage en cascade (pages, médias, documents, POI, sentiers,
// détachement des comptes) est géré automatiquement par le plugin
// multi-tenant à la suppression (`cleanupAfterTenantDelete`, activé par
// défaut) — vérifié dans son code avant de construire cet écran. Seule la
// confirmation elle-même manquait.
export default function SiteSettingsMenu({ tenant }: Props) {
	const modalSlug = `site-settings-${tenant.id}`;
	const { openModal, closeModal } = useModal();
	const router = useRouter();
	const [step, setStep] = useState<'menu' | 'confirm-delete'>('menu');
	const [confirmText, setConfirmText] = useState('');
	const [submitting, setSubmitting] = useState(false);

	function open(e: React.MouseEvent) {
		e.stopPropagation();
		setStep('menu');
		setConfirmText('');
		openModal(modalSlug);
	}

	function close() {
		closeModal(modalSlug);
		setStep('menu');
		setConfirmText('');
	}

	async function handleDelete() {
		setSubmitting(true);
		try {
			const res = await fetch(`/api/tenants/${tenant.id}`, { method: 'DELETE', credentials: 'include' });
			if (!res.ok) {
				const data = await res.json().catch(() => null);
				throw new Error(data?.errors?.[0]?.message || data?.message || 'Échec de la suppression.');
			}
			toast.success(`« ${tenant.nom} » supprimé, avec toutes ses données.`);
			close();
			router.refresh();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Échec de la suppression.');
		} finally {
			setSubmitting(false);
		}
	}

	const confirmMatches = confirmText.trim() === tenant.nom;

	return (
		<>
			<button
				type="button"
				className="mes-sites__card-settings"
				title="Réglages du site"
				onClick={open}
			>
				<Settings size={15} aria-hidden="true" />
			</button>

			<Modal slug={modalSlug} className="site-settings-menu__modal">
				<div className="site-settings-menu__panel">
					{step === 'menu' ? (
						<>
							<h2 className="site-settings-menu__title">{tenant.nom}</h2>
							<p className="site-settings-menu__domain">{tenant.domaine}</p>

							<div className="site-settings-menu__options">
								<a href={`/admin/collections/tenants/${tenant.id}`} className="site-settings-menu__option">
									<Pencil size={16} aria-hidden="true" />
									Modifier les informations
								</a>
								<button
									type="button"
									className="site-settings-menu__option site-settings-menu__option--danger"
									onClick={() => setStep('confirm-delete')}
								>
									<Trash2 size={16} aria-hidden="true" />
									Supprimer le site
								</button>
							</div>
							<p className="site-settings-menu__more">D'autres options arriveront ici prochainement.</p>

							<div className="site-settings-menu__actions">
								<button type="button" className="site-settings-menu__cancel" onClick={close}>
									Fermer
								</button>
							</div>
						</>
					) : (
						<>
							<button type="button" className="site-settings-menu__back" onClick={() => setStep('menu')}>
								<ChevronLeft size={14} aria-hidden="true" />
								Retour
							</button>
							<h2 className="site-settings-menu__title site-settings-menu__title--danger">Supprimer « {tenant.nom} » ?</h2>
							<p className="site-settings-menu__warning">
								Cette action supprime définitivement toutes les pages, médias, documents, lieux et sentiers de ce
								site, et détache les comptes qui y étaient rattachés. Impossible à annuler.
							</p>

							<label className="site-settings-menu__field">
								<span>
									Tapez <strong>{tenant.nom}</strong> pour confirmer
								</span>
								<input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} autoFocus />
							</label>

							<div className="site-settings-menu__actions">
								<button type="button" className="site-settings-menu__cancel" onClick={close}>
									Annuler
								</button>
								<Button
									buttonStyle="secondary"
									className="site-settings-menu__delete-btn"
									disabled={!confirmMatches || submitting}
									onClick={handleDelete}
								>
									{submitting ? 'Suppression…' : 'Supprimer définitivement'}
								</Button>
							</div>
						</>
					)}
				</div>
			</Modal>
		</>
	);
}
