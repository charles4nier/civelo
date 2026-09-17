import type { ComponentType } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import WaveSVG from '@themes/belvedere/components/WaveSVG';
import './style.scss';

type Props = {
	breadcrumb: string;
	// `ComponentType` plutôt que `LucideIcon` (qui exige un vrai
	// `ForwardRefExoticComponent`) — accepte aussi bien une icône lucide-react
	// directe qu'un petit composant enveloppe (ex. résolution par nom via
	// `LucideIconByName`, utilisée par `AnnuaireLayout`).
	eyebrowIcon?: ComponentType<{ size?: number }>;
	eyebrow: string;
	title: React.ReactNode;
	subtitle: React.ReactNode;
	tagline?: string;
};

const E = 'page-header';

export default function PageHeader({ breadcrumb, eyebrowIcon: EyebrowIcon, eyebrow, title, subtitle, tagline }: Props) {
	return (
		<section className={`${E}`}>
			<div className={`${E}__inner`}>
				<nav className={`${E}__breadcrumb`} aria-label="Fil d'ariane">
					<Link href="/">Accueil</Link>
					<ChevronRight size={12} />
					<span>{breadcrumb}</span>
				</nav>

				<p className={`${E}__eyebrow`}>
					{EyebrowIcon && <EyebrowIcon size={14} />}
					{eyebrow}
				</p>

				<h1 className={`${E}__title`}>{title}</h1>

				<div className={`${E}__divider`} />

				<div className={`${E}__subtitle`}>{subtitle}</div>
				{tagline && <p className={`${E}__tagline`}>{tagline}</p>}
			</div>

			<div className={`${E}__wave`} aria-hidden="true">
				<WaveSVG />
			</div>
		</section>
	);
}
