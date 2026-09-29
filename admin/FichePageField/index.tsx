'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { RelationshipField, useConfig, useField, useForm } from '@payloadcms/ui';
import type { RelationshipFieldClientComponent } from 'payload';
import { lireSession } from '../lib/fiches';

// Décision 98 — champ « Page » d'une fiche. Une fiche créée depuis « Publier
// une fiche › <page> » arrive avec `?page=<id>` (bouton « Nouvelle fiche ») :
// la page est préremplie, l'éditeur n'a rien à choisir. Repli sur la
// dernière liste ouverte (`sessionStorage`) si l'URL ne la porte pas.
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
	const searchParams = useSearchParams();
	const { config } = useConfig();
	const apiBase = `${config.serverURL ?? ''}${config.routes?.api ?? '/api'}`;
	const prerempli = useRef(false);

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
		if (!value) return;
		let annule = false;
		fetch(`${apiBase}/pages/${value}?depth=0&draft=true`, { credentials: 'include' })
			.then((r) => (r.ok ? r.json() : null))
			.then((page) => {
				const layoutType = page?.liste?.layoutType;
				if (!annule && layoutType && layoutType !== getDataByPath('type')) {
					dispatchFields({ type: 'UPDATE', path: 'type', value: layoutType });
				}
			})
			.catch(() => {});
		return () => {
			annule = true;
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value, apiBase]);

	return <RelationshipField {...props} />;
};

export default FichePageField;
