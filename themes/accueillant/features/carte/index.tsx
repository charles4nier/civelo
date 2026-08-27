import ComingSoon from '@themes/accueillant/components/ComingSoon';

type Props = { initialId?: string };

export default async function CarteInteractivePage(_props: Props) {
	return <ComingSoon title="Carte interactive" section="Tourisme" sectionHref="/" />;
}
