import { MapPin } from 'lucide-react';
import EditorialLayout from '@themes/clocher/components/EditorialLayout';
import EditorialSections from '@themes/clocher/components/EditorialLayout/Sections';
import { getEditorialData } from '@lib/payload';
import { eyebrowText, sousTitre, sections } from './data';

const DEFAULT_GRADIENT = 'linear-gradient(135deg, oklch(0.52 0.17 240), oklch(0.70 0.16 220))';

// Décision 82 — auparavant entièrement en dur (contenu réel, non éditable).
// Même mécanique de repli que le reste du site : `data.ts` reprend ce
// contenu, affiché si Payload est injoignable ou si la page n'a pas encore
// été remplie dans l'admin.
export default async function CommunePage() {
	const data = await getEditorialData('vivre/la-commune');

	return (
		<EditorialLayout
			heroGradient={DEFAULT_GRADIENT}
			breadcrumbLabel="La commune"
			eyebrowIcon={MapPin}
			eyebrowText={data?.eyebrowText || eyebrowText}
			title={data?.title || 'La commune'}
			subtitle={data?.sousTitre || sousTitre}
		>
			<EditorialSections sections={data?.sections ?? sections} />
		</EditorialLayout>
	);
}
