import './style.scss';

const CLASS_NAME = 'quick-access';

const items = [
	{
		title: 'Démarches administratives',
		desc: 'État civil, urbanisme, demandes en quelques clics.',
		mod: 'sun',
		href: '/demarches'
	},
	{
		title: 'Délibérations & Actes',
		desc: 'Comptes-rendus du conseil municipal et arrêtés.',
		mod: 'coral',
		href: '/mairie/publications'
	},
	{
		title: 'Services & Urgences',
		desc: 'Numéros utiles et services publics à proximité.',
		mod: 'sky',
		href: '/numeros-utiles'
	},
	{
		title: 'Agenda du village',
		desc: 'Marchés, festivités, vie associative et culturelle.',
		mod: 'leaf',
		href: '#actualites'
	}
] as const;

export default function QuickAccess() {
	return (
		<section id="demarches" className={CLASS_NAME}>
			<div className="container">
				<div className={`${CLASS_NAME}__header`}>
					<span className="eyebrow">Services en ligne</span>
					<h2 className={`${CLASS_NAME}__title`}>L'essentiel en un clic</h2>
				</div>

				<div className={`${CLASS_NAME}__grid`}>
					{items.map((item) => (
						<a key={item.title} href={item.href} className={`${CLASS_NAME}__item ${CLASS_NAME}__item--${item.mod}`}>
							<div>
								<h3 className={`${CLASS_NAME}__item-title`}>{item.title}</h3>
								<p className={`${CLASS_NAME}__item-desc`}>{item.desc}</p>
							</div>
							<span className={`${CLASS_NAME}__item-link`}>
								Accéder <span className={`${CLASS_NAME}__item-arrow`}>→</span>
							</span>
						</a>
					))}
				</div>
			</div>
		</section>
	);
}
