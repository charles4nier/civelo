'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import FilterBar from '@shared/components/FilterBar';
import {
	ChevronRight,
	ChevronDown,
	ExternalLink,
	Baby,
	Heart,
	Skull,
	PenLine,
	Users,
	GraduationCap,
	Bus,
	ShieldCheck,
	Hammer,
	Building,
	Recycle,
	Sprout,
	CreditCard
} from 'lucide-react';
import './style.scss';

const CLASS_NAME = 'demarches';

type Category =
	| 'État civil'
	| 'Scolarité'
	| 'Citoyenneté'
	| 'Urbanisme & voirie'
	| 'Environnement'
	| 'Titres & documents';

type Demarche = {
	id: string;
	cat: Category;
	icon: React.ElementType;
	title: string;
	summary: string;
	content: React.ReactNode;
};

const demarches: Demarche[] = [
	{
		id: 'naissance',
		cat: 'État civil',
		icon: Baby,
		title: 'Naissance',
		summary:
			"Déclaration de naissance, reconnaissance d'enfant, choix du nom de famille.",
		content: (
			<>
				<p>
					La déclaration de naissance s'effectue à la mairie du lieu
					de naissance, dans les 5 jours suivant l'accouchement.
				</p>
				<p>
					La reconnaissance d'enfant (couples non mariés) peut être
					faite avant ou après la naissance, dans n'importe quelle
					mairie.
				</p>
				<p>
					Les parents peuvent choisir librement le nom de famille de
					l'enfant. L'inscription se fait dans la commune de domicile.
				</p>
				<div className={`${CLASS_NAME}__links`}>
					<a
						href="https://www.service-public.fr/particuliers/vosdroits/F961"
						target="_blank"
						rel="noopener noreferrer"
						className={`${CLASS_NAME}__ext-link`}
					>
						<ExternalLink size={13} aria-hidden="true" />
						Déclaration de naissance — Service-Public.fr
					</a>
				</div>
			</>
		)
	},
	{
		id: 'mariage',
		cat: 'État civil',
		icon: Heart,
		title: 'Mariage',
		summary: 'Dossier à remettre un mois minimum avant la cérémonie.',
		content: (
			<>
				<p>
					Un dossier d'aide à la préparation du mariage est disponible
					en mairie. Il doit être remis{' '}
					<strong>au minimum un mois avant</strong> la date souhaitée.
				</p>
				<div className={`${CLASS_NAME}__links`}>
					<a
						href="https://www.service-public.fr/particuliers/vosdroits/N142"
						target="_blank"
						rel="noopener noreferrer"
						className={`${CLASS_NAME}__ext-link`}
					>
						<ExternalLink size={13} aria-hidden="true" />
						Mariage — Service-Public.fr
					</a>
				</div>
			</>
		)
	},
	{
		id: 'pacs',
		cat: 'État civil',
		icon: PenLine,
		title: 'PACS',
		summary:
			'Enregistrement du Pacte civil de solidarité en mairie, sur rendez-vous.',
		content: (
			<>
				<p>
					Le dossier de PACS est à retirer en mairie. L'enregistrement
					se fait <strong>sur rendez-vous obligatoire</strong>.
				</p>
				<div className={`${CLASS_NAME}__links`}>
					<a
						href="https://www.service-public.fr/particuliers/vosdroits/F1618"
						target="_blank"
						rel="noopener noreferrer"
						className={`${CLASS_NAME}__ext-link`}
					>
						<ExternalLink size={13} aria-hidden="true" />
						PACS — Service-Public.fr
					</a>
				</div>
			</>
		)
	},
	{
		id: 'deces',
		cat: 'État civil',
		icon: Skull,
		title: 'Décès',
		summary:
			'Déclaration de décès et gestion des concessions au cimetière communal.',
		content: (
			<>
				<p>
					Le cimetière est toujours ouvert. Il dispose d'un
					columbarium et d'un jardin du souvenir.
				</p>
				<p>
					Tout travail funéraire nécessite une autorisation préalable
					de la mairie, sauf entretien courant.
				</p>
				<p>
					Pensez à signaler tout changement à la mairie pour la mise à
					jour des concessions.
				</p>
				<div className={`${CLASS_NAME}__links`}>
					<a
						href="https://www.service-public.fr/particuliers/vosdroits/F16507"
						target="_blank"
						rel="noopener noreferrer"
						className={`${CLASS_NAME}__ext-link`}
					>
						<ExternalLink size={13} aria-hidden="true" />
						Un proche est décédé — Service-Public.fr
					</a>
				</div>
			</>
		)
	},
	{
		id: 'legalisation',
		cat: 'État civil',
		icon: ShieldCheck,
		title: 'Légalisation de signature',
		summary:
			"Authentification d'une signature sur document privé, sur rendez-vous.",
		content: (
			<>
				<p>
					La légalisation de signature s'applique aux documents
					établis sous seing privé.
				</p>
				<p>
					Un{' '}
					<strong>
						rendez-vous préalable en mairie est obligatoire
					</strong>
					.
				</p>
				<div className={`${CLASS_NAME}__links`}>
					<a
						href="https://www.service-public.fr/particuliers/vosdroits/F1209"
						target="_blank"
						rel="noopener noreferrer"
						className={`${CLASS_NAME}__ext-link`}
					>
						<ExternalLink size={13} aria-hidden="true" />
						Légalisation de signature — Service-Public.fr
					</a>
				</div>
			</>
		)
	},
	{
		id: 'ecole',
		cat: 'Scolarité',
		icon: GraduationCap,
		title: "Inscription à l'école",
		summary:
			"Inscription à l'école primaire de Saint-Hilaire-Bonneval, dossiers et formulaires.",
		content: (
			<>
				<p>
					L'inscription se fait à la mairie de la commune de domicile.
					Les dossiers sont à retirer en mairie, à compléter et à
					retourner à l'accueil ou par mail.
				</p>
				<ul>
					<li>Dossier d'inscription scolaire</li>
					<li>Dossier périscolaire (garderie, cantine)</li>
					<li>Charte de bonne conduite</li>
					<li>Autorisation de photographier</li>
				</ul>
				<p>
					Pour les enfants de moins de 3 ans, contactez préalablement
					l'enseignante pour obtenir son accord.
				</p>
				<div className={`${CLASS_NAME}__note`}>
					<ShieldCheck size={13} aria-hidden="true" />
					Renseignements et dossiers disponibles en mairie.
				</div>
			</>
		)
	},
	{
		id: 'transport',
		cat: 'Scolarité',
		icon: Bus,
		title: 'Transport scolaire',
		summary:
			'Ramassage domicile–école et navette inter-écoles — inscription obligatoire auprès de la Région.',
		content: (
			<>
				<p>Il existe deux types de transport scolaire :</p>
				<ul>
					<li>
						<strong>Ramassage scolaire</strong> (domicile ↔ école) —
						payant, tarifs consultables sur le site de la Région.
					</li>
					<li>
						<strong>Navette inter-écoles</strong> — gratuite.
					</li>
				</ul>
				<p>
					L'inscription auprès de la{' '}
					<strong>Région Nouvelle-Aquitaine est obligatoire</strong>{' '}
					pour les deux types de transport.
				</p>
				<p>
					Pour solliciter la création d'un nouveau point d'arrêt,
					déposez le formulaire de demande complété en mairie.
				</p>
				<div className={`${CLASS_NAME}__links`}>
					<a
						href="https://www.nouvelle-aquitaine.fr/transport-scolaire"
						target="_blank"
						rel="noopener noreferrer"
						className={`${CLASS_NAME}__ext-link`}
					>
						<ExternalLink size={13} aria-hidden="true" />
						Inscription transport scolaire — Région
						Nouvelle-Aquitaine
					</a>
				</div>
			</>
		)
	},
	{
		id: 'recensement',
		cat: 'Citoyenneté',
		icon: Users,
		title: 'Recensement citoyen',
		summary:
			"Obligation légale dès 16 ans, indispensable pour les examens et l'inscription électorale.",
		content: (
			<>
				<p>
					Le recensement est{' '}
					<strong>obligatoire dès l'âge de 16 ans</strong>.
				</p>
				<ul>
					<li>
						Permet la convocation à la Journée Défense et
						Citoyenneté (JDC).
					</li>
					<li>
						Entraîne l'inscription automatique sur les listes
						électorales à 18 ans.
					</li>
					<li>
						L'attestation est nécessaire pour s'inscrire aux examens
						(BEP, Bac) et concours jusqu'à 25 ans.
					</li>
				</ul>
				<p>
					Contact CSNJ Limoges : 88 rue du Pont Saint-Martial, 87000
					Limoges — Tél. 05 55 12 69 92
				</p>
				<div className={`${CLASS_NAME}__links`}>
					<a
						href="https://www.service-public.fr/particuliers/vosdroits/R2054"
						target="_blank"
						rel="noopener noreferrer"
						className={`${CLASS_NAME}__ext-link`}
					>
						<ExternalLink size={13} aria-hidden="true" />
						Formulaire de recensement — Service-Public.fr
					</a>
				</div>
			</>
		)
	},
	{
		id: 'titres',
		cat: 'Titres & documents',
		icon: CreditCard,
		title: "Carte d'identité, passeport, carte grise, permis de conduire",
		summary:
			"Toutes les démarches liées aux titres réglementaires se font en ligne sur le site de l'ANTS.",
		content: (
			<>
				<p>
					Depuis 2017, les démarches relatives aux titres
					réglementaires sont dématérialisées sur le site de l'
					<strong>
						Agence Nationale des Titres Sécurisés (ANTS)
					</strong>
					.
				</p>
				<p>Démarches disponibles en ligne :</p>
				<ul>
					<li>
						Changement de titulaire, d'adresse, déclaration de
						cession (carte grise)
					</li>
					<li>Suivi de fabrication du titre (carte grise, permis)</li>
					<li>Demande et renouvellement du permis de conduire</li>
					<li>Demande de carte d'identité ou de passeport</li>
				</ul>
				<p>
					Des médiateurs numériques sont disponibles en préfecture et
					sous-préfectures pour vous accompagner dans vos démarches.
				</p>
				<div className={`${CLASS_NAME}__links`}>
					<a
						href="https://www.ants.gouv.fr"
						target="_blank"
						rel="noopener noreferrer"
						className={`${CLASS_NAME}__ext-link`}
					>
						<ExternalLink size={13} aria-hidden="true" />
						Agence Nationale des Titres Sécurisés — ants.gouv.fr
					</a>
				</div>
			</>
		)
	},
	{
		id: 'voirie',
		cat: 'Urbanisme & voirie',
		icon: Hammer,
		title: 'Permission de voirie',
		summary:
			'Autorisation pour travaux, stationnement ou occupation du domaine public.',
		content: (
			<>
				<p>
					Toute occupation du domaine public (travaux, stationnement,
					événement) nécessite une autorisation préalable.
				</p>
				<ul>
					<li>Télécharger et compléter le formulaire n°14023*01.</li>
					<li>
						Déposer le dossier à la mairie (guichet, email ou
						courrier) <strong>au minimum 15 jours avant</strong>{' '}
						l'événement.
					</li>
				</ul>
				<div className={`${CLASS_NAME}__links`}>
					<a
						href="https://entreprendre.service-public.fr/vosdroits/R17000"
						target="_blank"
						rel="noopener noreferrer"
						className={`${CLASS_NAME}__ext-link`}
					>
						<ExternalLink size={13} aria-hidden="true" />
						Formulaire n°14023*01 — Service-Public.fr
					</a>
				</div>
			</>
		)
	},
	{
		id: 'urbanisme',
		cat: 'Urbanisme & voirie',
		icon: Building,
		title: 'Urbanisme',
		summary:
			"Permis de construire, déclarations préalables et certificats d'urbanisme.",
		content: (
			<>
				<p>
					Pour tout projet de construction, extension ou aménagement,
					vous devez déposer une autorisation d'urbanisme.
				</p>
				<p>
					Les dossiers sont à retirer en mairie. Le Plan Local
					d'Urbanisme (PLU) est consultable auprès du secrétariat.
				</p>
				<div className={`${CLASS_NAME}__links`}>
					<a
						href="https://www.service-public.fr/particuliers/vosdroits/N319"
						target="_blank"
						rel="noopener noreferrer"
						className={`${CLASS_NAME}__ext-link`}
					>
						<ExternalLink size={13} aria-hidden="true" />
						Autorisations d'urbanisme — Service-Public.fr
					</a>
				</div>
			</>
		)
	},
	{
		id: 'recypart',
		cat: 'Environnement',
		icon: Recycle,
		title: 'Badge Recypart — déchetterie',
		summary: "Demande de badge d'accès aux déchetteries du Syded87.",
		content: (
			<>
				<p>
					Le badge Recypart permet l'accès aux déchetteries gérées par
					le Syded87 sur l'ensemble du département.
				</p>
				<p>
					La demande s'effectue directement en ligne sur le site du
					Syded87.
				</p>
				<div className={`${CLASS_NAME}__links`}>
					<a
						href="https://www.syded87.org/fr/?option=com_rsform&view=rsform&formId=48"
						target="_blank"
						rel="noopener noreferrer"
						className={`${CLASS_NAME}__ext-link`}
					>
						<ExternalLink size={13} aria-hidden="true" />
						Demander un badge Recypart — Syded87
					</a>
				</div>
			</>
		)
	},
	{
		id: 'composteur',
		cat: 'Environnement',
		icon: Sprout,
		title: 'Composteur individuel',
		summary: 'Commander un composteur à tarif préférentiel via la mairie.',
		content: (
			<>
				<p>
					La commune propose des composteurs individuels à tarif
					préférentiel dans le cadre de la réduction des déchets.
				</p>
				<p>
					Téléchargez le bon de commande, complétez-le et retournez-le
					à la mairie.
				</p>
				<div className={`${CLASS_NAME}__links`}>
					<a
						href="http://www.sainthilairebonneval.fr/medias/files/bon-de-commande-composteur.pdf"
						target="_blank"
						rel="noopener noreferrer"
						className={`${CLASS_NAME}__ext-link`}
					>
						<ExternalLink size={13} aria-hidden="true" />
						Bon de commande composteur (PDF)
					</a>
				</div>
			</>
		)
	}
];

const filters: ('Tous' | Category)[] = [
	'Tous',
	'État civil',
	'Scolarité',
	'Citoyenneté',
	'Urbanisme & voirie',
	'Environnement',
	'Titres & documents'
];

function AccordionItem({ item }: { item: Demarche }) {
	const [open, setOpen] = useState(false);
	const Icon = item.icon;

	return (
		<div
			className={`${CLASS_NAME}__item${open ? ` ${CLASS_NAME}__item--open` : ''}`}
		>
			<button
				className={`${CLASS_NAME}__item-header`}
				onClick={() => setOpen((o) => !o)}
				aria-expanded={open}
			>
				<div className={`${CLASS_NAME}__item-icon`}>
					<Icon size={18} strokeWidth={1.5} aria-hidden="true" />
				</div>
				<div className={`${CLASS_NAME}__item-meta`}>
					<span className={`${CLASS_NAME}__item-cat`}>
						{item.cat}
					</span>
					<span className={`${CLASS_NAME}__item-title`}>
						{item.title}
					</span>
					<span className={`${CLASS_NAME}__item-summary`}>
						{item.summary}
					</span>
				</div>
				<ChevronDown
					size={18}
					className={`${CLASS_NAME}__item-chevron${open ? ` ${CLASS_NAME}__item-chevron--open` : ''}`}
					aria-hidden="true"
				/>
			</button>
			<div
				className={`${CLASS_NAME}__item-body${open ? ` ${CLASS_NAME}__item-body--open` : ''}`}
			>
				<div className={`${CLASS_NAME}__item-body-inner`}>
					{item.content}
				</div>
			</div>
		</div>
	);
}

export default function DemarchesPage() {
	const [active, setActive] = useState<'Tous' | Category>('Tous');
	const [stuck, setStuck] = useState(false);
	const [filtersOpen, setFiltersOpen] = useState(false);
	const sentinelRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const sentinel = sentinelRef.current;
		if (!sentinel) return;
		const observer = new IntersectionObserver(
			([entry]) => setStuck(!entry.isIntersecting),
			{ rootMargin: '-80px 0px 0px 0px', threshold: 0 }
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	}, []);

	const filtered = useMemo(
		() =>
			active === 'Tous'
				? demarches
				: demarches.filter((d) => d.cat === active),
		[active]
	);

	const counts = useMemo(() => {
		const map: Partial<Record<'Tous' | Category, number>> = {
			Tous: demarches.length
		};
		for (const d of demarches) map[d.cat] = (map[d.cat] ?? 0) + 1;
		return map;
	}, []);

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
						<span>Mes démarches</span>
					</nav>
					<p className={`${CLASS_NAME}__eyebrow`}>
						Mairie de Saint-Hilaire-Bonneval
					</p>
					<h1 className={`${CLASS_NAME}__title`}>Mes démarches</h1>
					<div className={`${CLASS_NAME}__divider`} />
					<p className={`${CLASS_NAME}__subtitle`}>
						État civil, scolarité, urbanisme, environnement :<br />
						toutes les démarches en un seul endroit.
					</p>
				</div>
			</section>

			{/* Démarches */}
			<section className={`${CLASS_NAME}__section`}>
				<div className={`${CLASS_NAME}__header container`}>
					<p className={`${CLASS_NAME}__header-eyebrow`}>Toutes les démarches</p>
					<h2 className={`${CLASS_NAME}__header-title`} aria-live="polite">
						{filtered.length} {filtered.length > 1 ? 'démarches' : 'démarche'}
					</h2>
					<div className={`${CLASS_NAME}__header-divider`} />
				</div>

				<div ref={sentinelRef} style={{ height: 1 }} />
				<FilterBar
					filters={filters}
					active={active}
					counts={counts as Record<string, number>}
					onSelect={(f) => {
						setActive(f as typeof active);
						setFiltersOpen(false);
					}}
					stuck={stuck}
					filtersOpen={filtersOpen}
					onToggle={() => setFiltersOpen((o) => !o)}
					variant="warm"
				/>

				<div className={`${CLASS_NAME}__body container`}>
					<div className={`${CLASS_NAME}__list`}>
						{filtered.map((item) => (
							<AccordionItem key={item.id} item={item} />
						))}
					</div>

					<div className={`${CLASS_NAME}__cta`}>
						<div>
							<p className={`${CLASS_NAME}__cta-eyebrow`}>
								Besoin d'aide ?
							</p>
							<h3 className={`${CLASS_NAME}__cta-title`}>
								La mairie vous accompagne dans vos démarches
							</h3>
							<p className={`${CLASS_NAME}__cta-desc`}>
								Pour toute question, le secrétariat de mairie
								est à votre disposition aux heures d'ouverture.
							</p>
						</div>
						<a
							href="mailto:mairie@saint-hilaire-bonneval.fr"
							className={`${CLASS_NAME}__cta-btn btn-primary`}
						>
							Contacter la mairie
						</a>
					</div>
				</div>
			</section>
		</>
	);
}
