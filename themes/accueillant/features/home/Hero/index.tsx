import Image from 'next/image';
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
		<header className={CLASS_NAME}>
			<div className={`${CLASS_NAME}__grid`}>
				<div className={`${CLASS_NAME}__body`}>
					<div className={`${CLASS_NAME}__content`}>
						<div className={`${CLASS_NAME}__eyebrow`}>
							<span className={`${CLASS_NAME}__eyebrow-line`} />
							Haute-Vienne · Limousin
						</div>
						<h1 className={`${CLASS_NAME}__title`}>{data.titre}</h1>
						{data.description && <p className={`${CLASS_NAME}__desc`}>{data.description}</p>}
						<div className={`${CLASS_NAME}__actions`}>
							<a href={data.boutonPrincipal?.href ?? '#demarches'} className="btn-primary">
								{data.boutonPrincipal?.label ?? 'Effectuer une démarche'} →
							</a>
							<a href={data.boutonSecondaire?.href ?? '#tourisme'} className="btn-secondary">
								{data.boutonSecondaire?.label ?? 'Découvrir la commune'}
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
						src={data.image ?? '/village-hero.jpg'}
						alt="Vue aérienne de la commune"
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
