'use client';

import { LucideIconByName } from '@shared/lib/icons';
import './style.scss';

const CLASS_NAME = 'quick-access';

// Nom de l'événement DOM utilisé pour ouvrir une modale déjà gérée ailleurs
// (aujourd'hui : la popin "Contact" de `FloatingButtons`) sans dupliquer sa
// logique (focus trap, `inert`, Échap...) ni faire remonter son état jusqu'ici.
export const OPEN_MODAL_EVENT = 'quick-access:open-modal';

export type QuickAccessItemData = {
	key: string;
	icon: string;
	title: string;
	desc?: string;
	href: string;
	// Quand renseigné, l'item ouvre cette modale (voir `OPEN_MODAL_EVENT`) au
	// lieu de naviguer vers `href`.
	opensModal?: 'contact';
};

// Conservé ici (plutôt que dans `Agenda`) pour ne pas casser l'import de
// `Agenda/index.tsx` (`import type { NextEventData } from '../QuickAccess'`)
// — le prochain rendez-vous est désormais son propre bloc (`Agenda`), plus
// intégré à cette carte (voir `themes/atelier/features/home/index.tsx`).
export type NextEventData = {
	title: string;
	date: string; // ISO
	category?: string;
	time?: string;
	desc?: string;
};

type Props = { items: QuickAccessItemData[] };

// Repris de style-edito-test — inspiré du bandeau de raccourcis de
// toulouse.fr : plus de titre visible ni de description, juste des icônes
// rondes suggérées par un petit texte en dessous. Le `<h2>` reste dans le DOM
// (nom de section pour les lecteurs d'écran) mais masqué visuellement.
export default function QuickAccess({ items }: Props) {
	return (
		<section id="demarches" className={CLASS_NAME}>
			<div className="container">
				<h2 className={`${CLASS_NAME}__title`}>L'essentiel en un clic</h2>
				{/* Le fond de `__panel` déborde jusqu'au bord droit de la fenêtre
				    (`::after`, voir style.scss) — reprend le déport de toulouse.fr —
				    mais ce contenu, lui, reste centré dans le container normal. */}
				<div className={`${CLASS_NAME}__panel`}>
					<div className={`${CLASS_NAME}__grid`}>
						{items.map((item) => {
							const content = (
								<>
									<div className={`${CLASS_NAME}__item-icon`}>
										<LucideIconByName name={item.icon} size={28} strokeWidth={1.75} aria-hidden="true" />
									</div>
									<span className={`${CLASS_NAME}__item-label`}>{item.title}</span>
								</>
							);

							return item.opensModal ? (
								<button
									key={item.key}
									type="button"
									className={`${CLASS_NAME}__item`}
									onClick={() =>
										window.dispatchEvent(new CustomEvent(OPEN_MODAL_EVENT, { detail: item.opensModal }))
									}
								>
									{content}
								</button>
							) : (
								<a key={item.key} href={item.href} className={`${CLASS_NAME}__item`}>
									{content}
								</a>
							);
						})}
					</div>
				</div>
			</div>
		</section>
	);
}
