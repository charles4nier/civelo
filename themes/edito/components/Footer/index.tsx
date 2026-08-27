import Image from 'next/image';
import { MapPin, Clock, Phone, Mail, Globe, Facebook, Instagram } from 'lucide-react';
import './style.scss';

const CLASS_NAME = 'footer';

type Props = {
	// Décision 61 — identité (logo/titre) partagée avec le Header (un seul
	// global `Identite`, plus de resaisie) ; le reste vient du global
	// `Footer` (lib/payload.ts, `getFooterData`), avec repli sur les mêmes
	// valeurs qu'avant si Payload est injoignable.
	identite: { titre: string; sousTitre?: string; logoUrl: string };
	data: {
		description: string;
		adresse?: string;
		telephone?: string;
		email?: string;
		siteWeb?: string;
		joursOuverture?: string;
		horaires?: string;
		facebook?: string;
		instagram?: string;
	};
};

export default function Footer({ identite, data }: Props) {
	const year = new Date().getFullYear();

	return (
		<footer className={CLASS_NAME}>
			<div className={`${CLASS_NAME}__inner`}>
				<div className={`${CLASS_NAME}__grid`}>
					<div className={`${CLASS_NAME}__brand`}>
						<div className={`${CLASS_NAME}__brand-logo`}>
							<div className={`${CLASS_NAME}__brand-badge`}>
								<Image
									src={identite.logoUrl}
									alt={`Blason de ${identite.titre}`}
									width={36}
									height={36}
								/>
							</div>
							<div>
								<div className={`${CLASS_NAME}__brand-name`}>
									{identite.titre}
								</div>
								{identite.sousTitre && (
									<div className={`${CLASS_NAME}__brand-sub`}>
										{identite.sousTitre}
									</div>
								)}
							</div>
						</div>
						<p className={`${CLASS_NAME}__brand-desc`}>
							{data.description}
						</p>
						<p className={`${CLASS_NAME}__brand-motto`}>
							République Française · Liberté · Égalité ·
							Fraternité
						</p>
						{data.facebook && (
							<a href={data.facebook} className={`${CLASS_NAME}__social`}>
								<Facebook size={16} aria-hidden="true" />
								Suivez-nous sur Facebook
							</a>
						)}
						{data.instagram && (
							<a href={data.instagram} className={`${CLASS_NAME}__social`}>
								<Instagram size={16} aria-hidden="true" />
								Suivez-nous sur Instagram
							</a>
						)}
					</div>

					<div className={`${CLASS_NAME}__col`}>
						<h4 className={`${CLASS_NAME}__col-title`}>
							La mairie
						</h4>
						<div className={`${CLASS_NAME}__address`}>
							{data.adresse && (
								<div className={`${CLASS_NAME}__address-item`}>
									<MapPin size={14} aria-hidden="true" />
									<span>{data.adresse}</span>
								</div>
							)}
							{(data.joursOuverture || data.horaires) && (
								<div className={`${CLASS_NAME}__address-item`}>
									<Clock size={14} aria-hidden="true" />
									<span>
										{[data.joursOuverture, data.horaires].filter(Boolean).join(' · ')}
									</span>
								</div>
							)}
							{data.telephone && (
								<div className={`${CLASS_NAME}__address-item`}>
									<Phone size={14} aria-hidden="true" />
									<span>{data.telephone}</span>
								</div>
							)}
							{data.email && (
								<div className={`${CLASS_NAME}__address-item`}>
									<Mail size={14} aria-hidden="true" />
									<span>{data.email}</span>
								</div>
							)}
							{data.siteWeb && (
								<div className={`${CLASS_NAME}__address-item`}>
									<Globe size={14} aria-hidden="true" />
									<span>{data.siteWeb}</span>
								</div>
							)}
						</div>
					</div>
				</div>

				<div className={`${CLASS_NAME}__bottom`}>
					<div>
						© {year} Mairie de {identite.titre} · Tous droits
						réservés
					</div>
				</div>
			</div>
		</footer>
	);
}
