import Image from 'next/image';
import { RichText } from '@payloadcms/richtext-lexical/react';
import type { SerializedEditorState } from 'lexical';

// Décision 84 — remplace le 1er essai générique (décision 82, rejeté : la
// mise en page sur-mesure d'origine fait partie du template). 3 blocs
// fidèles au design d'origine (`features/histoire/style.scss` avant
// suppression, récupéré via git) — pas des blocs génériques recomposables.
type EditorialImage = { url?: string } | string;

export type EditorialSection =
	| {
			blockType: 'intro';
			positionImages?: 'droite' | 'gauche';
			eyebrow?: string;
			titre: string;
			corps: SerializedEditorState;
			imagePrincipale?: EditorialImage;
			imageSecondaire1?: EditorialImage;
			imageSecondaire2?: EditorialImage;
	  }
	| { blockType: 'texteCentre'; eyebrow?: string; titre: string; corps: SerializedEditorState }
	| {
			blockType: 'titreColonnesTuiles';
			eyebrow?: string;
			titre: string;
			colonneGauche: SerializedEditorState;
			colonneDroite: SerializedEditorState;
			tuiles?: { valeur: string; suffixe?: string; libelle: string }[];
	  }
	| { blockType: 'imagePleineLargeur'; imageDesktop?: EditorialImage; imageMobile?: EditorialImage; legende?: string }
	| { blockType: 'grilleImages'; image1?: EditorialImage; image2?: EditorialImage; image3?: EditorialImage };

function imageUrl(image: EditorialImage | undefined): string | undefined {
	return typeof image === 'object' ? image?.url : undefined;
}

function Triptyque({ block }: { block: Extract<EditorialSection, { blockType: 'intro' }> }) {
	const main = imageUrl(block.imagePrincipale);
	const sub1 = imageUrl(block.imageSecondaire1);
	const sub2 = imageUrl(block.imageSecondaire2);
	if (!main && !sub1 && !sub2) return null;

	return (
		<div className="editorial__image-grid">
			{main && (
				<div className="editorial__image-main">
					<Image src={main} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="editorial__img" />
				</div>
			)}
			{sub1 && (
				<div className="editorial__image-sub">
					<Image src={sub1} alt="" fill sizes="(max-width: 768px) 50vw, 25vw" className="editorial__img" />
				</div>
			)}
			{sub2 && (
				<div className="editorial__image-sub">
					<Image src={sub2} alt="" fill sizes="(max-width: 768px) 50vw, 25vw" className="editorial__img" />
				</div>
			)}
		</div>
	);
}

export default function EditorialSections({ sections }: { sections: EditorialSection[] }) {
	return (
		<>
			{sections.map((block, i) => {
				if (block.blockType === 'intro') {
					const imagesGauche = block.positionImages === 'gauche';
					return (
						<section key={i} className="editorial__section">
							<div className="editorial__section-inner container">
								{imagesGauche && <Triptyque block={block} />}
								<div className="editorial__block-card">
									{block.eyebrow ? <p className="editorial__block-eyebrow">{block.eyebrow}</p> : null}
									<h2 className="editorial__block-title">{block.titre}</h2>
									<div className="editorial__block-body">
										<RichText data={block.corps} />
									</div>
								</div>
								{!imagesGauche && <Triptyque block={block} />}
							</div>
						</section>
					);
				}

				if (block.blockType === 'texteCentre') {
					return (
						<section key={i} className="editorial__section editorial__section--muted">
							<div className="editorial__evolution container">
								{block.eyebrow ? <p className="editorial__evolution-eyebrow">{block.eyebrow}</p> : null}
								<h2 className="editorial__evolution-title">{block.titre}</h2>
								<div className="editorial__evolution-divider" />
								<div className="editorial__evolution-body">
									<RichText data={block.corps} />
								</div>
							</div>
						</section>
					);
				}

				if (block.blockType === 'titreColonnesTuiles') {
					const tuiles = block.tuiles ?? [];
					return (
						<section key={i} className="editorial__section">
							<div className="editorial__today container">
								<div className="editorial__today-header">
									{block.eyebrow ? <p className="editorial__today-eyebrow">{block.eyebrow}</p> : null}
									<h2 className="editorial__today-title">{block.titre}</h2>
									<div className="editorial__today-divider" />
								</div>
								<div className="editorial__today-cols">
									<div className="editorial__today-col">
										<RichText data={block.colonneGauche} />
									</div>
									<div className="editorial__today-col">
										<RichText data={block.colonneDroite} />
									</div>
								</div>
								{tuiles.length > 0 && (
									<div className="editorial__stats">
										{tuiles.map((s, j) => (
											<div key={j} className="editorial__stat">
												<div className="editorial__stat-value">
													{s.valeur}
													{s.suffixe ? <span className="editorial__stat-suffix">{s.suffixe}</span> : null}
												</div>
												<p className="editorial__stat-label">{s.libelle}</p>
											</div>
										))}
									</div>
								)}
							</div>
						</section>
					);
				}

				if (block.blockType === 'imagePleineLargeur') {
					const desktop = imageUrl(block.imageDesktop);
					const mobile = imageUrl(block.imageMobile);
					if (!desktop && !mobile) return null;
					return (
						<section key={i} className="editorial__section">
							<div className="container">
								{desktop && (
									<div className="editorial__full-image editorial__full-image--desktop">
										<Image src={desktop} alt="" fill sizes="100vw" className="editorial__img" />
									</div>
								)}
								{mobile && (
									<div className="editorial__full-image editorial__full-image--mobile">
										<Image src={mobile} alt="" fill sizes="100vw" className="editorial__img" />
									</div>
								)}
								{block.legende ? <p className="editorial__image-legend">{block.legende}</p> : null}
							</div>
						</section>
					);
				}

				if (block.blockType === 'grilleImages') {
					const images = [imageUrl(block.image1), imageUrl(block.image2), imageUrl(block.image3)].filter(
						(u): u is string => Boolean(u)
					);
					if (images.length === 0) return null;
					return (
						<section key={i} className="editorial__section">
							<div className="editorial__grid-3 container">
								{images.map((url, j) => (
									<div key={j} className="editorial__grid-3-item">
										<Image src={url} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="editorial__img" />
									</div>
								))}
							</div>
						</section>
					);
				}

				return null;
			})}
		</>
	);
}
