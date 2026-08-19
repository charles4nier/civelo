import './style.scss';

// Décision 46 — les groupes de champs par gabarit ("Liste", "Éditorial"...)
// ont un titre de section automatique (le nom du groupe), mais le tout
// premier bloc (titre/slug/menu/gabarit) n'en avait aucun — juste une pile
// de champs, jugé illisible. Champ `type: 'ui'` (aucune donnée, juste de
// l'affichage) inséré avant `title` pour lui donner un vrai titre.
type Props = {
	heading?: string;
};

export default function SectionHeading({ heading = 'Informations générales' }: Props) {
	return (
		<div className="section-heading">
			<h3 className="section-heading__title">{heading}</h3>
		</div>
	);
}
