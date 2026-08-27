'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import FilterBar from '@themes/app/components/FilterBar';
import {
	ChevronDown, ExternalLink, Baby, Heart, Skull, PenLine, Users,
	GraduationCap, Bus, ShieldCheck, Hammer, Building, Recycle, Sprout, CreditCard,
} from 'lucide-react';
import PageHeader from '@themes/app/components/PageHeader';
import CtaBanner from '@themes/app/components/CtaBanner';
import './style.scss';

const CLASS_NAME = 'demarches';

type Category = 'État civil' | 'Scolarité' | 'Citoyenneté' | 'Urbanisme & voirie' | 'Environnement' | 'Titres & documents';

type Demarche = { id: string; cat: Category; icon: React.ElementType; title: string; summary: string; content: React.ReactNode };

const demarches: Demarche[] = [
	{
		id: 'naissance', cat: 'État civil', icon: Baby,
		title: 'Naissance', summary: "Déclaration de naissance, reconnaissance d'enfant, choix du nom de famille.",
		content: (<>
			<p>La déclaration de naissance s'effectue à la mairie du lieu de naissance, dans les 5 jours suivant l'accouchement.</p>
			<p>La reconnaissance d'enfant (couples non mariés) peut être faite avant ou après la naissance, dans n'importe quelle mairie.</p>
			<p>Les parents peuvent choisir librement le nom de famille de l'enfant.</p>
			<div className={`${CLASS_NAME}__links`}><a href="https://www.service-public.fr/particuliers/vosdroits/F961" target="_blank" rel="noopener noreferrer" className={`${CLASS_NAME}__ext-link`}><ExternalLink size={13} />Déclaration de naissance — Service-Public.fr</a></div>
		</>),
	},
	{
		id: 'mariage', cat: 'État civil', icon: Heart,
		title: 'Mariage', summary: 'Dossier à remettre un mois minimum avant la cérémonie.',
		content: (<>
			<p>Un dossier d'aide à la préparation du mariage est disponible en mairie. Il doit être remis <strong>au minimum un mois avant</strong> la date souhaitée.</p>
			<div className={`${CLASS_NAME}__links`}><a href="https://www.service-public.fr/particuliers/vosdroits/N142" target="_blank" rel="noopener noreferrer" className={`${CLASS_NAME}__ext-link`}><ExternalLink size={13} />Mariage — Service-Public.fr</a></div>
		</>),
	},
	{
		id: 'pacs', cat: 'État civil', icon: PenLine,
		title: 'PACS', summary: 'Enregistrement du Pacte civil de solidarité en mairie, sur rendez-vous.',
		content: (<>
			<p>Le dossier de PACS est à retirer en mairie. L'enregistrement se fait <strong>sur rendez-vous obligatoire</strong>.</p>
			<div className={`${CLASS_NAME}__links`}><a href="https://www.service-public.fr/particuliers/vosdroits/F1618" target="_blank" rel="noopener noreferrer" className={`${CLASS_NAME}__ext-link`}><ExternalLink size={13} />PACS — Service-Public.fr</a></div>
		</>),
	},
	{
		id: 'deces', cat: 'État civil', icon: Skull,
		title: 'Décès', summary: 'Déclaration de décès et gestion des concessions au cimetière communal.',
		content: (<>
			<p>Le cimetière est toujours ouvert. Il dispose d'un columbarium et d'un jardin du souvenir.</p>
			<p>Tout travail funéraire nécessite une autorisation préalable de la mairie, sauf entretien courant.</p>
			<div className={`${CLASS_NAME}__links`}><a href="https://www.service-public.fr/particuliers/vosdroits/F16507" target="_blank" rel="noopener noreferrer" className={`${CLASS_NAME}__ext-link`}><ExternalLink size={13} />Un proche est décédé — Service-Public.fr</a></div>
		</>),
	},
	{
		id: 'legalisation', cat: 'État civil', icon: ShieldCheck,
		title: 'Légalisation de signature', summary: "Authentification d'une signature sur document privé, sur rendez-vous.",
		content: (<>
			<p>La légalisation de signature s'applique aux documents établis sous seing privé.</p>
			<p>Un <strong>rendez-vous préalable en mairie est obligatoire</strong>.</p>
			<div className={`${CLASS_NAME}__links`}><a href="https://www.service-public.fr/particuliers/vosdroits/F1209" target="_blank" rel="noopener noreferrer" className={`${CLASS_NAME}__ext-link`}><ExternalLink size={13} />Légalisation de signature — Service-Public.fr</a></div>
		</>),
	},
	{
		id: 'ecole', cat: 'Scolarité', icon: GraduationCap,
		title: "Inscription à l'école", summary: "Inscription à l'école primaire, dossiers et formulaires.",
		content: (<>
			<p>L'inscription se fait à la mairie de la commune de domicile. Les dossiers sont à retirer en mairie, à compléter et à retourner à l'accueil ou par mail.</p>
			<ul><li>Dossier d'inscription scolaire</li><li>Dossier périscolaire (garderie, cantine)</li><li>Charte de bonne conduite</li></ul>
			<div className={`${CLASS_NAME}__note`}><ShieldCheck size={13} />Renseignements et dossiers disponibles en mairie.</div>
		</>),
	},
	{
		id: 'transport', cat: 'Scolarité', icon: Bus,
		title: 'Transport scolaire', summary: 'Ramassage domicile–école — inscription obligatoire auprès de la Région.',
		content: (<>
			<p>Il existe deux types de transport scolaire :</p>
			<ul><li><strong>Ramassage scolaire</strong> (domicile ↔ école) — payant.</li><li><strong>Navette inter-écoles</strong> — gratuite.</li></ul>
			<p>L'inscription auprès de la <strong>Région est obligatoire</strong> pour les deux types de transport.</p>
		</>),
	},
	{
		id: 'recensement', cat: 'Citoyenneté', icon: Users,
		title: 'Recensement citoyen', summary: "Obligation légale dès 16 ans, indispensable pour les examens et l'inscription électorale.",
		content: (<>
			<p>Le recensement est <strong>obligatoire dès l'âge de 16 ans</strong>.</p>
			<ul><li>Permet la convocation à la Journée Défense et Citoyenneté (JDC).</li><li>Entraîne l'inscription automatique sur les listes électorales à 18 ans.</li></ul>
			<div className={`${CLASS_NAME}__links`}><a href="https://www.service-public.fr/particuliers/vosdroits/R2054" target="_blank" rel="noopener noreferrer" className={`${CLASS_NAME}__ext-link`}><ExternalLink size={13} />Formulaire de recensement — Service-Public.fr</a></div>
		</>),
	},
	{
		id: 'titres', cat: 'Titres & documents', icon: CreditCard,
		title: "Carte d'identité, passeport, permis de conduire",
		summary: "Toutes les démarches liées aux titres réglementaires se font en ligne sur le site de l'ANTS.",
		content: (<>
			<p>Depuis 2017, les démarches relatives aux titres réglementaires sont dématérialisées sur le site de l'<strong>Agence Nationale des Titres Sécurisés (ANTS)</strong>.</p>
			<div className={`${CLASS_NAME}__links`}><a href="https://www.ants.gouv.fr" target="_blank" rel="noopener noreferrer" className={`${CLASS_NAME}__ext-link`}><ExternalLink size={13} />Agence Nationale des Titres Sécurisés — ants.gouv.fr</a></div>
		</>),
	},
	{
		id: 'voirie', cat: 'Urbanisme & voirie', icon: Hammer,
		title: 'Permission de voirie', summary: 'Autorisation pour travaux, stationnement ou occupation du domaine public.',
		content: (<>
			<p>Toute occupation du domaine public nécessite une autorisation préalable. Déposer le dossier à la mairie <strong>au minimum 15 jours avant</strong> l'événement.</p>
			<div className={`${CLASS_NAME}__links`}><a href="https://entreprendre.service-public.fr/vosdroits/R17000" target="_blank" rel="noopener noreferrer" className={`${CLASS_NAME}__ext-link`}><ExternalLink size={13} />Formulaire n°14023*01 — Service-Public.fr</a></div>
		</>),
	},
	{
		id: 'urbanisme', cat: 'Urbanisme & voirie', icon: Building,
		title: 'Urbanisme', summary: "Permis de construire, déclarations préalables et certificats d'urbanisme.",
		content: (<>
			<p>Pour tout projet de construction, extension ou aménagement, vous devez déposer une autorisation d'urbanisme.</p>
			<div className={`${CLASS_NAME}__links`}><a href="https://www.service-public.fr/particuliers/vosdroits/N319" target="_blank" rel="noopener noreferrer" className={`${CLASS_NAME}__ext-link`}><ExternalLink size={13} />Autorisations d'urbanisme — Service-Public.fr</a></div>
		</>),
	},
	{
		id: 'recypart', cat: 'Environnement', icon: Recycle,
		title: 'Badge déchetterie', summary: "Demande de badge d'accès aux déchetteries locales.",
		content: (<>
			<p>Le badge permet l'accès aux déchetteries du territoire. La demande s'effectue directement en ligne auprès du syndicat de gestion des déchets.</p>
		</>),
	},
	{
		id: 'composteur', cat: 'Environnement', icon: Sprout,
		title: 'Composteur individuel', summary: 'Commander un composteur à tarif préférentiel via la mairie.',
		content: (<>
			<p>La commune propose des composteurs individuels à tarif préférentiel dans le cadre de la réduction des déchets.</p>
			<p>Téléchargez le bon de commande, complétez-le et retournez-le à la mairie.</p>
		</>),
	},
];

const filters: ('Tous' | Category)[] = ['Tous', 'État civil', 'Scolarité', 'Citoyenneté', 'Urbanisme & voirie', 'Environnement', 'Titres & documents'];

function AccordionItem({ item }: { item: Demarche }) {
	const [open, setOpen] = useState(false);
	const Icon = item.icon;
	return (
		<div className={`${CLASS_NAME}__item${open ? ` ${CLASS_NAME}__item--open` : ''}`}>
			<button className={`${CLASS_NAME}__item-header`} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
				<div className={`${CLASS_NAME}__item-icon`}><Icon size={18} strokeWidth={1.5} /></div>
				<div className={`${CLASS_NAME}__item-meta`}>
					<span className={`${CLASS_NAME}__item-cat`}>{item.cat}</span>
					<span className={`${CLASS_NAME}__item-title`}>{item.title}</span>
					<span className={`${CLASS_NAME}__item-summary`}>{item.summary}</span>
				</div>
				<ChevronDown size={18} className={`${CLASS_NAME}__item-chevron${open ? ` ${CLASS_NAME}__item-chevron--open` : ''}`} />
			</button>
			<div className={`${CLASS_NAME}__item-body${open ? ` ${CLASS_NAME}__item-body--open` : ''}`}>
				<div className={`${CLASS_NAME}__item-body-inner`}>{item.content}</div>
			</div>
		</div>
	);
}

export default async function DemarchesPage() {
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
		() => (active === 'Tous' ? demarches : demarches.filter((d) => d.cat === active)),
		[active]
	);

	const counts = useMemo(() => {
		const map: Partial<Record<'Tous' | Category, number>> = { Tous: demarches.length };
		for (const d of demarches) map[d.cat] = (map[d.cat] ?? 0) + 1;
		return map;
	}, []);

	return (
		<>
			<PageHeader
				breadcrumb="Mes démarches"
				eyebrow="Votre mairie"
				title="Mes démarches"
				subtitle={<>État civil, scolarité, urbanisme, environnement :<br />toutes les démarches en un seul endroit.</>}
			/>

			<section className={`${CLASS_NAME}__section`}>
				<div ref={sentinelRef} style={{ height: 1 }} />
				<FilterBar
					filters={filters}
					active={active}
					counts={counts as Record<string, number>}
					onSelect={(f) => { setActive(f as typeof active); setFiltersOpen(false); }}
					stuck={stuck}
					filtersOpen={filtersOpen}
					onToggle={() => setFiltersOpen((o) => !o)}
					variant="warm"
				/>

				<div className={`${CLASS_NAME}__body container`}>
					<div className={`${CLASS_NAME}__list`}>
						{filtered.map((item) => <AccordionItem key={item.id} item={item} />)}
					</div>

					<CtaBanner
						eyebrow="Besoin d'aide ?"
						title="La mairie vous accompagne dans vos démarches"
						desc="Pour toute question, le secrétariat de mairie est à votre disposition aux heures d'ouverture."
						href="mailto:contact@commune.fr"
					/>
				</div>
			</section>
		</>
	);
}
