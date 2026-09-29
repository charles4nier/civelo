'use client';

import { Link, useConfig, useDocumentInfo, useFormFields } from '@payloadcms/ui';
import { ArrowRight } from 'lucide-react';
import { listeFichesHref } from '../lib/fiches';
import './style.scss';

// Décision 98 — dans une page Liste passée en fiches (pilote : Actualités),
// plus de tableau d'éléments : ils se gèrent dans « Publier une fiche ».
// Un seul chemin pour publier (deux entrées vers la même chose perturbent
// les éditeurs) — ce panneau n'est qu'un panneau indicateur, pas une
// seconde entrée.
export default function PanneauFiches() {
	const { id } = useDocumentInfo();
	const { config } = useConfig();
	const adminBase = config.routes?.admin ?? '/admin';
	const titre = useFormFields(([fields]) => fields?.title?.value as string | undefined);

	return (
		<div className="panneau-fiches">
			<p className="panneau-fiches__text">
				Les fiches affichées sur cette page se gèrent dans <strong>Publier une fiche › {titre || 'cette page'}</strong>.
				Ici, vous modifiez seulement le reste de la page.
			</p>
			{id && (
				<Link href={`${adminBase}${listeFichesHref(id)}`} className="panneau-fiches__link">
					Voir les fiches
					<ArrowRight size={16} aria-hidden="true" />
				</Link>
			)}
		</div>
	);
}
