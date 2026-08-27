import Image from 'next/image';
import { commune } from '@themes/app/config/commune';
import './style.scss';

const CLASS_NAME = 'mayor-word';

export default function MayorWord() {
	return (
		<section className={CLASS_NAME}>
			<div className={`${CLASS_NAME}__inner container`}>

				<div className={`${CLASS_NAME}__image-col`}>
					<Image
						src="/village.jpg"
						alt={`Le village de ${commune.nom}`}
						width={600}
						height={750}
						loading="lazy"
						className={`${CLASS_NAME}__image`}
					/>
					<div className={`${CLASS_NAME}__stat`}>
						<span className={`${CLASS_NAME}__stat-number`}>{commune.population.toLocaleString('fr-FR')}</span>
						<span className={`${CLASS_NAME}__stat-label`}>Habitants au cœur du Limousin</span>
					</div>
				</div>

				<div className={`${CLASS_NAME}__text-col`}>
					<p className="eyebrow">Édito municipal</p>
					<h2 className={`${CLASS_NAME}__title`}>
						Le mot du <em>Maire</em>
					</h2>
					<blockquote className={`${CLASS_NAME}__quote`}>
						« Saint-Hilaire-Bonneval, c'est l'histoire d'un village qui avance sans renier ses
						racines. Un lieu où la nature dicte le tempo, où les liens se tissent autour de projets
						partagés. Avec l'ensemble du conseil municipal, nous travaillons chaque jour pour
						faire vivre cette commune et la transmettre, embellie, aux générations futures. »
					</blockquote>
					<div className={`${CLASS_NAME}__author`}>
						<div className={`${CLASS_NAME}__author-avatar`}>M</div>
						<div>
							<p className={`${CLASS_NAME}__author-name`}>{commune.maire}</p>
							<p className={`${CLASS_NAME}__author-role`}>Commune de {commune.nom}</p>
						</div>
					</div>
				</div>

			</div>
		</section>
	);
}
