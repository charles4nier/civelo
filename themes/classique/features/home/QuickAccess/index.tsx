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
		<div id="demarches" className={CLASS_NAME}>
			<div className={`${CLASS_NAME}__header`}>
				<h2 className={`${CLASS_NAME}__title`}>Démarches en ligne</h2>
			</div>

			<div className={`${CLASS_NAME}__list`}>
				{items.map((item) => (
					<a key={item.key} href={item.href} className={`${CLASS_NAME}__item`}>
						<span className={`${CLASS_NAME}__item-icon`}>
							<LucideIconByName name={item.icon} size={18} strokeWidth={2} aria-hidden="true" />
						</span>
						<span className={`${CLASS_NAME}__item-text`}>
							<span className={`${CLASS_NAME}__item-title`}>{item.title}</span>
							{item.desc && <span className={`${CLASS_NAME}__item-desc`}>{item.desc}</span>}
						</span>
					</a>
				))}
				<a href="/demarches" className={`${CLASS_NAME}__cta`}>
					Toutes les démarches
				</a>
			</div>
		</div>
	);
}
