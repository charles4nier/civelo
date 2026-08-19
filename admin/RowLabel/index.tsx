'use client';

import { useRowLabel } from '@payloadcms/ui';

// Décision 46 — les lignes d'un tableau (ex. une fiche annuaire) s'affichaient
// avec un intitulé générique ("Fiche 01") sans le nom réel de l'entrée.
// Reprend le champ le plus identifiant de la ligne (nom/titre) + le numéro
// d'ordre, ex. "Fiche Boulangerie Martin 01".
type Props = {
	prefix: string;
	titleField: string;
};

export default function RowLabel({ prefix, titleField }: Props) {
	const { data, rowNumber } = useRowLabel<Record<string, string>>();
	const name = data?.[titleField];
	const index = String((rowNumber ?? 0) + 1).padStart(2, '0');

	return (
		<span>
			{prefix}
			{name ? ` ${name}` : ''} {index}
		</span>
	);
}
