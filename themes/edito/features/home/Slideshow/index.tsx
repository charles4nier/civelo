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
// bloc — voir `themes/edito/features/home/index.tsx`). Nombre de diapositives
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
			<div className={`container ${CLASS_NAME}__grid`}>
				<div
					className={`${CLASS_NAME}__image`}
					onMouseEnter={() => setPaused(true)}
					onMouseLeave={() => setPaused(false)}
				>
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

					{(current.badgeNombre || current.badgeLibelle) && (
						<div className={`${CLASS_NAME}__badge`}>
							{current.badgeNombre && <strong>{current.badgeNombre}</strong>}
							{current.badgeLibelle && <span>{current.badgeLibelle}</span>}
						</div>
					)}

					{slides.length > 1 && (
						<div className={`${CLASS_NAME}__controls`}>
							<button type="button" onClick={() => move(-1)} aria-label="Diapositive précédente">
								<ArrowLeft size={16} aria-hidden="true" />
							</button>
							<div>
								{slides.map((slide, i) => (
									<button
										key={slide.key}
										type="button"
										className={i === active ? 'is-active' : ''}
										onClick={() => setActive(i)}
										aria-label={`Afficher : ${slide.titre}`}
									>
										<span />
									</button>
								))}
							</div>
							<button type="button" onClick={() => move(1)} aria-label="Diapositive suivante">
								<ArrowRight size={16} aria-hidden="true" />
							</button>
						</div>
					)}
				</div>

				<div className={`${CLASS_NAME}__text`} key={current.key}>
					{current.etiquette && <p className="eyebrow">{current.etiquette}</p>}
					<h2 className={`${CLASS_NAME}__title`}>{current.titre}</h2>
					<div className="divider-line" />
					{current.description && <p className={`${CLASS_NAME}__desc`}>{current.description}</p>}
					{current.boutonLabel && current.href && (
						<Link href={current.href} className={`${CLASS_NAME}__cta btn-primary`}>
							{current.boutonLabel} <ArrowRight size={16} aria-hidden="true" />
						</Link>
					)}
				</div>
			</div>
		</section>
	);
}
