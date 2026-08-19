'use client';

import { useFormFields } from '@payloadcms/ui';
import { LucideIconByName } from '@shared/lib/icons';
import './style.scss';

// Décision 55 — aperçu du glyphe pendant la saisie du nom de composant
// lucide-react (collection `Icones`). En `afterInput` (pas en `Field`
// complet) : l'input texte natif de Payload continue de fonctionner tel
// quel, seul l'aperçu est ajouté à côté — voir le bug de la décision 51 pour
// pourquoi éviter de réimplémenter un champ natif à la main.
//
// Décision 57 — `LucideIconByName` (déjà utilisé côté site public,
// `shared/lib/icons.ts`) réutilisé ici plutôt qu'un `import * as
// LucideIcons from 'lucide-react'` fait maison : ce pattern a déjà été
// abandonné une fois sur ce projet (mesuré : +167 Ko de bundle, tout
// lucide-react embarqué au lieu d'un import à la demande par nom). Même
// erreur évitée ici plutôt que reproduite dans l'admin.
type Props = { path?: string };

export default function IconPreviewField({ path }: Props) {
	const iconName = useFormFields(([fields]) => (path ? (fields?.[path]?.value as string | undefined) : undefined));

	return (
		<div className="icon-preview-field" title={iconName || undefined}>
			<LucideIconByName name={iconName} size={20} aria-hidden="true" />
		</div>
	);
}
