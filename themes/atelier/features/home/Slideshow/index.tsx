'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import './style.scss';

const CLASS_NAME = 'slideshow';

export type SlideshowItemData = {
	key: string;
	image: string;
	etiquette?: string;
	titre: string;
	description?: string;
	badgeNombre?: string;
	badgeLibelle?: string;
	boutonLabel?: string;
	href?: string;
};

type Props = { slides: SlideshowItemData[] };

// Section « Diaporama » — variante tourisme (`Tenants.variante`), 2ᵉ bloc de
// l'accueil ; variante défaut, 3ᵉ bloc (après le Hero, jamais compté comme un
// bloc — voir `themes/atelier/features/home/index.tsx`). Nombre de diapositives
// libre côté Payload (`Pages.ts`, `accueil.slideshow`, pas de maxRows) : ce
// composant s'adapte à 1 diapositive (pas de défilement automatique, pas de
// contrôles) comme à N.
export default function Slideshow({ slides }: Props) {
	const [active, setActive] = useState(0);
	const [paused, setPaused] = useState(false);

	useEffect(() => {
		if (paused || slides.length < 2) return;
		const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 5000);
		return () => window.clearInterval(timer);
	}, [paused, slides.length]);

	// Une diapositive supprimée en admin pendant que `active` pointait dessus
	// (édition concurrente) ne doit jamais faire planter le rendu public.
	const current = slides[active] ?? slides[0];
	if (!current) return null;

	const move = (direction: number) => setActive((prev) => (prev + direction + slides.length) % slides.length);

	return (
		<section className={CLASS_NAME} aria-roledescription="carousel" aria-label="Mise en avant de la commune">
			<div className="container">
				<div
					className={`${CLASS_NAME}__card`}
					onMouseEnter={() => setPaused(true)}
					onMouseLeave={() => setPaused(false)}
				>
					<div className={`${CLASS_NAME}__image`}>
						{slides.map((slide, i) => (
							<Image
								key={slide.key}
								src={slide.image}
								alt={slide.titre}
								fill
								sizes="(max-width: 1024px) 100vw, 50vw"
								loading={i === 0 ? undefined : 'lazy'}
								priority={i === 0}
								className={i === active ? 'is-active' : ''}
								aria-hidden={i !== active}
							/>
						))}
					</div>

					<div className={`${CLASS_NAME}__panel`}>
						{/* `key={current.key}` force le remontage à chaque changement de
						    diapositive : c'est ce qui rejoue l'animation d'entrée
						    (keyframe `fade-up-atelier` partagé du thème) à chaque fois
						    plutôt qu'une seule fois au premier rendu. */}
						<div key={current.key} className={`${CLASS_NAME}__panel-text`}>
							{current.etiquette && <p className="eyebrow">{current.etiquette}</p>}
							<h2 className={`${CLASS_NAME}__title`}>{current.titre}</h2>
							{current.description && <p className={`${CLASS_NAME}__desc`}>{current.description}</p>}
							{current.boutonLabel && current.href && (
								<Link href={current.href} className={`${CLASS_NAME}__cta`}>
									{current.boutonLabel}
								</Link>
							)}
						</div>

						{slides.length > 1 && (
							<div className={`${CLASS_NAME}__controls`}>
								<button type="button" onClick={() => move(-1)} aria-label="Diapositive précédente">
									<ArrowLeft size={16} aria-hidden="true" />
								</button>
								<button type="button" onClick={() => move(1)} aria-label="Diapositive suivante">
									<ArrowRight size={16} aria-hidden="true" />
								</button>
								<div className={`${CLASS_NAME}__dots`}>
									{slides.map((slide, i) => (
										<button
											key={slide.key}
											type="button"
											className={i === active ? 'is-active' : ''}
											onClick={() => setActive(i)}
											aria-label={`Afficher : ${slide.titre}`}
										/>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
