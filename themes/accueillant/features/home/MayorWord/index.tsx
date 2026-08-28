import Image from 'next/image';
import './style.scss';

const CLASS_NAME = 'mayor-word';

export type MayorWordData = {
	image?: string;
	citation: string;
	nomSignataire?: string;
	statNombre?: string;
	statLibelle?: string;
};

type Props = { data: MayorWordData };

export default function MayorWord({ data }: Props) {
	return (
		<section className={CLASS_NAME}>
			<div className={`${CLASS_NAME}__inner container`}>

				<div className={`${CLASS_NAME}__image-col`}>
					<Image
						src={data.image ?? '/village.jpg'}
						alt="Le village"
						width={600}
						height={750}
						loading="lazy"
						className={`${CLASS_NAME}__image`}
					/>
					{data.statNombre && (
						<div className={`${CLASS_NAME}__stat`}>
							<span className={`${CLASS_NAME}__stat-number`}>{data.statNombre}</span>
							{data.statLibelle && <span className={`${CLASS_NAME}__stat-label`}>{data.statLibelle}</span>}
						</div>
					)}
				</div>

				<div className={`${CLASS_NAME}__text-col`}>
					<p className="eyebrow">Édito municipal</p>
					<h2 className={`${CLASS_NAME}__title`}>
						Le mot du <em>Maire</em>
					</h2>
					<blockquote className={`${CLASS_NAME}__quote`}>« {data.citation} »</blockquote>
					{data.nomSignataire && (
						<div className={`${CLASS_NAME}__author`}>
							<div className={`${CLASS_NAME}__author-avatar`}>{data.nomSignataire.charAt(0)}</div>
							<div>
								<p className={`${CLASS_NAME}__author-name`}>{data.nomSignataire}</p>
							</div>
						</div>
					)}
				</div>

			</div>
		</section>
	);
}
