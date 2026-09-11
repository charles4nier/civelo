import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import './style.scss';

const CLASS_NAME = 'hero-classique';

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
				alt=""
				fill
				priority
				sizes="100vw"
				className={`${CLASS_NAME}__image`}
			/>
			<div className={`${CLASS_NAME}__overlay`} />

			<div className={`container ${CLASS_NAME}__content`}>
				<p className={`${CLASS_NAME}__eyebrow`}>Bienvenue sur</p>
				<h1 className={`${CLASS_NAME}__title`}>{data.titre}</h1>
				{data.description && <p className={`${CLASS_NAME}__desc`}>{data.description}</p>}
				<div className={`${CLASS_NAME}__actions`}>
					{data.boutonPrincipal && (
						<a href={data.boutonPrincipal.href ?? '#'} className={`${CLASS_NAME}__btn-primary`}>
							{data.boutonPrincipal.label}
							<ArrowRight size={16} aria-hidden="true" />
						</a>
					)}
					{data.boutonSecondaire && (
						<a href={data.boutonSecondaire.href ?? '#'} className={`${CLASS_NAME}__btn-secondary`}>
							{data.boutonSecondaire.label}
						</a>
					)}
				</div>
			</div>
		</section>
	);
}
