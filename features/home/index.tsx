import Hero from './Hero';
import QuickAccess from './QuickAccess';
import Discover from './Discover';
import MayorWord from './MayorWord';
import News from './News';
import CTA from './CTA';

export default function HomePage() {
	return (
		<>
			<Hero />
			<QuickAccess />
			<News />
			<MayorWord />
			<Discover />
			<CTA />
		</>
	);
}
