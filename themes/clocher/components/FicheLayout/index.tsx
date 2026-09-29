import { Calendar, Tag } from 'lucide-react';
import Breadcrumb from '@themes/clocher/components/Breadcrumb';
import FicheContent from '@shared/components/FicheContent';
import type { FicheData } from '@lib/payload';
import './style.scss';

const CLASS_NAME = 'fiche';

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString('fr-FR', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'Europe/Paris'
	});
}

// Décision 98 — page publique d'une fiche (`/<page liste>/<fiche>`), une
// sorte d'article de blog : même en-tête que les pages du thème (dégradé,
// fil d'Ariane), puis le corps commun aux 4 thèmes (`FicheContent` : image,
// texte, pièces jointes). Un seul gabarit pour tous les types de fiches ;
// chaque type n'ajoute que son encart (ici, pour une actualité : date et
// catégorie dans l'en-tête).
export default function FicheLayout({ fiche }: { fiche: FicheData }) {
	return (
		<article className={CLASS_NAME}>
			<header className={`${CLASS_NAME}__hero`}>
				<div className={`${CLASS_NAME}__hero-blur ${CLASS_NAME}__hero-blur--top`} />
				<div className={`${CLASS_NAME}__hero-blur ${CLASS_NAME}__hero-blur--bottom`} />
				<div className={`${CLASS_NAME}__hero-content`}>
					<Breadcrumb
						items={[
							{ label: 'Accueil', href: '/' },
							{ label: fiche.page.titre, href: fiche.page.href },
							{ label: fiche.titre }
						]}
					/>
					{(fiche.date || fiche.categorie) && (
						<p className={`${CLASS_NAME}__meta`}>
							{fiche.categorie && (
								<span className={`${CLASS_NAME}__cat ${CLASS_NAME}__cat--${fiche.categorie.variant}`}>
									<Tag size={12} aria-hidden="true" />
									{fiche.categorie.nom}
								</span>
							)}
							{fiche.date && (
								<span className={`${CLASS_NAME}__date`}>
									<Calendar size={14} aria-hidden="true" />
									<time dateTime={fiche.date}>{formatDate(fiche.date)}</time>
								</span>
							)}
						</p>
					)}
					<h1 className={`${CLASS_NAME}__title`}>{fiche.titre}</h1>
					<div className={`${CLASS_NAME}__divider`} />
					<p className={`${CLASS_NAME}__chapo`}>{fiche.chapo}</p>
				</div>
			</header>

			<FicheContent fiche={fiche} />
		</article>
	);
}
