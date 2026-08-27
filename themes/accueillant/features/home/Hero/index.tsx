import Image from 'next/image';
import './style.scss';

const CLASS_NAME = 'hero';

export default function Hero() {
	return (
		<header className={CLASS_NAME}>
			<div className={`${CLASS_NAME}__grid`}>
				<div className={`${CLASS_NAME}__body`}>
					<div className={`${CLASS_NAME}__content`}>
						<div className={`${CLASS_NAME}__eyebrow`}>
							<span className={`${CLASS_NAME}__eyebrow-line`} />
							Haute-Vienne · Limousin
						</div>
						<h1 className={`${CLASS_NAME}__title`}>
							Bienvenue à Saint-Hilaire-Bonneval,{' '}
							<span className={`${CLASS_NAME}__title-highlight`}>au cœur de la Haute-Vienne</span>.
						</h1>
						<p className={`${CLASS_NAME}__desc`}>
							Entre rivières, forêts et patrimoine vivant, la commune vous accueille. Retrouvez ici vos
							démarches, l'actualité municipale et toutes les informations utiles à la vie locale.
						</p>
						<div className={`${CLASS_NAME}__actions`}>
							<a href="#demarches" className="btn-primary">
								Effectuer une démarche →
							</a>
							<a href="#tourisme" className="btn-secondary">
								Découvrir la commune
							</a>
						</div>

						<dl className={`${CLASS_NAME}__infos`}>
							<div>
								<dt>Horaires d'ouverture</dt>
								<dd>
									Mardi — Vendredi
									<span>9 h — 12 h · 14 h — 17 h</span>
								</dd>
							</div>
							<div>
								<dt>Mairie</dt>
								<dd>
									05 55 00 87 26
									<span>contact@saint-hilaire-bonneval.fr</span>
								</dd>
							</div>
						</dl>
					</div>
				</div>

				<div className={`${CLASS_NAME}__media`}>
					<Image
						src="/village-hero.jpg"
						alt="Vue aérienne de Saint-Hilaire-Bonneval et ses étangs au coucher du soleil"
						fill
						priority
						sizes="(min-width: 1024px) 50vw, 100vw"
						className={`${CLASS_NAME}__image`}
					/>
				</div>
			</div>
		</header>
	);
}
