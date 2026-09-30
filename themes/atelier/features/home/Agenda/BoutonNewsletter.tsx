'use client';

import { OPEN_MODAL_EVENT } from '../QuickAccess';

// Décision 98 (§7, étape 5) — ouvre la popin d'inscription à la lettre
// d'information, gérée par `FloatingButtons` (même mécanisme que Contact et
// Rechercher : focus piégé, Échap, `inert`).
export default function BoutonNewsletter() {
	return (
		<button
			type="button"
			className="btn-outline"
			onClick={() => window.dispatchEvent(new CustomEvent(OPEN_MODAL_EVENT, { detail: 'newsletter' }))}
		>
			S'inscrire à la newsletter
		</button>
	);
}
