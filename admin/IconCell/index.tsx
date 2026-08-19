'use client';

import { LucideIconByName } from '@shared/lib/icons';
import './style.scss';

// Décision 55 — colonne "Composant lucide-react" de la liste `/collections/
// icones` : montre le glyphe rendu à côté du nom, pas juste le texte brut —
// permet de repérer une icône déjà existante avant d'en recréer une en
// double. Décision 57 — `LucideIconByName` réutilisé (voir
// `admin/IconPreviewField`), pas un import complet de lucide-react.
type Props = { cellData?: unknown };

export default function IconCell({ cellData }: Props) {
	const iconName = typeof cellData === 'string' ? cellData : undefined;

	return (
		<span className="icon-cell">
			<LucideIconByName name={iconName} size={16} aria-hidden="true" />
			{iconName}
		</span>
	);
}
