import Image from 'next/image';
import { Search } from 'lucide-react';
import './style.scss';

const CLASS_NAME = 'hero';

export type HeroData = {
	image: string;
	titre: string;
	description?: string;
	boutonPrincipal?: { label: string; href?: string };
	boutonSecondaire?: { label: string; href?: string };
};

type Props = { data: HeroData };

// Repris de style-edito-test — inspiré du Hero de toulouse.fr : plus de gros
// titre/sous-titre/boutons, juste la photo et une barre de recherche centrée ;
// `L'essentiel en un clic` (QuickAccess) remonte par dessus le bas de la photo
// (voir QuickAccess/style.scss). `data.titre` reste le H1 de la page (SEO/a11y)
// mais n'est plus affiché visuellement.
export default function Hero({ data }: Props) {
	return (
		<section className={CLASS_NAME}>
			<Image
				src={data.image}
				alt="Vue aérienne de Saint-Martin et ses étangs au coucher du soleil"
				fill
				priority
				sizes="100vw"
				className={`${CLASS_NAME}__image`}
			/>
			{/* Accent décoratif — comble le coin bas-gauche resté vide sous la
			    photo (le panneau `QuickAccess` remonte à droite, pas jusque-là),
			    même esprit que le rond orange de toulouse.fr. Pas de sens en
			    tourisme (le Hero n'y est pas suivi de `QuickAccess`, cf.
			    `tourisme.scss`), qui le masque. */}
			<div className={`${CLASS_NAME}__decoration`} aria-hidden="true" />

			<div className={`${CLASS_NAME}__content container`}>
				<h1 className={`${CLASS_NAME}__title`}>{data.titre}</h1>

				<div className={`${CLASS_NAME}__search animate-fade-up`}>
					{/* Pas encore branché — UI seule pour valider le look avant de câbler une vraie recherche. */}
					<input
						type="text"
						className={`${CLASS_NAME}__search-input`}
						placeholder="Comment pouvons-nous vous aider ?"
						aria-label="Rechercher sur le site"
					/>
					<button type="button" className={`${CLASS_NAME}__search-btn`} aria-label="Rechercher">
						<Search size={20} aria-hidden="true" />
					</button>
				</div>
			</div>
		</section>
	);
}
