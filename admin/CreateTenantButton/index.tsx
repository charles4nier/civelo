'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, useModal, Button, useAuth, toast } from '@payloadcms/ui';
import './style.scss';

const MODAL_SLUG = 'create-tenant';

const THEMES = [
	{ value: 'edito', label: 'Style édito' },
	{ value: 'app', label: 'App' },
	{ value: 'accueillant', label: 'Accueillant' }
];

// "Je veux un create qui ouvre une popin qui permet de générer un nouveau
// tenant." Crée uniquement la fiche commune (le domaine doit déjà être
// enregistré côté DNS + ajouté comme domaine personnalisé Scalingo — ça,
// impossible à automatiser depuis ce formulaire, ça reste une étape à part).
// Les 18 pages génériques se posent automatiquement via le hook
// `afterChange` de cette collection — rien à faire ici pour ça.
export default function CreateTenantButton() {
	const { openModal, closeModal } = useModal();
	const router = useRouter();
	const { user } = useAuth();
	const [nom, setNom] = useState('');
	const [domaine, setDomaine] = useState('');
	const [theme, setTheme] = useState('edito');
	const [submitting, setSubmitting] = useState(false);

	// Même garde que le raccourci "Communes" de la nav (admin/Nav/Client.tsx)
	// — la protection réelle reste `create: isSuperAdmin` côté collection,
	// ceci n'évite juste d'afficher un bouton qui échouerait pour tout le
	// monde d'autre.
	if (user?.role !== 'super-admin') return null;

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		setSubmitting(true);
		try {
			const res = await fetch('/api/tenants', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ nom, domaine, theme })
			});
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data?.errors?.[0]?.message || data?.message || 'Échec de la création.');
			}
			toast.success(`« ${nom} » créé, avec ses 18 pages générées automatiquement.`);
			setNom('');
			setDomaine('');
			setTheme('edito');
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
						Le domaine doit déjà pointer vers Scalingo (DNS + domaine personnalisé ajouté séparément avant ou après
						cette étape) — ce formulaire crée seulement la fiche commune ; ses 18 pages sont générées automatiquement.
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
