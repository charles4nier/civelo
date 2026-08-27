import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { LucideIconByName } from '@shared/lib/icons';
import './style.scss';

const CLASS_NAME = 'quick-access';

export type QuickAccessItemData = {
	key: string;
	icon: string;
	title: string;
	desc?: string;
	href: string;
};

type Props = { items: QuickAccessItemData[] };

export default function QuickAccess({ items }: Props) {
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
					{items.map((item) => (
						<Link key={item.key} href={item.href} className={`${CLASS_NAME}__card`}>
							<div className={`${CLASS_NAME}__card-icon`}>
								<LucideIconByName name={item.icon} size={20} strokeWidth={2} aria-hidden="true" />
							</div>
							<h3 className={`${CLASS_NAME}__card-title`}>{item.title}</h3>
							{item.desc && <p className={`${CLASS_NAME}__card-text`}>{item.desc}</p>}
							<ArrowRight size={16} className={`${CLASS_NAME}__card-arrow`} />
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
