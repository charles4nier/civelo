import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import './style.scss';

const CLASS_NAME = 'hero';

export type HeroData = {
	image: string;
	titre: string;
	description?: string;
	boutonPrincipal?: { label: string; href?: string };
	boutonSecondaire?: { label: string; href?: string };
};

type Props = { data: HeroData };

export default function Hero({ data }: Props) {
	return (
		<section className={CLASS_NAME}>
			<Image
				src={data.image}
				alt="Vue aérienne de Saint-Martin et ses étangs au coucher du soleil"
				fill
				priority
				sizes="100vw"
				className={`${CLASS_NAME}__image`}
			/>
			<div className={`${CLASS_NAME}__overlay`} />

			<div className={`${CLASS_NAME}__content container`}>
				<div className={`${CLASS_NAME}__body animate-fade-up`}>
					<h1 className={`${CLASS_NAME}__title`}>{data.titre}</h1>

					<div className={`${CLASS_NAME}__divider`} />

					{data.description && <p className={`${CLASS_NAME}__desc`}>{data.description}</p>}

					<div className={`${CLASS_NAME}__actions`}>
						{data.boutonPrincipal && (
							<a href={data.boutonPrincipal.href ?? '#'} className="btn-primary">
								{data.boutonPrincipal.label}
								<ArrowRight size={16} className={`${CLASS_NAME}__arrow`} aria-hidden="true" />
							</a>
						)}
						{data.boutonSecondaire && (
							<a href={data.boutonSecondaire.href ?? '#'} className="btn-secondary">
								{data.boutonSecondaire.label}
							</a>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
