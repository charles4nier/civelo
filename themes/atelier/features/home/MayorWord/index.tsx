import Image from 'next/image';
import { Quote } from 'lucide-react';
import './style.scss';

const CLASS_NAME = 'mayor-word';

export type MayorWordData = {
	image: string;
	citation: string;
	nomSignataire?: string;
	// Décision du 2026-09-16 — l'encart chiffré est désormais un choix
	// éditorial explicite (`Pages.ts`, `accueil.mayorWord.afficherEncart`),
	// pas seulement déduit de la présence d'un chiffre.
	afficherEncart?: boolean;
	statNombre?: string;
	statLibelle?: string;
};

type Props = { data: MayorWordData; nomCommune?: string };

export default function MayorWord({ data, nomCommune }: Props) {
	return (
		<section className={CLASS_NAME}>
			{/* Décoratif — bande verte pleine hauteur, calée sur le bord gauche de
			    la fenêtre (avant `.container` dans le DOM : peinte dessous),
			    décalée derrière la photo. */}
			<div className={`${CLASS_NAME}__decoration`} aria-hidden="true" />
			<div className="container">
				<div className={`${CLASS_NAME}__grid`}>
					<div className={`${CLASS_NAME}__image-col`}>
						<div className={`${CLASS_NAME}__image-wrap`}>
							<Image
								src={data.image}
								alt={nomCommune ? `Le village de ${nomCommune}` : 'Le village de la commune'}
								fill
								sizes="(max-width: 1024px) 100vw, 50vw"
								className={`${CLASS_NAME}__image`}
								loading="lazy"
							/>
						</div>
						{data.afficherEncart !== false && data.statNombre && (
							<div className={`${CLASS_NAME}__stat`}>
								<div className={`${CLASS_NAME}__stat-number`}>{data.statNombre}</div>
								{data.statLibelle && (
									<div className={`${CLASS_NAME}__stat-label`}>{data.statLibelle}</div>
								)}
							</div>
						)}
					</div>

					<div className={`${CLASS_NAME}__content`}>
						{/* Même traitement que "AGENDA"/"ACTUALITÉS"/"TOURISME & PATRIMOINE"
						    — plus d'eyebrow séparée ni de divider, juste ce titre. */}
						<h2 className={`${CLASS_NAME}__title`}>Édito municipal</h2>

						<div className={`${CLASS_NAME}__quote-block`}>
							<Quote size={36} className={`${CLASS_NAME}__quote-icon`} aria-hidden="true" />
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
										{nomCommune ? `Commune de ${nomCommune}` : 'Commune'}
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
