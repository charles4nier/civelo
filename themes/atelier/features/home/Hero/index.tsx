import Image from 'next/image';
import './style.scss';

const CLASS_NAME = 'hero';

export type HeroData = {
	image: string;
};

type Props = { data: HeroData };

// Repris de style-edito-test — inspiré du Hero de toulouse.fr : juste la
// photo, plein cadre. Pas de H1 ici (toulouse.fr n'en a pas non plus sur sa
// page d'accueil) — le H1 de la page est porté par le nom de la commune dans
// le header (`Header/index.tsx`, `__logo-name`), présent sur toutes les
// pages. Plus de barre de recherche : déplacée dans `L'essentiel en un clic`
// (`QuickAccess`, item "Rechercher" en tête de liste, ouvre une popin) — elle
// ne rendait pas bien posée ici.
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
		</section>
	);
}
