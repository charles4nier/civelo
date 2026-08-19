'use client';

import { FieldLabel, useFormFields } from '@payloadcms/ui';
import type { ArrayFieldLabelClientComponent } from 'payload';

// Décision 46 — le libellé d'un champ tableau (ex. "Liste de fiches") reste
// générique alors que la page a déjà un vrai nom ("Commerces & artisans").
// Ce composant reprend le champ `titre` de la page en direct comme titre de
// section, avec repli sur le libellé statique tant que le titre est vide.
// Utilisé uniquement sur le tableau principal des gabarits qui n'en ont
// qu'un seul (sinon deux tableaux de la même page afficheraient le même
// titre — voir collections/Pages.ts).
//
// Décision 51 — `label`/`required` ne sont jamais fournis directement à un
// composant Label personnalisé par Payload (voir `admin/LabelWithInfo`) :
// il faut les lire dans `field.label`/`field.required`, sinon le repli sur
// le libellé statique ne s'affiche jamais quand `titre` est vide.
const DynamicArrayLabel: ArrayFieldLabelClientComponent = ({ field, required }) => {
	const title = useFormFields(([fields]) => fields?.title?.value as string | undefined);

	return <FieldLabel label={title || field?.label} required={required ?? field?.required} />;
};

export default DynamicArrayLabel;
