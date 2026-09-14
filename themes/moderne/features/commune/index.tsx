import { MapPin } from 'lucide-react';
import EditorialPage from '@themes/moderne/components/EditorialPage';
import { mapEditorialBlocks } from '@themes/moderne/components/EditorialPage/mapBlocks';
import { getEditorialData } from '@lib/payload';
import { eyebrow, title, subtitle, tagline, sections, statsEyebrow, statsTitle, stats } from './data';

export default async function CommunePage() {
	const data = await getEditorialData('vivre/la-commune');
	const mapped = data?.sections?.length ? mapEditorialBlocks(data.sections) : null;

	return (
		<EditorialPage
			breadcrumb="La commune"
			eyebrowIcon={MapPin}
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
