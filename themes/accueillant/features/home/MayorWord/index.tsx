import './style.scss';

const CLASS_NAME = 'mayor-word';

export default function MayorWord() {
	return (
		<section className={CLASS_NAME}>
			<div className={`${CLASS_NAME}__dots`} aria-hidden />
			<div className={`${CLASS_NAME}__inner container`}>
				<span className={`${CLASS_NAME}__eyebrow`}>Édito municipal</span>
				<blockquote className={`${CLASS_NAME}__quote`}>
					Saint-Hilaire-Bonneval, c'est l'histoire d'un village qui avance
					<span className={`${CLASS_NAME}__quote-highlight`}> sans renier ses racines</span> — où la
					nature dicte le tempo et où les liens se tissent autour de projets partagés.
				</blockquote>

				<div className={`${CLASS_NAME}__signature`}>
					<div className={`${CLASS_NAME}__avatar`}>M</div>
					<div>
						<div className={`${CLASS_NAME}__name`}>Monsieur le Maire</div>
						<div className={`${CLASS_NAME}__role`}>Commune de Saint-Hilaire-Bonneval</div>
					</div>
				</div>
			</div>
		</section>
	);
}
