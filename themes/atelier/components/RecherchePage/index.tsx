import { Search } from 'lucide-react';
import EditorialLayout from '@themes/atelier/components/EditorialLayout';
import ResultatsRecherche from '@shared/components/ResultatsRecherche';
import type { ResultatRecherche } from '@lib/payload';
import './style.scss';

const GRADIENT = 'linear-gradient(135deg, oklch(0.52 0.17 240), oklch(0.70 0.16 220))';

// Décision 98 — page `/recherche` : en-tête habituel des pages du thème,
// puis formulaire et résultats communs (`shared/components/ResultatsRecherche`).
export default function RecherchePage({ q, resultats }: { q: string; resultats: ResultatRecherche[] }) {
	return (
		<EditorialLayout
			heroGradient={GRADIENT}
			breadcrumbLabel="Recherche"
			eyebrowIcon={Search}
			eyebrowText="Recherche"
			title="Rechercher sur le site"
			subtitle="Pages, actualités, démarches, événements, commerces et documents."
		>
			<ResultatsRecherche q={q} resultats={resultats} />
		</EditorialLayout>
	);
}
