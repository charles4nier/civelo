import Link from 'next/link';
import { ChevronRight, HardHat, ArrowLeft } from 'lucide-react';
import './style.scss';

const CLASS_NAME = 'coming-soon';

type Props = {
	title: string;
	section: string;
	sectionHref?: string;
};

export default function ComingSoon({ title, section, sectionHref = '/' }: Props) {
	return (
		<section className={`${CLASS_NAME}__hero`}>
			<div className={`${CLASS_NAME}__hero-blur ${CLASS_NAME}__hero-blur--a`} />
			<div className={`${CLASS_NAME}__hero-blur ${CLASS_NAME}__hero-blur--b`} />
			<div className={`${CLASS_NAME}__hero-content`}>
				<nav className={`${CLASS_NAME}__breadcrumb`}>
					<Link href="/">Accueil</Link>
					<ChevronRight size={13} />
					<Link href={sectionHref}>{section}</Link>
					<ChevronRight size={13} />
					<span>{title}</span>
				</nav>
				<div className={`${CLASS_NAME}__icon`}>
					<HardHat size={32} />
				</div>
				<p className={`${CLASS_NAME}__eyebrow`}>En cours de construction</p>
				<h1 className={`${CLASS_NAME}__title`}>{title}</h1>
				<div className={`${CLASS_NAME}__divider`} />
				<p className={`${CLASS_NAME}__subtitle`}>
					Cette page sera disponible très prochainement.
					<br />
					Revenez bientôt pour découvrir son contenu.
				</p>
				<Link href="/" className={`${CLASS_NAME}__back`}>
					<ArrowLeft size={16} />
					Retour à l'accueil
				</Link>
			</div>
		</section>
	);
}
