'use client';

import { FieldLabel } from '@payloadcms/ui';
import type { FieldLabelClientProps, StaticLabel } from 'payload';
import './style.scss';

// Décision 46 — l'aide contextuelle ("à quoi sert ce champ") passe d'un
// texte sous le champ à un complément à côté de l'intitulé — plus compact,
// extensible à d'autres champs sans alourdir la page à chaque fois.
//
// Décision 51 — bug trouvé en inspectant le rendu réel : Payload ne passe
// jamais `label`/`required` directement en props à un composant Label
// personnalisé (uniquement au composant interne par défaut) ; il faut les
// lire dans `field.label`/`field.required`. `GenericLabelProps` seul laissait
// passer `label`/`required` au typage sans jamais les fournir à l'exécution
// — d'où l'intitulé manquant (seule l'aide s'affichait).
//
// Décision 54 — la première version (icône ⓘ + explication au survol,
// décision 46) ne s'affichait jamais de façon perceptible à l'usage réel
// (décision 53, "elle ne renvoie rien") ; le repli en `admin.description`
// (texte permanent sous le champ) fonctionnait mais pas où le client le
// voulait : à droite de l'intitulé, sur la même ligne (ex. "Titre —
// explication"), pas en dessous. Ce composant fait maintenant ça.
type Props = FieldLabelClientProps & { info?: string };

export default function LabelWithInfo({ field, required, info }: Props) {
	// `field` regroupe des types de champs qui n'ont pas tous `label`/
	// `required` (ex. row/tabs sans nom) — toujours nommés ici (title/slug/
	// menu), donc accès direct sûr.
	const namedField = field as { label?: StaticLabel; required?: boolean } | undefined;
	return (
		<span className="label-with-info">
			<FieldLabel label={namedField?.label} required={required ?? namedField?.required} />
			{info && <span className="label-with-info__explanation"> – {info}</span>}
		</span>
	);
}
