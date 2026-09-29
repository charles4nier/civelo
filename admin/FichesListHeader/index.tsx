'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Link, useConfig } from '@payloadcms/ui';
import { Plus } from 'lucide-react';
import { PARAM_PAGE_LISTE, ecrireSession, nouvelleFicheHref } from '../lib/fiches';
import './style.scss';

// Décision 98 — en-tête de la liste des fiches. On y arrive par « Publier une
// fiche › <page> » (sidebar, `admin/Nav`) : la liste est filtrée sur cette
// page, l'en-tête reprend son nom et offre le seul bouton de création,
// « Nouvelle fiche », qui ouvre une fiche déjà rattachée à la page. Les
// boutons natifs « Créer » de Payload sont masqués sur cette liste
// (`style.scss`) : ils ne transmettent pas la page.
export default function FichesListHeader() {
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const pageId = searchParams.get(PARAM_PAGE_LISTE);
	const { config } = useConfig();
	const adminBase = config.routes?.admin ?? '/admin';
	const apiBase = `${config.serverURL ?? ''}${config.routes?.api ?? '/api'}`;
	const [titre, setTitre] = useState<string | null>(null);

	useEffect(() => {
		if (!pathname.endsWith('/collections/fiches')) return;
		ecrireSession(pageId);
		if (!pageId) return;
		let annule = false;
		fetch(`${apiBase}/pages/${pageId}?depth=0&draft=true`, { credentials: 'include' })
			.then((r) => (r.ok ? r.json() : null))
			.then((page) => {
				if (!annule) setTitre(page?.title ?? null);
			})
			.catch(() => {});
		return () => {
			annule = true;
		};
	}, [pageId, apiBase, pathname]);

	// Payload affiche aussi la description d'une collection en tête du
	// formulaire d'une fiche : ici, seulement sur la liste.
	const surLaListe = pathname.endsWith('/collections/fiches');
	if (!surLaListe) return null;

	if (!pageId) {
		return (
			<p className="fiches-list-header__hint">
				Toutes les fiches de la commune, toutes pages confondues. Pour publier, passez par « Publier une fiche ».
			</p>
		);
	}

	return (
		<div className="fiches-list-header">
			<div>
				<p className="fiches-list-header__eyebrow">Publier une fiche</p>
				<h2 className="fiches-list-header__title">{titre ?? '…'}</h2>
				<p className="fiches-list-header__hint">
					Les fiches de cette liste s'affichent sur la page « {titre ?? '…'} » du site, chacune avec sa propre page.
				</p>
			</div>
			<Link href={`${adminBase}${nouvelleFicheHref(pageId)}`} className="fiches-list-header__create">
				<Plus size={16} aria-hidden="true" />
				Nouvelle fiche
			</Link>
		</div>
	);
}
