'use client';

import { createElement } from 'react';
import type { ComponentProps } from 'react';
import { HelpCircle } from 'lucide-react';
import { DynamicIcon } from 'lucide-react/dynamic';

// Item 11 — les données venant de Payload (catégories, items) ne peuvent
// stocker qu'un NOM d'icône (texte, sérialisable), jamais une référence de
// composant : un composant React ne peut pas traverser la frontière
// Server → Client Component.
//
// `lucide-react/dynamic` importe chaque icône à la demande (un seul SVG
// chargé par nom utilisé) plutôt que tout le paquet — la première version de
// ce fichier faisait `import * as LucideIcons from 'lucide-react'`, qui
// embarquait des centaines d'icônes inutilisées côté client (+167 Ko sur les
// pages Annuaire, mesuré au build). Découvert en testant réellement le
// build, pas en écrivant le code à l'aveugle.
//
// Les noms stockés dans le code (categoryMeta, seed) restent en PascalCase
// (ex. "Store", "ShoppingBasket") — plus lisible et cohérent avec le nom du
// composant tel qu'on le chercherait sur lucide.dev — convertis ici en
// kebab-case attendu par `dynamicIconImports`.
function toKebabCase(name: string) {
	return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

type Props = { name: string | undefined } & Omit<ComponentProps<typeof DynamicIcon>, 'name'>;

export function LucideIconByName({ name, ...props }: Props) {
	const kebab = name ? toKebabCase(name) : 'circle-help';
	return createElement(DynamicIcon, {
		name: kebab as ComponentProps<typeof DynamicIcon>['name'],
		fallback: () => createElement(HelpCircle, props),
		...props
	});
}
