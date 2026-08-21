'use client';

import { Button, useForm } from '@payloadcms/ui';

// Décision 81 — sur une longue liste (ex. Actualités), le bouton "+ Ajouter"
// de Payload reste après toutes les lignes : il fallait tout scroller pour
// en ajouter une. Plutôt que de le déplacer (perdu au premier essai, décision
// 79/80), un second bouton strictement identique est ajouté ici en `admin.
// components.beforeInput` — rendu par Payload juste après le titre du champ,
// avant les lignes. `Button`/`useForm().addFieldRow` sont les mêmes briques
// que celles utilisées par le bouton natif de Payload (voir `@payloadcms/ui`,
// `fields/Array/index.js`) : même rendu, mêmes classes CSS, donc récupère
// automatiquement le style déjà posé sur `.array-field__add-row.btn`
// (`admin/Nav/global-overrides.scss`). Sans `rowIndex`, `addFieldRow`
// ajoute la ligne en fin de liste par défaut — identique au bouton du bas.
type Props = {
	path?: string;
	schemaPath?: string;
	field?: { label?: string; labels?: { singular?: string } };
};

export default function ArrayAddRowBefore({ path, schemaPath, field }: Props) {
	const { addFieldRow } = useForm();

	if (!path || !schemaPath) return null;

	const singular = field?.labels?.singular ?? field?.label ?? 'une ligne';

	return (
		<Button
			buttonStyle="icon-label"
			className="array-field__add-row"
			icon="plus"
			iconPosition="left"
			iconStyle="with-border"
			onClick={() => addFieldRow({ path, schemaPath })}
		>
			Ajouter {singular}
		</Button>
	);
}
