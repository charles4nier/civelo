import Link from 'next/link';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { ArrowLeft, ArrowRight, Download } from 'lucide-react';
import type { FicheData } from '@lib/payload';

// Décision 98 — corps d'une fiche (image, texte, pièces jointes, pied), le
// même dans les 4 thèmes. Pas de style ici : chaque thème habille les
// classes `fiche__*` dans son `FicheLayout/style.scss`, via le mixin commun
// `shared/styles/_fiche-body.scss` et ses propres variables. Seul l'en-tête
// (le « hero » propre à chaque thème) diffère d'un `FicheLayout` à l'autre.
export default function FicheContent({ fiche, retourClassName }: { fiche: FicheData; retourClassName?: string }) {
	return (
		<div className="fiche__body container">
			{fiche.image && (
				<figure className="fiche__figure">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={fiche.image.url}
						alt={fiche.image.alt}
						width={fiche.image.width}
						height={fiche.image.height}
						className="fiche__image"
					/>
				</figure>
			)}

			{Boolean(fiche.contenu) && (
				<div className="fiche__content">
					<RichText data={fiche.contenu as never} />
				</div>
			)}

			{fiche.piecesJointes.length > 0 && (
				<section className="fiche__attachments" aria-labelledby="fiche-pieces-jointes">
					<h2 id="fiche-pieces-jointes" className="fiche__attachments-title">
						{fiche.piecesJointes.length > 1 ? 'Documents à télécharger' : 'Document à télécharger'}
					</h2>
					<ul className="fiche__attachments-list">
						{fiche.piecesJointes.map((pj) => (
							<li key={pj.url}>
								{/* Format et poids dans l'intitulé du lien : un lien de
								    téléchargement annonce ce qu'il télécharge (RGAA 13). */}
								<a href={pj.url} className="fiche__attachment" download>
									<Download size={18} aria-hidden="true" />
									<span>
										{pj.nom}
										<span className="fiche__attachment-info">
											{' '}
											({[pj.format, pj.poids].filter(Boolean).join(', ')})
										</span>
									</span>
								</a>
							</li>
						))}
					</ul>
				</section>
			)}

			<nav className="fiche__footer" aria-label="Autour de cette fiche">
				<Link href={fiche.page.href} className="fiche__back">
					<ArrowLeft size={16} aria-hidden="true" />
					{fiche.page.titre}
				</Link>
				{fiche.pageLiee && (
					<Link href={fiche.pageLiee.href} className={retourClassName ?? 'btn-outline'}>
						{fiche.pageLiee.titre}
						<ArrowRight size={16} aria-hidden="true" />
					</Link>
				)}
			</nav>
		</div>
	);
}
