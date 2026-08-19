import type { ServerProps } from 'payload';
import IconPickerFieldClient from './Client';

// Décision 56 — le menu déroulant natif d'un champ `relationship` (utilisé
// pour "Icône" depuis la décision 55) n'affiche que le nom dans sa liste,
// jamais le glyphe rendu — jugé essentiel par le client, pas un détail.
// Remplace entièrement le rendu par défaut du champ (`admin.components.
// Field`, pas juste `Label`/`afterInput`) : Server Component qui récupère
// la liste des icônes une fois (même pattern que `admin/Nav`, `payload` reçu
// via les ServerProps), puis un composant client 100% custom (pas de
// réutilisation des internes react-select de Payload, non documentés/non
// destinés à être étendus) qui affiche glyphe + nom dans sa propre liste.
type Props = ServerProps & {
	path?: string;
	field?: { label?: unknown; required?: boolean };
};

export default async function IconPickerField({ payload, path, field }: Props) {
	const { docs } = await payload.find({
		collection: 'icones',
		sort: 'nom',
		limit: 0,
		pagination: false
	});

	const icones = docs.map((d) => ({
		id: String(d.id),
		nom: String(d.nom),
		icone: String(d.icone)
	}));

	return (
		<IconPickerFieldClient
			icones={icones}
			path={path}
			label={typeof field?.label === 'string' ? field.label : undefined}
			required={field?.required}
		/>
	);
}
