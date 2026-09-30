'use client';

import { usePathname } from 'next/navigation';
import { Download } from 'lucide-react';
import '../FichesListHeader/style.scss';

// Décision 98 (§7, étape 5) — en tête de la liste des inscrits : ce qu'est
// cette liste, et l'export CSV (`/api/newsletter/export`). Payload affiche
// aussi la description dans le formulaire d'un abonné : ici, seulement sur
// la liste.
export default function AbonnesListHeader() {
	const pathname = usePathname();
	if (!pathname.endsWith('/collections/abonnes-newsletter')) return null;
	return (
		<div className="fiches-list-header">
			<p className="fiches-list-header__hint">
				Les personnes inscrites depuis le site à la lettre d'information de la commune, avec la date de leur
				consentement. Aucun e-mail n'est envoyé depuis le site pour l'instant : exportez la liste pour vos envois.
			</p>
			<a href="/api/newsletter/export" className="fiches-list-header__create">
				<Download size={16} aria-hidden="true" />
				Exporter la liste (CSV)
			</a>
		</div>
	);
}
