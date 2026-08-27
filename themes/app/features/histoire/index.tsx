import { ScrollText } from 'lucide-react';
import EditorialPage from '@themes/app/components/EditorialPage';
import { eyebrow, title, subtitle, tagline, sections, statsEyebrow, statsTitle, stats } from './data';

export default async function HistoirePage() {
	return (
		<EditorialPage
			breadcrumb="Histoire"
			eyebrowIcon={ScrollText}
			eyebrow={eyebrow}
			title={title}
			subtitle={subtitle}
			tagline={tagline}
			sections={sections}
			statsEyebrow={statsEyebrow}
			statsTitle={statsTitle}
			stats={stats}
		/>
	);
}
