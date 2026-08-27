import Image from 'next/image';
import { Quote } from 'lucide-react';
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
		<section className={CLASS_NAME}>
			<div className="container">
				<div className={`${CLASS_NAME}__grid`}>
					<div className={`${CLASS_NAME}__image-col`}>
						<div className={`${CLASS_NAME}__image-wrap`}>
							<Image
								src={data.image}
								alt="Le village de Saint-Hilaire-Bonneval"
								fill
								sizes="(max-width: 1024px) 100vw, 50vw"
								className={`${CLASS_NAME}__image`}
								loading="lazy"
							/>
						</div>
						{data.statNombre && (
							<div className={`${CLASS_NAME}__stat`}>
								<div className={`${CLASS_NAME}__stat-number`}>{data.statNombre}</div>
								{data.statLibelle && (
									<div className={`${CLASS_NAME}__stat-label`}>{data.statLibelle}</div>
								)}
							</div>
						)}
					</div>

					<div className={`${CLASS_NAME}__content`}>
						<p className="eyebrow">Édito municipal</p>
						<h2 className={`${CLASS_NAME}__title`}>Le mot du Maire</h2>
						<div className="divider-line" />

						<div className={`${CLASS_NAME}__quote-block`}>
							<Quote size={20} className={`${CLASS_NAME}__quote-icon`} aria-hidden="true" />
							<p className={`${CLASS_NAME}__quote-text`}>{data.citation}</p>
						</div>

						{data.nomSignataire && (
							<div className={`${CLASS_NAME}__signature`}>
								<div className={`${CLASS_NAME}__signature-avatar`}>
									{data.nomSignataire.charAt(0)}
								</div>
								<div>
									<div className={`${CLASS_NAME}__signature-name`}>{data.nomSignataire}</div>
									<div className={`${CLASS_NAME}__signature-role`}>
										Commune de Saint-Hilaire-Bonneval
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
