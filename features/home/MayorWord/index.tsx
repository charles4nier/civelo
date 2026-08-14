import Image from 'next/image';
import { Quote } from 'lucide-react';
import './style.scss';

const CLASS_NAME = 'mayor-word';

export default function MayorWord() {
	return (
		<section className={CLASS_NAME}>
			<div className="container">
				<div className={`${CLASS_NAME}__grid`}>
					<div className={`${CLASS_NAME}__image-col`}>
						<div className={`${CLASS_NAME}__image-wrap`}>
							<Image
								src="/saint-hilaire-bonneval-village.jpg"
								alt="Le village de Saint-Hilaire-Bonneval"
								fill
								sizes="(max-width: 1024px) 100vw, 50vw"
								className={`${CLASS_NAME}__image`}
								loading="lazy"
							/>
						</div>
						<div className={`${CLASS_NAME}__stat`}>
							<div className={`${CLASS_NAME}__stat-number`}>
								1 022
							</div>
							<div className={`${CLASS_NAME}__stat-label`}>
								Habitants au cœur du Limousin
							</div>
						</div>
					</div>

					<div className={`${CLASS_NAME}__content`}>
						<p className="eyebrow">Édito municipal</p>
						<h2 className={`${CLASS_NAME}__title`}>
							Le mot du Maire
						</h2>
						<div className="divider-line" />

						<div className={`${CLASS_NAME}__quote-block`}>
							<Quote
								size={20}
								className={`${CLASS_NAME}__quote-icon`}
								aria-hidden="true"
							/>
							<p className={`${CLASS_NAME}__quote-text`}>
								Saint-Hilaire-Bonneval, c'est l'histoire d'un
								village qui avance sans renier ses racines. Un
								lieu où la nature dicte le tempo, où les liens
								se tissent autour de projets partagés. Avec
								l'ensemble du conseil municipal, nous
								travaillons chaque jour pour faire vivre cette
								commune et la transmettre, embellie, aux
								générations futures.
							</p>
						</div>

						<div className={`${CLASS_NAME}__signature`}>
							<div className={`${CLASS_NAME}__signature-avatar`}>
								M
							</div>
							<div>
								<div
									className={`${CLASS_NAME}__signature-name`}
								>
									Monsieur le Maire
								</div>
								<div
									className={`${CLASS_NAME}__signature-role`}
								>
									Commune de Saint-Hilaire-Bonneval
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
