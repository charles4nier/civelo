import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import './style.scss';

const CLASS_NAME = 'hero';

export default function Hero() {
	return (
		<section className={CLASS_NAME}>
			<Image
				src="/saint-hilaire-bonneval-hero.jpg"
				alt="Vue aérienne de Saint-Hilaire-Bonneval et ses étangs au coucher du soleil"
				fill
				priority
				sizes="100vw"
				className={`${CLASS_NAME}__image`}
			/>
			<div className={`${CLASS_NAME}__overlay`} />

			<div className={`${CLASS_NAME}__content container`}>
				<div className={`${CLASS_NAME}__body animate-fade-up`}>
					<h1 className={`${CLASS_NAME}__title`}>
						Bienvenue sur le site de la{' '}
						<span className={`${CLASS_NAME}__title-highlight`}>
							Mairie de Saint-Hilaire-Bonneval
						</span>
						,
						<br />
						au cœur de la Haute-Vienne.
					</h1>

					<div className={`${CLASS_NAME}__divider`} />

					<p className={`${CLASS_NAME}__desc`}>
						Entre rivières, forêts et patrimoine vivant, la commune
						vous accueille. Retrouvez ici vos démarches, l'actualité
						municipale et toutes les informations utiles à la vie
						locale.
					</p>

					<div className={`${CLASS_NAME}__actions`}>
						<a href="/demarches" className="btn-primary">
							Effectuer une démarche
							<ArrowRight
								size={16}
								className={`${CLASS_NAME}__arrow`}
								aria-hidden="true"
							/>
						</a>
						<a href="/vivre/la-commune" className="btn-secondary">
							Découvrir la commune
						</a>
					</div>
				</div>

				<div className={`${CLASS_NAME}__scroll-hint`}>
					<div className={`${CLASS_NAME}__scroll-line`} />
					<span>Scroll</span>
				</div>
			</div>
		</section>
	);
}
