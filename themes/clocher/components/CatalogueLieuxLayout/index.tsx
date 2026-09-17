import Link from 'next/link';
import { ChevronRight, Building2, ShieldCheck, Info, Phone } from 'lucide-react';
import { LucideIconByName } from '@shared/lib/icons';
import './style.scss';

const CLASS_NAME = 'location';

export type CatalogueLieuxTarifLigneData = { public: string; prix: string; caution?: string };
export type CatalogueLieuxGroupeTarifsData = { label: string; lignes: CatalogueLieuxTarifLigneData[] };
export type CatalogueLieuxNoteData = { texte: string; type: 'info' | 'condition' };

export type CatalogueLieuxSalleData = {
	key: string;
	nom: string;
	description?: string;
	icone?: string;
	groupesTarifs: CatalogueLieuxGroupeTarifsData[];
	notes: CatalogueLieuxNoteData[];
};

type Props = {
	salles: CatalogueLieuxSalleData[];
};

export default function CatalogueLieuxLayout({ salles }: Props) {
	return (
		<>
			{/* Hero */}
			<section className={`${CLASS_NAME}__hero`}>
				<div className={`${CLASS_NAME}__hero-blur ${CLASS_NAME}__hero-blur--top`} />
				<div className={`${CLASS_NAME}__hero-blur ${CLASS_NAME}__hero-blur--bottom`} />
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
					<h1 className={`${CLASS_NAME}__title`}>Location de salles</h1>
					<div className={`${CLASS_NAME}__divider`} />
					<p className={`${CLASS_NAME}__subtitle`}>
						Espaces disponibles pour vos événements associatifs et familiaux.
						<br />
						Réservation et renseignements auprès de la mairie.
					</p>
				</div>
			</section>

			{/* Salles */}
			<section className={`${CLASS_NAME}__section`}>
				<div className={`${CLASS_NAME}__inner container`}>
					<div className={`${CLASS_NAME}__grid`}>
						{salles.map((salle, i) => (
							<div
								key={salle.key}
								className={`${CLASS_NAME}__salle${i % 2 === 1 ? ` ${CLASS_NAME}__salle--alt` : ''}`}
							>
								<div className={`${CLASS_NAME}__salle-header`}>
									<div
										className={`${CLASS_NAME}__salle-icon${i % 2 === 1 ? ` ${CLASS_NAME}__salle-icon--alt` : ''}`}
									>
										<LucideIconByName
											name={salle.icone}
											size={22}
											strokeWidth={1.5}
											aria-hidden="true"
										/>
									</div>
									<h2 className={`${CLASS_NAME}__salle-title`}>{salle.nom}</h2>
									{salle.description && (
										<p className={`${CLASS_NAME}__salle-desc`}>{salle.description}</p>
									)}
								</div>

								<div className={`${CLASS_NAME}__salle-body`}>
									{salle.groupesTarifs.map((groupe) => (
										<div key={groupe.label}>
											<p className={`${CLASS_NAME}__tarif-group-label`}>{groupe.label}</p>
											<div className={`${CLASS_NAME}__tarifs`}>
												{groupe.lignes.map((ligne, j) => (
													<div key={j} className={`${CLASS_NAME}__tarif`}>
														<span className={`${CLASS_NAME}__tarif-public`}>{ligne.public}</span>
														<span
															className={`${CLASS_NAME}__tarif-price${ligne.prix.toLowerCase() === 'gratuit' ? ` ${CLASS_NAME}__tarif-price--free` : ''}`}
														>
															{ligne.prix}
														</span>
														{ligne.caution && (
															<span className={`${CLASS_NAME}__tarif-caution`}>{ligne.caution}</span>
														)}
													</div>
												))}
											</div>
										</div>
									))}

									{salle.notes.map((note, k) =>
										note.type === 'condition' ? (
											<div key={k} className={`${CLASS_NAME}__salle-condition`}>
												<Info size={14} aria-hidden="true" />
												<span>{note.texte}</span>
											</div>
										) : (
											<div key={k} className={`${CLASS_NAME}__salle-note`}>
												<ShieldCheck size={14} aria-hidden="true" />
												<span>{note.texte}</span>
											</div>
										)
									)}
								</div>
							</div>
						))}
					</div>

					{/* CTA mairie */}
					<div className={`${CLASS_NAME}__cta`}>
						<div>
							<p className={`${CLASS_NAME}__cta-eyebrow`}>Réservation</p>
							<h3 className={`${CLASS_NAME}__cta-title`}>
								Toutes les modalités sont disponibles à la mairie
							</h3>
							<p className={`${CLASS_NAME}__cta-desc`}>
								Pour réserver une salle ou obtenir le règlement complet, contactez le
								secrétariat de mairie aux heures d'ouverture.
							</p>
						</div>
						<a href="mailto:mairie@saint-hilaire-bonneval.fr" className={`${CLASS_NAME}__cta-btn btn-primary`}>
							<Phone size={15} aria-hidden="true" />
							Contacter la mairie
						</a>
					</div>
				</div>
			</section>
		</>
	);
}
