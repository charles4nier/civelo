import './style.scss';

const CLASS_NAME = 'mayor-word';

export type MayorWordData = { citation: string; nomSignataire?: string };

type Props = { data?: MayorWordData | null; nomCommune?: string };

const FALLBACK_QUOTE = (
	<>
		Saint-Martin, c'est l'histoire d'un village qui avance
		<span className={`${CLASS_NAME}__quote-highlight`}> sans renier ses racines</span> — où la nature dicte le
		tempo et où les liens se tissent autour de projets partagés.
	</>
);

export default function MayorWord({ data, nomCommune }: Props) {
	const nomSignataire = data?.nomSignataire || 'Monsieur le Maire';
	const initiale = nomSignataire.trim().charAt(0).toUpperCase() || 'M';

	return (
		<section className={CLASS_NAME}>
			<div className={`${CLASS_NAME}__dots`} aria-hidden />
			<div className={`${CLASS_NAME}__inner container`}>
				<span className={`${CLASS_NAME}__eyebrow`}>Édito municipal</span>
				<blockquote className={`${CLASS_NAME}__quote`}>{data?.citation || FALLBACK_QUOTE}</blockquote>

				<div className={`${CLASS_NAME}__signature`}>
					<div className={`${CLASS_NAME}__avatar`}>{initiale}</div>
					<div>
						<div className={`${CLASS_NAME}__name`}>{nomSignataire}</div>
						<div className={`${CLASS_NAME}__role`}>{nomCommune ? `Commune de ${nomCommune}` : 'Commune de Saint-Martin'}</div>
					</div>
				</div>
			</div>
		</section>
	);
}
