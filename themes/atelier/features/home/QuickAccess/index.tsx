import { ArrowUpRight } from 'lucide-react';
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

// Conservé ici (plutôt que dans `Agenda`) pour ne pas casser l'import de
// `Agenda/index.tsx` (`import type { NextEventData } from '../QuickAccess'`)
// — le prochain rendez-vous est désormais son propre bloc (`Agenda`), plus
// intégré à cette carte (voir `themes/atelier/features/home/index.tsx`).
export type NextEventData = {
	title: string;
	date: string; // ISO
};

type Props = { items: QuickAccessItemData[] };

export default function QuickAccess({ items }: Props) {
	return (
		<section id="demarches" className={CLASS_NAME}>
			<div className="container">
				<div className={`${CLASS_NAME}__card`}>
					<div className={`${CLASS_NAME}__header`}>
						<div>
							<p className="eyebrow">Services en ligne</p>
							<h2 className={`${CLASS_NAME}__title`}>L'essentiel en un clic</h2>
						</div>
					</div>

					<div className={`${CLASS_NAME}__grid`}>
						{items.map((item, i) => {
							const mod = ['primary', 'coral', 'leaf'][i % 3];
							return (
								<a key={item.key} href={item.href} className={`${CLASS_NAME}__item`}>
									<div className={`${CLASS_NAME}__item-icon ${CLASS_NAME}__item-icon--${mod}`}>
										<LucideIconByName name={item.icon} size={20} strokeWidth={2} aria-hidden="true" />
									</div>
									<h3 className={`${CLASS_NAME}__item-title`}>{item.title}</h3>
									{item.desc && <p className={`${CLASS_NAME}__item-desc`}>{item.desc}</p>}
									<ArrowUpRight size={16} className={`${CLASS_NAME}__item-arrow`} aria-hidden="true" />
								</a>
							);
						})}
					</div>
				</div>
			</div>
		</section>
	);
}
