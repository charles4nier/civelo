import { Newspaper } from 'lucide-react';
import PageHeader from '@themes/belvedere/components/PageHeader';
import FicheContent from '@shared/components/FicheContent';
import type { FicheData } from '@lib/payload';
import './style.scss';

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString('fr-FR', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'Europe/Paris'
	});
}

// Décision 98 — page publique d'une fiche : l'en-tête habituel du thème
// (`PageHeader`, avec la page liste en niveau intermédiaire du fil d'Ariane),
// puis le corps commun aux 4 thèmes (`FicheContent`). Pour une actualité,
// catégorie et date passent dans le surtitre.
export default function FicheLayout({ fiche }: { fiche: FicheData }) {
	const surtitre = [fiche.categorie?.nom, fiche.date ? formatDate(fiche.date) : undefined].filter(Boolean).join(' · ');
	return (
		<article className="fiche">
			<PageHeader
				breadcrumb={fiche.titre}
				parent={{ label: fiche.page.titre, href: fiche.page.href }}
				eyebrowIcon={Newspaper}
				eyebrow={surtitre || fiche.page.titre}
				title={fiche.titre}
				subtitle={fiche.chapo}
			/>
			<FicheContent fiche={fiche} />
		</article>
	);
}
