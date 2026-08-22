import { ScrollText } from 'lucide-react';
import EditorialLayout from '@shared/components/EditorialLayout';
import EditorialSections from '@shared/components/EditorialLayout/Sections';
import { getEditorialData } from '../../lib/payload';
import { eyebrowText, sousTitre, sections } from './data';

const DEFAULT_GRADIENT = 'linear-gradient(135deg, oklch(0.52 0.17 240), oklch(0.70 0.16 220))';

// Décision 82 — auparavant entièrement en dur (Lorem ipsum), seule exception
// non branchée depuis la décision 41. Même mécanique de repli que le reste
// du site : `data.ts` reprend ce contenu, affiché si Payload est injoignable
// ou si la page n'a pas encore été remplie dans l'admin.
export default async function HistoirePage() {
	const data = await getEditorialData('histoire');

	return (
		<EditorialLayout
			heroGradient={DEFAULT_GRADIENT}
			breadcrumbLabel="Histoire"
			eyebrowIcon={ScrollText}
			eyebrowText={data?.eyebrowText || eyebrowText}
			title={data?.title || 'Histoire'}
			subtitle={data?.sousTitre || sousTitre}
		>
			<EditorialSections sections={data?.sections ?? sections} />
		</EditorialLayout>
	);
}
