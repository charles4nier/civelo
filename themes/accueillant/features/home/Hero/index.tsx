import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import './style.scss';

const CLASS_NAME = 'hero';

export type HeroData = {
	image?: string;
	titre: string;
	description?: string;
	boutonPrincipal?: { label: string; href?: string };
	boutonSecondaire?: { label: string; href?: string };
};

type Props = { data: HeroData };

export default function Hero({ data }: Props) {
	return (
		<section className={CLASS_NAME}>
			<div className={`${CLASS_NAME}__wrapper container`}>

				{/* Image encadrée + vagues décoratives (vagues hors du frame pour ne pas être clippées) */}
				<div className={`${CLASS_NAME}__frame-wrapper`}>
					<div className={`${CLASS_NAME}__frame`}>
						<Image
							src={data.image ?? '/hero.jpg'}
							alt="Vue de la commune"
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
									Site officiel
								</span>
								<p className={`${CLASS_NAME}__title`}>{data.titre}</p>
							</div>
							<div className={`${CLASS_NAME}__actions`}>
								{data.boutonPrincipal && (
									<a href={data.boutonPrincipal.href ?? '#'} className={`${CLASS_NAME}__cta-dark`}>
										{data.boutonPrincipal.label} <ArrowRight size={16} />
									</a>
								)}
								{data.boutonSecondaire && (
									<Link href={data.boutonSecondaire.href ?? '#'} className={`${CLASS_NAME}__cta-ghost`}>
										{data.boutonSecondaire.label}
									</Link>
								)}
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
				{data.description && (
					<div className={`${CLASS_NAME}__sub`}>
						<p className={`${CLASS_NAME}__sub-text`}>{data.description}</p>
						<div className={`${CLASS_NAME}__scroll-hint`}>
							<span className={`${CLASS_NAME}__scroll-line`} />
							Découvrir
							<ChevronDown size={14} className={`${CLASS_NAME}__scroll-icon`} />
						</div>
					</div>
				)}
			</div>
		</section>
	);
}
