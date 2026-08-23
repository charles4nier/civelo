import { RichText } from '@payloadcms/richtext-lexical/react';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import DemarchesLayout, { type DemarcheItemData } from '@themes/style-edito/components/DemarchesLayout';
import { getDemarchesItems } from '@lib/payload';

const CLASS_NAME = 'demarches';

type Category =
	| 'État civil'
	| 'Scolarité'
	| 'Citoyenneté'
	| 'Urbanisme & voirie'
	| 'Environnement'
	| 'Titres & documents';

type FallbackDemarche = {
	id: string;
	cat: Category;
	icon: string;
	title: string;
	summary: string;
	content: React.ReactNode;
};

const fallbackDemarches: FallbackDemarche[] = [
	{
		id: 'naissance',
		cat: 'État civil',
		icon: 'Baby',
		title: 'Naissance',
		summary: "Déclaration de naissance, reconnaissance d'enfant, choix du nom de famille.",
		content: (
			<>
				<p>
					La déclaration de naissance s'effectue à la mairie du lieu de naissance, dans les 5
					jours suivant l'accouchement.
				</p>
				<p>
					La reconnaissance d'enfant (couples non mariés) peut être faite avant ou après la
					naissance, dans n'importe quelle mairie.
				</p>
				<p>
					Les parents peuvent choisir librement le nom de famille de l'enfant. L'inscription se
					fait dans la commune de domicile.
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
		icon: 'Heart',
		title: 'Mariage',
		summary: 'Dossier à remettre un mois minimum avant la cérémonie.',
		content: (
			<>
				<p>
					Un dossier d'aide à la préparation du mariage est disponible en mairie. Il doit être
					remis <strong>au minimum un mois avant</strong> la date souhaitée.
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
		icon: 'PenLine',
		title: 'PACS',
		summary: 'Enregistrement du Pacte civil de solidarité en mairie, sur rendez-vous.',
		content: (
			<>
				<p>
					Le dossier de PACS est à retirer en mairie. L'enregistrement se fait{' '}
					<strong>sur rendez-vous obligatoire</strong>.
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
		icon: 'Skull',
		title: 'Décès',
		summary: 'Déclaration de décès et gestion des concessions au cimetière communal.',
		content: (
			<>
				<p>
					Le cimetière est toujours ouvert. Il dispose d'un columbarium et d'un jardin du
					souvenir.
				</p>
				<p>
					Tout travail funéraire nécessite une autorisation préalable de la mairie, sauf
					entretien courant.
				</p>
				<p>Pensez à signaler tout changement à la mairie pour la mise à jour des concessions.</p>
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
		icon: 'ShieldCheck',
		title: 'Légalisation de signature',
		summary: "Authentification d'une signature sur document privé, sur rendez-vous.",
		content: (
			<>
				<p>La légalisation de signature s'applique aux documents établis sous seing privé.</p>
				<p>
					Un <strong>rendez-vous préalable en mairie est obligatoire</strong>.
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
		icon: 'GraduationCap',
		title: "Inscription à l'école",
		summary: "Inscription à l'école primaire de Saint-Hilaire-Bonneval, dossiers et formulaires.",
		content: (
			<>
				<p>
					L'inscription se fait à la mairie de la commune de domicile. Les dossiers sont à
					retirer en mairie, à compléter et à retourner à l'accueil ou par mail.
				</p>
				<ul>
					<li>Dossier d'inscription scolaire</li>
					<li>Dossier périscolaire (garderie, cantine)</li>
					<li>Charte de bonne conduite</li>
					<li>Autorisation de photographier</li>
				</ul>
				<p>
					Pour les enfants de moins de 3 ans, contactez préalablement l'enseignante pour
					obtenir son accord.
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
		icon: 'Bus',
		title: 'Transport scolaire',
		summary:
			'Ramassage domicile–école et navette inter-écoles — inscription obligatoire auprès de la Région.',
		content: (
			<>
				<p>Il existe deux types de transport scolaire :</p>
				<ul>
					<li>
						<strong>Ramassage scolaire</strong> (domicile ↔ école) — payant, tarifs consultables
						sur le site de la Région.
					</li>
					<li>
						<strong>Navette inter-écoles</strong> — gratuite.
					</li>
				</ul>
				<p>
					L'inscription auprès de la <strong>Région Nouvelle-Aquitaine est obligatoire</strong>{' '}
					pour les deux types de transport.
				</p>
				<p>
					Pour solliciter la création d'un nouveau point d'arrêt, déposez le formulaire de
					demande complété en mairie.
				</p>
				<div className={`${CLASS_NAME}__links`}>
					<a
						href="https://www.nouvelle-aquitaine.fr/transport-scolaire"
						target="_blank"
						rel="noopener noreferrer"
						className={`${CLASS_NAME}__ext-link`}
					>
						<ExternalLink size={13} aria-hidden="true" />
						Inscription transport scolaire — Région Nouvelle-Aquitaine
					</a>
				</div>
			</>
		)
	},
	{
		id: 'recensement',
		cat: 'Citoyenneté',
		icon: 'Users',
		title: 'Recensement citoyen',
		summary:
			"Obligation légale dès 16 ans, indispensable pour les examens et l'inscription électorale.",
		content: (
			<>
				<p>
					Le recensement est <strong>obligatoire dès l'âge de 16 ans</strong>.
				</p>
				<ul>
					<li>Permet la convocation à la Journée Défense et Citoyenneté (JDC).</li>
					<li>Entraîne l'inscription automatique sur les listes électorales à 18 ans.</li>
					<li>
						L'attestation est nécessaire pour s'inscrire aux examens (BEP, Bac) et concours
						jusqu'à 25 ans.
					</li>
				</ul>
				<p>
					Contact CSNJ Limoges : 88 rue du Pont Saint-Martial, 87000 Limoges — Tél. 05 55 12 69
					92
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
		icon: 'CreditCard',
		title: "Carte d'identité, passeport, carte grise, permis de conduire",
		summary:
			"Toutes les démarches liées aux titres réglementaires se font en ligne sur le site de l'ANTS.",
		content: (
			<>
				<p>
					Depuis 2017, les démarches relatives aux titres réglementaires sont dématérialisées
					sur le site de l'<strong>Agence Nationale des Titres Sécurisés (ANTS)</strong>.
				</p>
				<p>Démarches disponibles en ligne :</p>
				<ul>
					<li>Changement de titulaire, d'adresse, déclaration de cession (carte grise)</li>
					<li>Suivi de fabrication du titre (carte grise, permis)</li>
					<li>Demande et renouvellement du permis de conduire</li>
					<li>Demande de carte d'identité ou de passeport</li>
				</ul>
				<p>
					Des médiateurs numériques sont disponibles en préfecture et sous-préfectures pour vous
					accompagner dans vos démarches.
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
		icon: 'Hammer',
		title: 'Permission de voirie',
		summary: 'Autorisation pour travaux, stationnement ou occupation du domaine public.',
		content: (
			<>
				<p>
					Toute occupation du domaine public (travaux, stationnement, événement) nécessite une
					autorisation préalable.
				</p>
				<ul>
					<li>Télécharger et compléter le formulaire n°14023*01.</li>
					<li>
						Déposer le dossier à la mairie (guichet, email ou courrier){' '}
						<strong>au minimum 15 jours avant</strong> l'événement.
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
		icon: 'Building',
		title: 'Urbanisme',
		summary: "Permis de construire, déclarations préalables et certificats d'urbanisme.",
		content: (
			<>
				<p>
					Pour tout projet de construction, extension ou aménagement, vous devez déposer une
					autorisation d'urbanisme.
				</p>
				<p>
					Les dossiers sont à retirer en mairie. Le Plan Local d'Urbanisme (PLU) est consultable
					auprès du secrétariat.
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
		icon: 'Recycle',
		title: 'Badge Recypart — déchetterie',
		summary: "Demande de badge d'accès aux déchetteries du Syded87.",
		content: (
			<>
				<p>
					Le badge Recypart permet l'accès aux déchetteries gérées par le Syded87 sur
					l'ensemble du département.
				</p>
				<p>La demande s'effectue directement en ligne sur le site du Syded87.</p>
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
		icon: 'Sprout',
		title: 'Composteur individuel',
		summary: 'Commander un composteur à tarif préférentiel via la mairie.',
		content: (
			<>
				<p>
					La commune propose des composteurs individuels à tarif préférentiel dans le cadre de
					la réduction des déchets.
				</p>
				<p>Téléchargez le bon de commande, complétez-le et retournez-le à la mairie.</p>
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

const fallbackItems: DemarcheItemData[] = fallbackDemarches.map((d) => ({
	key: d.id,
	category: d.cat,
	icon: d.icon,
	title: d.title,
	summary: d.summary,
	content: d.content
}));

const filters = [
	'Tous',
	'État civil',
	'Scolarité',
	'Citoyenneté',
	'Urbanisme & voirie',
	'Environnement',
	'Titres & documents'
];

export default async function DemarchesPage() {
	const payloadItems = await getDemarchesItems('demarches');

	const items: DemarcheItemData[] = payloadItems
		? payloadItems.map((it) => ({
				key: it.key,
				category: it.category,
				icon: it.icon,
				title: it.title,
				summary: it.summary,
				// Vide tant que le contenu n'a pas été rédigé dans l'admin
				// (décision 32 — conversion JSX→Lexical hors scope du seed).
				content: it.contenu ? <RichText data={it.contenu as never} /> : null
			}))
		: fallbackItems;

	return <DemarchesLayout filters={filters} items={items} />;
}
