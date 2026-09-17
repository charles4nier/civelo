import Image from 'next/image';
import './style.scss';

const CLASS_NAME = 'mayor-word';

export type MayorWordData = {
	image: string;
	citation: string;
	nomSignataire?: string;
	statNombre?: string;
	statLibelle?: string;
};

type Props = { data: MayorWordData };

export default function MayorWord({ data }: Props) {
	return (
		<section id="le-mot-du-maire" className={CLASS_NAME}>
			<div className="container">
				<div className={`${CLASS_NAME}__grid`}>
					<div className={`${CLASS_NAME}__image-col`}>
						<div className={`${CLASS_NAME}__image-wrap`}>
							<Image
								src={data.image}
								alt=""
								fill
								sizes="(max-width: 1024px) 100vw, 50vw"
								className={`${CLASS_NAME}__image`}
								loading="lazy"
							/>
						</div>
						{data.statNombre && (
							<div className={`${CLASS_NAME}__stat`}>
								<span className={`${CLASS_NAME}__stat-number`}>{data.statNombre}</span>
								{data.statLibelle && (
									<span className={`${CLASS_NAME}__stat-label`}>{data.statLibelle}</span>
								)}
							</div>
						)}
					</div>

					<div className={`${CLASS_NAME}__content`}>
						<h2 className={`${CLASS_NAME}__title`}>Le mot du Maire</h2>
						<blockquote className={`${CLASS_NAME}__quote`}>{data.citation}</blockquote>
						{data.nomSignataire && (
							<p className={`${CLASS_NAME}__signature`}>{data.nomSignataire}</p>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
