import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import './style.scss';

const B = 'cta-banner';

type Props = {
	eyebrow: string;
	title: string;
	desc: string;
	href: string;
	buttonLabel?: string;
	icon?: LucideIcon;
};

export default function CtaBanner({ eyebrow, title, desc, href, buttonLabel = 'Contacter la mairie', icon: Icon }: Props) {
	return (
		<div className={B}>
			<div>
				<p className={`${B}__eyebrow`}>{eyebrow}</p>
				<h3 className={`${B}__title`}>{title}</h3>
				<p className={`${B}__desc`}>{desc}</p>
			</div>
			<a href={href} className={`${B}__btn`}>
				{Icon && <Icon size={15} />}
				{buttonLabel}
				<ArrowRight size={15} />
			</a>
		</div>
	);
}
