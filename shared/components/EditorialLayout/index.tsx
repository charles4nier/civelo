import type { LucideIcon } from 'lucide-react';
import Breadcrumb from '@shared/components/Breadcrumb';
import './style.scss';

type Props = {
	heroGradient: string;
	breadcrumbLabel: string;
	eyebrowIcon: LucideIcon;
	eyebrowText: string;
	title: React.ReactNode;
	subtitle: React.ReactNode;
	children: React.ReactNode;
};

export default function EditorialLayout({
	heroGradient,
	breadcrumbLabel,
	eyebrowIcon: EyebrowIcon,
	eyebrowText,
	title,
	subtitle,
	children,
}: Props) {
	return (
		<>
			<section className="editorial__hero" style={{ background: heroGradient }}>
				<div className="editorial__hero-blur editorial__hero-blur--top" />
				<div className="editorial__hero-blur editorial__hero-blur--bottom" />
				<div className="editorial__hero-content">
					<Breadcrumb items={[{ label: 'Accueil', href: '/' }, { label: breadcrumbLabel }]} />
					<p className="editorial__eyebrow">
						<EyebrowIcon size={14} aria-hidden="true" />
						{eyebrowText}
					</p>
					<h1 className="editorial__title">{title}</h1>
					<div className="editorial__divider" />
					<p className="editorial__subtitle">{subtitle}</p>
				</div>
			</section>

			<div className="editorial__body">
				{children}
			</div>
		</>
	);
}
