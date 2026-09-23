'use client';

import { useEffect, useRef, useState } from 'react';
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
	opensModal?: 'contact' | 'search';
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

// Ex-barre de recherche du Hero (`Hero/index.tsx`) — ne rendait pas bien
// posée là-bas, déplacée ici en tête de liste. Ouvre sa propre popin, sur le
// même mécanisme que Contact (voir `OPEN_MODAL_EVENT`, gérée par
// `FloatingButtons`) — pas encore branchée à une vraie recherche (même repli
// honnête que l'ancienne barre).
const SEARCH_ITEM: QuickAccessItemData = {
	key: 'search',
	icon: 'Search',
	title: 'Rechercher',
	desc: 'Trouver une page ou une information sur le site.',
	href: '#',
	opensModal: 'search'
};

// Toujours présents, quel que soit le contenu éditorial de `items` (repli
// statique ou raccourcis saisis en CMS) — mêmes actions que les boutons
// flottants toujours visibles (`FloatingButtons`, Contact/Carte interactive),
// donc pas question qu'une liste éditée sans eux les fasse disparaître d'ici.
const STRUCTURAL_ITEMS: QuickAccessItemData[] = [
	{
		key: 'contact',
		icon: 'Mail',
		title: 'Contact',
		desc: 'Nous écrire ou nous joindre directement.',
		href: '/contact',
		opensModal: 'contact'
	},
	{
		key: 'carte',
		icon: 'Map',
		title: 'Carte interactive',
		desc: 'Étangs, sentiers, patrimoine et points d’intérêt.',
		href: '/tourisme/carte-interactive'
	}
];

// Repris de style-edito-test — inspiré du bandeau de raccourcis de
// toulouse.fr : plus de titre visible ni de description, juste des icônes
// rondes suggérées par un petit texte en dessous. Le `<h2>` reste dans le DOM
// (nom de section pour les lecteurs d'écran) mais masqué visuellement.
export default function QuickAccess({ items }: Props) {
	const allItems = [SEARCH_ITEM, ...items, ...STRUCTURAL_ITEMS];

	// Mobile uniquement (voir `style.scss`, `&__grid` en `nowrap` + `overflow-x`
	// sous `$breakpoint-sm`) : au-delà de 3-4 items, la rangée ne tient plus
	// sur une ligne — plutôt qu'un retour à la ligne, elle défile
	// horizontalement, avec ces points pour indiquer la position. Suivi par
	// IntersectionObserver (pas un calcul sur `scrollLeft`) : robuste même si
	// les items n'ont pas tous exactement la même largeur.
	const scrollerRef = useRef<HTMLDivElement>(null);
	const itemRefs = useRef<(HTMLAnchorElement | HTMLButtonElement | null)[]>([]);
	const [activeIndex, setActiveIndex] = useState(0);

	useEffect(() => {
		const scroller = scrollerRef.current;
		if (!scroller) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const mostVisible = entries
					.filter((entry) => entry.isIntersecting)
					.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
				if (!mostVisible) return;
				const index = itemRefs.current.findIndex((el) => el === mostVisible.target);
				if (index !== -1) setActiveIndex(index);
			},
			{ root: scroller, threshold: [0.5, 0.75, 1] }
		);

		itemRefs.current.forEach((el) => el && observer.observe(el));
		return () => observer.disconnect();
	}, [allItems.length]);

	const scrollToIndex = (index: number) => {
		itemRefs.current[index]?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
	};

	return (
		<section id="demarches" className={CLASS_NAME}>
			<div className="container">
				<h2 className={`${CLASS_NAME}__title`}>L'essentiel en un clic</h2>
				{/* Le fond de `__panel` déborde jusqu'au bord droit de la fenêtre
				    (`::after`, voir style.scss) — reprend le déport de toulouse.fr —
				    mais ce contenu, lui, reste centré dans le container normal. */}
				<div className={`${CLASS_NAME}__panel`}>
					<div className={`${CLASS_NAME}__grid`} ref={scrollerRef}>
						{allItems.map((item, index) => {
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
									ref={(el) => {
										itemRefs.current[index] = el;
									}}
									type="button"
									className={`${CLASS_NAME}__item`}
									onClick={() =>
										window.dispatchEvent(new CustomEvent(OPEN_MODAL_EVENT, { detail: item.opensModal }))
									}
								>
									{content}
								</button>
							) : (
								<a
									key={item.key}
									ref={(el) => {
										itemRefs.current[index] = el;
									}}
									href={item.href}
									className={`${CLASS_NAME}__item`}
								>
									{content}
								</a>
							);
						})}
					</div>

					{allItems.length > 1 && (
						<div className={`${CLASS_NAME}__dots`} role="tablist" aria-label="Position dans les accès rapides">
							{allItems.map((item, index) => (
								<button
									key={item.key}
									type="button"
									role="tab"
									aria-selected={index === activeIndex}
									aria-label={`Afficher : ${item.title}`}
									className={index === activeIndex ? 'is-active' : ''}
									onClick={() => scrollToIndex(index)}
								/>
							))}
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
