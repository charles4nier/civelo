import Link from 'next/link';
import { FileText, Building2, Bell, Calendar, ArrowRight } from 'lucide-react';
import './style.scss';

const CLASS_NAME = 'quick-access';

const services = [
	{
		icon: FileText,
		title: 'Démarches administratives',
		text: 'État civil, urbanisme, demandes en quelques clics.',
		href: '/demarches',
	},
	{
		icon: Building2,
		title: 'Délibérations & Actes',
		text: 'Comptes-rendus du conseil municipal et arrêtés.',
		href: '/mairie/comptes-rendus',
	},
	{
		icon: Bell,
		title: 'Services & Urgences',
		text: 'Numéros utiles et services publics à proximité.',
		href: '/numeros-utiles',
	},
	{
		icon: Calendar,
		title: 'Agenda du village',
		text: 'Marchés, festivités, vie associative et culturelle.',
		href: '/mairie/actualites',
	},
];

export default function QuickAccess() {
	return (
		<section id="demarches" className={CLASS_NAME}>
			<div className={`${CLASS_NAME}__inner container`}>
				<div className={`${CLASS_NAME}__header`}>
					<div>
						<p className="eyebrow">Services en ligne</p>
						<h2 className={`${CLASS_NAME}__title`}>L'essentiel en un clic</h2>
					</div>
					<span className={`${CLASS_NAME}__divider`} />
				</div>

				<div className={`${CLASS_NAME}__grid`}>
					{services.map(({ icon: Icon, title, text, href }) => (
						<Link key={href} href={href} className={`${CLASS_NAME}__card`}>
							<div className={`${CLASS_NAME}__card-icon`}>
								<Icon size={20} />
							</div>
							<h3 className={`${CLASS_NAME}__card-title`}>{title}</h3>
							<p className={`${CLASS_NAME}__card-text`}>{text}</p>
							<ArrowRight size={16} className={`${CLASS_NAME}__card-arrow`} />
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
