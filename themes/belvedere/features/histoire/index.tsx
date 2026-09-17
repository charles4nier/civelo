import { ScrollText } from 'lucide-react';
import EditorialPage from '@themes/belvedere/components/EditorialPage';
import { mapEditorialBlocks } from '@themes/belvedere/components/EditorialPage/mapBlocks';
import { getEditorialData } from '@lib/payload';
import { eyebrow, title, subtitle, tagline, sections, statsEyebrow, statsTitle, stats } from './data';

export default async function HistoirePage() {
	const data = await getEditorialData('histoire');
	const mapped = data?.sections?.length ? mapEditorialBlocks(data.sections) : null;

	return (
		<EditorialPage
			breadcrumb="Histoire"
			eyebrowIcon={ScrollText}
			eyebrow={data?.eyebrowText || eyebrow}
			title={data?.title || title}
			subtitle={data?.sousTitre || subtitle}
			tagline={tagline}
			sections={mapped?.sections.length ? mapped.sections : sections}
			statsEyebrow={statsEyebrow}
			statsTitle={statsTitle}
			stats={mapped?.stats.length ? mapped.stats : stats}
		/>
	);
}
