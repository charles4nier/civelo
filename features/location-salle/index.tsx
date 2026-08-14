import Link from 'next/link';
import {
	ChevronRight,
	Building2,
	UtensilsCrossed,
	Info,
	ShieldCheck,
	Phone
} from 'lucide-react';
import './style.scss';

const CLASS_NAME = 'location';

export default function LocationSallePage() {
	return (
		<>
			{/* Hero */}
			<section className={`${CLASS_NAME}__hero`}>
				<div
					className={`${CLASS_NAME}__hero-blur ${CLASS_NAME}__hero-blur--top`}
				/>
				<div
					className={`${CLASS_NAME}__hero-blur ${CLASS_NAME}__hero-blur--bottom`}
				/>
				<div className={`${CLASS_NAME}__hero-content`}>
					<nav className={`${CLASS_NAME}__breadcrumb`} aria-label="Fil d'Ariane">
						<Link href="/">Accueil</Link>
						<ChevronRight size={14} aria-hidden="true" />
						<span>Location de salles</span>
					</nav>
					<p className={`${CLASS_NAME}__eyebrow`}>
						<Building2 size={14} aria-hidden="true" />
						Mairie de Saint-Hilaire-Bonneval
					</p>
					<h1 className={`${CLASS_NAME}__title`}>
						Location de salles
					</h1>
					<div className={`${CLASS_NAME}__divider`} />
					<p className={`${CLASS_NAME}__subtitle`}>
						Deux espaces disponibles pour vos événements associatifs
						et familiaux.
						<br />
						Réservation et renseignements auprès de la mairie.
					</p>
				</div>
			</section>

			{/* Salles */}
			<section className={`${CLASS_NAME}__section`}>
				<div className={`${CLASS_NAME}__inner container`}>
					<div className={`${CLASS_NAME}__grid`}>
						{/* Salle polyvalente */}
						<div className={`${CLASS_NAME}__salle`}>
							<div className={`${CLASS_NAME}__salle-header`}>
								<div className={`${CLASS_NAME}__salle-icon`}>
									<Building2
										size={22}
										strokeWidth={1.5}
										aria-hidden="true"
									/>
								</div>
								<h2 className={`${CLASS_NAME}__salle-title`}>
									Salle polyvalente
								</h2>
								<p className={`${CLASS_NAME}__salle-desc`}>
									Location à caractère associatif ou familial.
								</p>
							</div>

							<div className={`${CLASS_NAME}__salle-body`}>
								<p
									className={`${CLASS_NAME}__tarif-group-label`}
								>
									Manifestations
								</p>
								<div className={`${CLASS_NAME}__tarifs`}>
									<div className={`${CLASS_NAME}__tarif`}>
										<span
											className={`${CLASS_NAME}__tarif-public`}
										>
											Associations de la commune
										</span>
										<span
											className={`${CLASS_NAME}__tarif-price ${CLASS_NAME}__tarif-price--free`}
										>
											Gratuit
										</span>
										<span
											className={`${CLASS_NAME}__tarif-caution`}
										>
											Caution 160 €
										</span>
									</div>
									<div className={`${CLASS_NAME}__tarif`}>
										<span
											className={`${CLASS_NAME}__tarif-public`}
										>
											Habitants de la commune
										</span>
										<span
											className={`${CLASS_NAME}__tarif-price`}
										>
											260 €
										</span>
										<span
											className={`${CLASS_NAME}__tarif-caution`}
										>
											Caution 260 €
										</span>
									</div>
									<div className={`${CLASS_NAME}__tarif`}>
										<span
											className={`${CLASS_NAME}__tarif-public`}
										>
											Personnes extérieures
										</span>
										<span
											className={`${CLASS_NAME}__tarif-price`}
										>
											350 €
										</span>
										<span
											className={`${CLASS_NAME}__tarif-caution`}
										>
											Caution 350 €
										</span>
									</div>
								</div>

								<p
									className={`${CLASS_NAME}__tarif-group-label`}
								>
									Vins d'honneur
								</p>
								<div className={`${CLASS_NAME}__tarifs`}>
									<div className={`${CLASS_NAME}__tarif`}>
										<span
											className={`${CLASS_NAME}__tarif-public`}
										>
											Habitants de la commune
										</span>
										<span
											className={`${CLASS_NAME}__tarif-price`}
										>
											110 €
										</span>
										<span
											className={`${CLASS_NAME}__tarif-caution`}
										>
											Caution 250 €
										</span>
									</div>
									<div className={`${CLASS_NAME}__tarif`}>
										<span
											className={`${CLASS_NAME}__tarif-public`}
										>
											Personnes extérieures
										</span>
										<span
											className={`${CLASS_NAME}__tarif-price`}
										>
											160 €
										</span>
										<span
											className={`${CLASS_NAME}__tarif-caution`}
										>
											Caution 350 €
										</span>
									</div>
								</div>

								<div className={`${CLASS_NAME}__salle-note`}>
									<ShieldCheck size={14} aria-hidden="true" />
									<span>
										Assurance obligatoire · État des lieux
										avant et après utilisation
									</span>
								</div>
							</div>
						</div>

						{/* Salle du restaurant scolaire */}
						<div
							className={`${CLASS_NAME}__salle ${CLASS_NAME}__salle--alt`}
						>
							<div className={`${CLASS_NAME}__salle-header`}>
								<div
									className={`${CLASS_NAME}__salle-icon ${CLASS_NAME}__salle-icon--alt`}
								>
									<UtensilsCrossed
										size={22}
										strokeWidth={1.5}
										aria-hidden="true"
									/>
								</div>
								<h2 className={`${CLASS_NAME}__salle-title`}>
									Salle du restaurant scolaire
								</h2>
								<p className={`${CLASS_NAME}__salle-desc`}>
									Disponible uniquement le week-end pour les
									associations et particuliers, pour des
									manifestations à caractère familial ou
									associatif.
								</p>
							</div>

							<div className={`${CLASS_NAME}__salle-body`}>
								<div
									className={`${CLASS_NAME}__salle-condition`}
								>
									<Info size={14} aria-hidden="true" />
									<span>
										<strong>Traiteur obligatoire</strong> —
										lui seul et son personnel sont autorisés
										à utiliser le réfrigérateur, le four, la
										cuisinière à gaz et le lave-vaisselle.
									</span>
								</div>

								<p
									className={`${CLASS_NAME}__tarif-group-label`}
								>
									Location
								</p>
								<div className={`${CLASS_NAME}__tarifs`}>
									<div className={`${CLASS_NAME}__tarif`}>
										<span
											className={`${CLASS_NAME}__tarif-public`}
										>
											Habitants de la commune
										</span>
										<span
											className={`${CLASS_NAME}__tarif-price`}
										>
											650 €
										</span>
										<span
											className={`${CLASS_NAME}__tarif-caution`}
										>
											+ cautions
										</span>
									</div>
									<div className={`${CLASS_NAME}__tarif`}>
										<span
											className={`${CLASS_NAME}__tarif-public`}
										>
											Personnes extérieures
										</span>
										<span
											className={`${CLASS_NAME}__tarif-price`}
										>
											750 €
										</span>
										<span
											className={`${CLASS_NAME}__tarif-caution`}
										>
											+ cautions
										</span>
									</div>
								</div>

								<p
									className={`${CLASS_NAME}__tarif-group-label`}
								>
									Cautions
								</p>
								<div className={`${CLASS_NAME}__tarifs`}>
									<div className={`${CLASS_NAME}__tarif`}>
										<span
											className={`${CLASS_NAME}__tarif-public`}
										>
											Dégradation des locaux ou du
											matériel
										</span>
										<span
											className={`${CLASS_NAME}__tarif-price`}
										>
											1 000 €
										</span>
									</div>
									<div className={`${CLASS_NAME}__tarif`}>
										<span
											className={`${CLASS_NAME}__tarif-public`}
										>
											Nettoyage insuffisant ou mobilier
											non remis en place
										</span>
										<span
											className={`${CLASS_NAME}__tarif-price`}
										>
											120 €
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* CTA mairie */}
					<div className={`${CLASS_NAME}__cta`}>
						<div>
							<p className={`${CLASS_NAME}__cta-eyebrow`}>
								Réservation
							</p>
							<h3 className={`${CLASS_NAME}__cta-title`}>
								Toutes les modalités sont disponibles à la
								mairie
							</h3>
							<p className={`${CLASS_NAME}__cta-desc`}>
								Pour réserver une salle ou obtenir le règlement
								complet, contactez le secrétariat de mairie aux
								heures d'ouverture.
							</p>
						</div>
						<a
							href="mailto:mairie@saint-hilaire-bonneval.fr"
							className={`${CLASS_NAME}__cta-btn btn-primary`}
						>
							<Phone size={15} aria-hidden="true" />
							Contacter la mairie
						</a>
					</div>
				</div>
			</section>
		</>
	);
}
