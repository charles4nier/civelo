import { Search } from 'lucide-react';
import PageHeader from '@themes/preau/components/PageHeader';
import ResultatsRecherche from '@shared/components/ResultatsRecherche';
import type { ResultatRecherche } from '@lib/payload';
import './style.scss';

// Décision 98 — page `/recherche` : en-tête habituel du thème (`PageHeader`),
// puis formulaire et résultats communs (`shared/components/ResultatsRecherche`).
export default function RecherchePage({ q, resultats }: { q: string; resultats: ResultatRecherche[] }) {
	return (
		<>
			<PageHeader
				breadcrumb="Recherche"
				eyebrowIcon={Search}
				eyebrow="Recherche"
				title="Rechercher sur le site"
				subtitle="Pages, actualités, démarches, événements, commerces et documents."
			/>
			<ResultatsRecherche q={q} resultats={resultats} />
		</>
	);
}
