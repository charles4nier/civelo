import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import './style.scss';

const CLASS_NAME = 'hero';

export default function Hero() {
	return (
		<section className={CLASS_NAME}>
			<div className={`${CLASS_NAME}__wrapper container`}>

				{/* Image encadrée + vagues décoratives (vagues hors du frame pour ne pas être clippées) */}
				<div className={`${CLASS_NAME}__frame-wrapper`}>
					<div className={`${CLASS_NAME}__frame`}>
						<Image
							src="/hero.jpg"
							alt="Vue de Saint-Hilaire-Bonneval et son église"
							fill
							priority
							sizes="100vw"
							className={`${CLASS_NAME}__image`}
						/>
						<div className={`${CLASS_NAME}__overlay`} />

						{/* Contenu sur l'image */}
						<div className={`${CLASS_NAME}__content`}>
							<div className={`${CLASS_NAME}__body`}>
								<span className={`${CLASS_NAME}__badge`}>
									<span className={`${CLASS_NAME}__badge-dot`} />
									Commune du Limousin
								</span>
								<p className={`${CLASS_NAME}__title`}>
									Bienvenue à <em>Saint-Hilaire-Bonneval</em>,
									<br />au cœur de la Haute-Vienne.
								</p>
							</div>
							<div className={`${CLASS_NAME}__actions`}>
								<a href="#demarches" className={`${CLASS_NAME}__cta-dark`}>
									Mes démarches <ArrowRight size={16} />
								</a>
								<Link href="/vivre/la-commune" className={`${CLASS_NAME}__cta-ghost`}>
									Découvrir
								</Link>
							</div>
						</div>
					</div>

					{/* Vagues décoratives — hors du frame pour ne pas être clippées par overflow:hidden */}
					<svg className={`${CLASS_NAME}__waves`} viewBox="0 0 200 120" aria-hidden="true">
						{[0, 1, 2, 3].map((i) => (
							<path
								key={i}
								d={`M0 ${20 + i * 25} Q 50 ${i * 25}, 100 ${20 + i * 25} T 200 ${20 + i * 25}`}
								fill="none"
								stroke="currentColor"
								strokeWidth="3"
								strokeLinecap="round"
							/>
						))}
					</svg>
				</div>

				{/* Sous-ligne */}
				<div className={`${CLASS_NAME}__sub`}>
					<p className={`${CLASS_NAME}__sub-text`}>
						Entre rivières, forêts et patrimoine vivant, la commune vous accueille.
						Retrouvez ici vos démarches, l'actualité municipale et toutes les informations
						utiles à la vie locale.
					</p>
					<div className={`${CLASS_NAME}__scroll-hint`}>
						<span className={`${CLASS_NAME}__scroll-line`} />
						Découvrir
						<ChevronDown size={14} className={`${CLASS_NAME}__scroll-icon`} />
					</div>
				</div>
			</div>
		</section>
	);
}
