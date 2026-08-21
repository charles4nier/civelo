'use client';

import { useRowLabel } from '@payloadcms/ui';

// Décision 46 — les lignes d'un tableau (ex. une fiche annuaire) s'affichaient
// avec un intitulé générique ("Fiche 01") sans le nom réel de l'entrée.
// Reprend le champ le plus identifiant de la ligne (nom/titre).
// Décision 79 — numéro d'ordre ("01", "02"...) retiré : juste le nom/titre
// de la ligne, le `prefix` ne sert plus que de repli pour une ligne encore
// vide (juste ajoutée, pas encore remplie).
type Props = {
	prefix: string;
	titleField: string;
};

export default function RowLabel({ prefix, titleField }: Props) {
	const { data } = useRowLabel<Record<string, string>>();
	const name = data?.[titleField];

	return <span>{name || prefix}</span>;
}
