import type { EditorialSection } from '@themes/edito/components/EditorialLayout/Sections';
import { richTextToParagraphs } from '@shared/lib/richText';
import type { ContentSection, ContentStat } from './index';

// Le gabarit éditorial de Payload est une liste flexible de blocs (voir
// `EditorialSection`) — le template App attend un nombre fixe de sections
// avec image (`ContentSection`), plus des statistiques séparées
// (`ContentStat`). Adaptation best-effort plutôt qu'un rendu 1:1 fidèle à
// chaque type de bloc (comme le fait edito) : `imagePleineLargeur` et
// `grilleImages` (blocs sans titre/texte) sont ignorés ici, `titreColonnes
// Tuiles` alimente les stats en plus d'une section (colonnes fusionnées).
const FALLBACK_IMAGES = ['/village.jpg', '/forest.jpg', '/lake.jpg'];

function imageUrl(image: { url?: string } | string | undefined): string | undefined {
	return typeof image === 'object' ? image?.url : undefined;
}

export function mapEditorialBlocks(blocks: EditorialSection[]): { sections: ContentSection[]; stats: ContentStat[] } {
	const sections: ContentSection[] = [];
	const stats: ContentStat[] = [];

	for (const block of blocks) {
		if (block.blockType === 'intro') {
			sections.push({
				eyebrow: block.eyebrow ?? '',
				title: block.titre,
				paragraphs: richTextToParagraphs(block.corps),
				image: imageUrl(block.imagePrincipale) ?? FALLBACK_IMAGES[sections.length % FALLBACK_IMAGES.length],
				imageAlt: block.titre
			});
		} else if (block.blockType === 'texteCentre') {
			sections.push({
				eyebrow: block.eyebrow ?? '',
				title: block.titre,
				paragraphs: richTextToParagraphs(block.corps),
				image: FALLBACK_IMAGES[sections.length % FALLBACK_IMAGES.length],
				imageAlt: block.titre
			});
		} else if (block.blockType === 'titreColonnesTuiles') {
			sections.push({
				eyebrow: block.eyebrow ?? '',
				title: block.titre,
				paragraphs: [...richTextToParagraphs(block.colonneGauche), ...richTextToParagraphs(block.colonneDroite)],
				image: FALLBACK_IMAGES[sections.length % FALLBACK_IMAGES.length],
				imageAlt: block.titre
			});
			for (const tuile of block.tuiles ?? []) {
				stats.push({ value: tuile.suffixe ? `${tuile.valeur} ${tuile.suffixe}` : tuile.valeur, label: tuile.libelle });
			}
		}
		// `imagePleineLargeur`/`grilleImages` : pas de titre/texte, hors périmètre de ce template.
	}

	return { sections, stats };
}
