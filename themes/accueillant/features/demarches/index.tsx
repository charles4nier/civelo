import { RichText } from '@payloadcms/richtext-lexical/react';
import { ExternalLink } from 'lucide-react';
import DemarchesLayout, { type DemarcheItemData } from '@themes/accueillant/components/DemarchesLayout';
import { getDemarchesItems } from '@lib/payload';

type Category = 'État civil' | 'Scolarité' | 'Citoyenneté' | 'Urbanisme & voirie' | 'Environnement' | 'Titres & documents';

type Demarche = { id: string; cat: Category; icon: string; title: string; summary: string; content: React.ReactNode };

const demarches: Demarche[] = [
	{
		id: 'naissance', cat: 'État civil', icon: 'Baby',
		title: 'Naissance', summary: "Déclaration de naissance, reconnaissance d'enfant, choix du nom de famille.",
		content: (<>
			<p>La déclaration de naissance s'effectue à la mairie du lieu de naissance, dans les 5 jours suivant l'accouchement.</p>
			<div className="demarches__links"><a href="https://www.service-public.fr/particuliers/vosdroits/F961" target="_blank" rel="noopener noreferrer" className="demarches__ext-link"><ExternalLink size={13} />Déclaration de naissance — Service-Public.fr</a></div>
		</>),
	},
	{
		id: 'mariage', cat: 'État civil', icon: 'Heart',
		title: 'Mariage', summary: 'Dossier à remettre un mois minimum avant la cérémonie.',
		content: (<><p>Un dossier d'aide à la préparation du mariage est disponible en mairie. Il doit être remis au minimum un mois avant la date souhaitée.</p></>),
	},
	{
		id: 'ecole', cat: 'Scolarité', icon: 'GraduationCap',
		title: "Inscription à l'école", summary: "Inscription à l'école primaire, dossiers et formulaires.",
		content: (<><p>L'inscription se fait à la mairie de la commune de domicile.</p></>),
	},
	{
		id: 'recensement', cat: 'Citoyenneté', icon: 'Users',
		title: 'Recensement citoyen', summary: "Obligation légale dès 16 ans, indispensable pour les examens et l'inscription électorale.",
		content: (<><p>Le recensement est obligatoire dès l'âge de 16 ans.</p></>),
	},
	{
		id: 'urbanisme', cat: 'Urbanisme & voirie', icon: 'Building',
		title: 'Urbanisme', summary: "Permis de construire, déclarations préalables et certificats d'urbanisme.",
		content: (<><p>Pour tout projet de construction, extension ou aménagement, vous devez déposer une autorisation d'urbanisme.</p></>),
	},
	{
		id: 'composteur', cat: 'Environnement', icon: 'Sprout',
		title: 'Composteur individuel', summary: 'Commander un composteur à tarif préférentiel via la mairie.',
		content: (<><p>La commune propose des composteurs individuels à tarif préférentiel dans le cadre de la réduction des déchets.</p></>),
	},
];

const fallbackItems: DemarcheItemData[] = demarches.map((d) => ({
	key: d.id,
	category: d.cat,
	icon: d.icon,
	title: d.title,
	summary: d.summary,
	content: d.content
}));

const filters = ['Tous', 'État civil', 'Scolarité', 'Citoyenneté', 'Urbanisme & voirie', 'Environnement', 'Titres & documents'];

export default async function DemarchesPage() {
	const payloadItems = await getDemarchesItems('demarches');
	const items: DemarcheItemData[] =
		payloadItems?.map((it) => ({
			key: it.key,
			category: it.category,
			icon: it.icon,
			title: it.title,
			summary: it.summary,
			content: it.contenu ? <RichText data={it.contenu as never} /> : null
		})) ?? fallbackItems;

	return <DemarchesLayout filters={filters} items={items} />;
}
