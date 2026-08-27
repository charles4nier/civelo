import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import './style.scss';

type BreadcrumbItem = { label: string; href?: string };

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
	return (
		<nav className="breadcrumb" aria-label="Fil d'Ariane">
			{items.map((item, i) => (
				<span key={i} className="breadcrumb__item">
					{i > 0 && (
						<ChevronRight
							size={13}
							className="breadcrumb__sep"
							aria-hidden="true"
						/>
					)}
					{item.href ? (
						<Link href={item.href}>{item.label}</Link>
					) : (
						<span>{item.label}</span>
					)}
				</span>
			))}
		</nav>
	);
}
