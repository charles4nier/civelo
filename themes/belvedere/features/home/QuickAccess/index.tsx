import './style.scss';

const CLASS_NAME = 'quick-access';

export type QuickAccessItemData = { key: string; icon?: string; title: string; desc?: string; href: string };

const MODS = ['sun', 'coral', 'sky'] as const;

const fallbackItems: QuickAccessItemData[] = [
	{ key: '0', title: 'Démarches administratives', desc: 'État civil, urbanisme, demandes en quelques clics.', href: '/demarches' },
	{ key: '1', title: 'Délibérations & Actes', desc: 'Comptes-rendus du conseil municipal et arrêtés.', href: '/mairie/publications' },
	{ key: '2', title: 'Services & Urgences', desc: 'Numéros utiles et services publics à proximité.', href: '/numeros-utiles' }
];

type Props = { items?: QuickAccessItemData[] };

export default function QuickAccess({ items = fallbackItems }: Props) {
	// La 4e tuile (Agenda) reste fixe — `quickAccessItems` de Payload est
	// borné à 3 lignes (décision 17, bande agenda intégrée calculée à part),
	// le design d'origine en montre 4.
	return (
		<section id="demarches" className={CLASS_NAME}>
			<div className="container">
				<div className={`${CLASS_NAME}__header`}>
					<span className="eyebrow">Services en ligne</span>
					<h2 className={`${CLASS_NAME}__title`}>L'essentiel en un clic</h2>
				</div>

				<div className={`${CLASS_NAME}__grid`}>
					{items.map((item, i) => {
						const mod = MODS[i % MODS.length];
						return (
							<a key={item.key} href={item.href} className={`${CLASS_NAME}__item ${CLASS_NAME}__item--${mod}`}>
								<div>
									<h3 className={`${CLASS_NAME}__item-title`}>{item.title}</h3>
									{item.desc && <p className={`${CLASS_NAME}__item-desc`}>{item.desc}</p>}
								</div>
								<span className={`${CLASS_NAME}__item-link`}>
									Accéder <span className={`${CLASS_NAME}__item-arrow`}>→</span>
								</span>
							</a>
						);
					})}
					<a href="#actualites" className={`${CLASS_NAME}__item ${CLASS_NAME}__item--leaf`}>
						<div>
							<h3 className={`${CLASS_NAME}__item-title`}>Agenda du village</h3>
							<p className={`${CLASS_NAME}__item-desc`}>Marchés, festivités, vie associative et culturelle.</p>
						</div>
						<span className={`${CLASS_NAME}__item-link`}>
							Accéder <span className={`${CLASS_NAME}__item-arrow`}>→</span>
						</span>
					</a>
				</div>
			</div>
		</section>
	);
}
