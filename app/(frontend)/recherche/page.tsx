import type { Metadata } from 'next';
import AtelierRecherchePage from '@themes/atelier/components/RecherchePage';
import ClocherRecherchePage from '@themes/clocher/components/RecherchePage';
import PreauRecherchePage from '@themes/preau/components/RecherchePage';
import BelvedereRecherchePage from '@themes/belvedere/components/RecherchePage';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import { getPayloadClient, rechercher } from '@lib/payload';

// Décision 98 (§7, étape 4) — page de résultats de recherche, dans les 4
// thèmes. Pas indexée : une page de résultats n'a pas d'intérêt dans Google.
export const metadata: Metadata = { title: 'Recherche', robots: { index: false, follow: true } };

type Props = { searchParams: Promise<{ q?: string | string[] }> };

export default async function Page({ searchParams }: Props) {
	const brut = (await searchParams).q;
	const q = (Array.isArray(brut) ? brut[0] : brut ?? '').trim().slice(0, 100);
	const resultats = q ? await rechercher(q) : [];
	const payload = await getPayloadClient();
	const theme = await getCurrentTheme(payload);
	const Component = pickTheme(theme, {
		atelier: AtelierRecherchePage,
		clocher: ClocherRecherchePage,
		preau: PreauRecherchePage,
		belvedere: BelvedereRecherchePage
	});
	return <Component q={q} resultats={resultats} />;
}
