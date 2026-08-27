import type { SerializedEditorState } from 'lexical';

// Décision 82 — petit constructeur de richText Lexical, pour les données de
// repli (`data.ts`) et le script de migration (`scripts/migrate-editorial.ts`)
// : mêmes paragraphes, deux usages. Formes vérifiées dans `node_modules/
// lexical/nodes/Lexical{Text,Paragraph,Element}Node.d.ts` et `LexicalNode.d.ts`
// (même méthode que pour les démarches, décision 62).
export function paragraphsToRichText(paragraphs: string[]): SerializedEditorState {
	return {
		root: {
			type: 'root',
			version: 1,
			direction: 'ltr',
			format: '',
			indent: 0,
			children: paragraphs.map((text) => ({
				type: 'paragraph',
				version: 1,
				direction: 'ltr',
				format: '',
				indent: 0,
				textFormat: 0,
				textStyle: '',
				children: [{ type: 'text', version: 1, text, detail: 0, format: 0, mode: 'normal', style: '' }]
			}))
		}
	} as unknown as SerializedEditorState;
}

// Opération inverse — pour un thème dont le gabarit éditorial attend du
// texte simple (`paragraphs: string[]`) plutôt qu'un rendu Lexical complet
// (`<RichText>`). Pas de tentative de préserver le formatage (gras,
// liens...) : jointure de tous les nœuds texte descendants de chaque bloc de
// premier niveau (paragraphe, titre, liste...) en une chaîne, un bloc = une
// chaîne du tableau retourné. Blocs vides ignorés.
type LexicalNodeLike = { type?: string; text?: string; children?: LexicalNodeLike[] };

function flattenText(node: LexicalNodeLike): string {
	if (typeof node.text === 'string') return node.text;
	if (!node.children) return '';
	return node.children.map(flattenText).join('');
}

export function richTextToParagraphs(data: SerializedEditorState | null | undefined): string[] {
	const root = (data as unknown as { root?: { children?: LexicalNodeLike[] } } | undefined)?.root;
	if (!root?.children) return [];
	return root.children.map(flattenText).map((s) => s.trim()).filter(Boolean);
}
