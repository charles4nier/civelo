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
