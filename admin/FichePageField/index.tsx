'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FieldLabel, RelationshipField, useAuth, useConfig, useField, useForm } from '@payloadcms/ui';
import type { RelationshipFieldClientComponent } from 'payload';
import { lireSession } from '../lib/fiches';
import './style.scss';

// Décision 98 — champ « Page » d'une fiche. Une fiche créée depuis « Publier
// une fiche › <page> » arrive avec `?page=<id>` (bouton « Nouvelle fiche ») :
// la page est préremplie. Repli sur la dernière liste ouverte
// (`sessionStorage`) si l'URL ne la porte pas.
//
// Retour client (2026-09-30) : même prérempli, un menu déroulant obligatoire
// avait l'air de demander « à quelle page lier ? », alors que l'entrée d'où
// l'on vient le dit déjà. Dès que la page est connue, elle s'affiche donc en
// simple texte (« Publiée dans : Actualités »), sans rien à choisir. Seul le
// super-admin garde le menu, pour déplacer une fiche d'une page à l'autre ;
// le menu reste aussi en repli quand la page est inconnue (création sans
// passer par une entrée).
//
// Recopie aussi le type de la page (`liste.layoutType`) dans le champ caché
// `type`, pour afficher tout de suite les champs propres au type (date,
// épinglage…) sans attendre l'enregistrement — le hook `beforeValidate` de
// `collections/Fiches.ts` refait ce calcul côté serveur, qui fait autorité.
const FichePageField: RelationshipFieldClientComponent = (props) => {
	const { value, setValue, formInitializing } = useField<number | string | null>({ path: props.path });
	// `type` mis à jour par une action ponctuelle du formulaire, pas par un
	// second `useField` : s'abonner à un autre champ depuis ce composant
	// provoquait une boucle de rendu dès la saisie du titre (constaté en test
	// réel, « Maximum update depth exceeded »).
	const { dispatchFields, getDataByPath } = useForm();
	const { user } = useAuth();
	const searchParams = useSearchParams();
	const { config } = useConfig();
	const apiBase = `${config.serverURL ?? ''}${config.routes?.api ?? '/api'}`;
	const prerempli = useRef(false);
	const [titrePage, setTitrePage] = useState<string | null>(null);

	// Attendre que le formulaire ait reçu son état initial du serveur : une
	// valeur posée avant est écrasée par cet état (constaté en test réel).
	useEffect(() => {
		if (formInitializing || prerempli.current || value) return;
		prerempli.current = true;
		const depuisUrl = searchParams.get('page');
		const pageId = depuisUrl || lireSession();
		if (pageId) setValue(Number.isNaN(Number(pageId)) ? pageId : Number(pageId));
	}, [formInitializing, value, setValue, searchParams]);

	useEffect(() => {
		if (!value) {
			setTitrePage(null);
			return;
		}
		let annule = false;
		fetch(`${apiBase}/pages/${value}?depth=0&draft=true`, { credentials: 'include' })
			.then((r) => (r.ok ? r.json() : null))
			.then((page) => {
				if (annule) return;
				setTitrePage(page?.title ?? null);
				const layoutType = page?.liste?.layoutType;
				if (layoutType && layoutType !== getDataByPath('type')) {
					dispatchFields({ type: 'UPDATE', path: 'type', value: layoutType });
				}
			})
			.catch(() => {});
		return () => {
			annule = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value, apiBase]);

	const superAdmin = (user as { role?: string } | null)?.role === 'super-admin';
	if (value && !superAdmin) {
		return (
			<div className="fiche-page-field">
				<FieldLabel label="Publiée dans" />
				<p className="fiche-page-field__valeur">{titrePage ?? '…'}</p>
			</div>
		);
	}

	return <RelationshipField {...props} />;
};

export default FichePageField;
