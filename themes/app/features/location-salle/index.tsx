import { Building2, Info, ShieldCheck, Phone } from 'lucide-react';
import PageHeader from '@themes/app/components/PageHeader';
import CtaBanner from '@themes/app/components/CtaBanner';
import { LucideIconByName } from '@shared/lib/icons';
import { getCatalogueLieuxItems } from '@lib/payload';
import './style.scss';

const CLASS_NAME = 'location';

type Ligne = { public: string; prix: string; caution?: string };
type GroupeTarif = { label: string; lignes: Ligne[] };
type Note = { texte: string; type: 'info' | 'condition' };
type Salle = { key: string; nom: string; description?: string; icone?: string; groupesTarifs: GroupeTarif[]; notes: Note[] };

const fallbackSalles: Salle[] = [
	{
		key: 'polyvalente',
		nom: 'Salle polyvalente',
		description: 'Location à caractère associatif ou familial.',
		icone: 'Building2',
		groupesTarifs: [
			{
				label: 'Manifestations',
				lignes: [
					{ public: 'Associations de la commune', prix: 'Gratuit', caution: 'Caution 160 €' },
					{ public: 'Habitants de la commune', prix: '260 €', caution: 'Caution 260 €' },
					{ public: 'Personnes extérieures', prix: '350 €', caution: 'Caution 350 €' }
				]
			}
		],
		notes: [{ texte: 'Assurance obligatoire · État des lieux avant et après utilisation', type: 'info' }]
	}
];

export default async function LocationSallePage() {
	const items = await getCatalogueLieuxItems('location-salle');
	const salles: Salle[] = items?.length
		? items.map((s) => ({
				key: s.key,
				nom: s.nom,
				description: s.description,
				icone: s.icone,
				groupesTarifs: s.groupesTarifs,
				notes: s.notes
			}))
		: fallbackSalles;

	return (
		<>
			<PageHeader
				breadcrumb="Location de salles"
				eyebrowIcon={Building2}
				eyebrow="Votre mairie"
				title="Location de salles"
				subtitle={<>Des espaces disponibles pour vos événements associatifs et familiaux.<br />Réservation et renseignements auprès de la mairie.</>}
			/>

			<section className={`${CLASS_NAME}__section`}>
				<div className={`${CLASS_NAME}__inner container`}>
					<div className={`${CLASS_NAME}__grid`}>
						{salles.map((salle, i) => (
							<div key={salle.key} className={`${CLASS_NAME}__salle${i % 2 === 1 ? ` ${CLASS_NAME}__salle--alt` : ''}`}>
								<div className={`${CLASS_NAME}__salle-header`}>
									<div className={`${CLASS_NAME}__salle-icon${i % 2 === 1 ? ` ${CLASS_NAME}__salle-icon--alt` : ''}`}>
										<LucideIconByName name={salle.icone ?? 'Building2'} size={22} strokeWidth={1.5} />
									</div>
									<h2 className={`${CLASS_NAME}__salle-title`}>{salle.nom}</h2>
									{salle.description && <p className={`${CLASS_NAME}__salle-desc`}>{salle.description}</p>}
								</div>

								<div className={`${CLASS_NAME}__salle-body`}>
									{salle.notes
										.filter((n) => n.type === 'condition')
										.map((n, ni) => (
											<div key={ni} className={`${CLASS_NAME}__salle-condition`}>
												<Info size={14} />
												<span>{n.texte}</span>
											</div>
										))}

									{salle.groupesTarifs.map((g) => (
										<div key={g.label}>
											<p className={`${CLASS_NAME}__tarif-group-label`}>{g.label}</p>
											<div className={`${CLASS_NAME}__tarifs`}>
												{g.lignes.map((l, li) => (
													<div key={li} className={`${CLASS_NAME}__tarif`}>
														<span className={`${CLASS_NAME}__tarif-public`}>{l.public}</span>
														<span
															className={`${CLASS_NAME}__tarif-price${l.prix.toLowerCase() === 'gratuit' ? ` ${CLASS_NAME}__tarif-price--free` : ''}`}
														>
															{l.prix}
														</span>
														{l.caution && <span className={`${CLASS_NAME}__tarif-caution`}>{l.caution}</span>}
													</div>
												))}
											</div>
										</div>
									))}

									{salle.notes
										.filter((n) => n.type === 'info')
										.map((n, ni) => (
											<div key={ni} className={`${CLASS_NAME}__salle-note`}>
												<ShieldCheck size={14} />
												<span>{n.texte}</span>
											</div>
										))}
								</div>
							</div>
						))}
					</div>

					<CtaBanner
						eyebrow="Réservation"
						title="Toutes les modalités sont disponibles à la mairie"
						desc="Pour réserver une salle ou obtenir le règlement complet, contactez le secrétariat de mairie aux heures d'ouverture."
						href="mailto:contact@commune.fr"
						icon={Phone}
					/>
				</div>
			</section>
		</>
	);
}
