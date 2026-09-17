import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import WaveSVG from '@themes/preau/components/WaveSVG';
import './style.scss';

export type ContentSection = {
	eyebrow: string;
	title: string;
	paragraphs: string[];
	image: string;
	imageAlt: string;
};

export type ContentStat = {
	value: string;
	label: string;
};

type Props = {
	breadcrumb: string;
	eyebrowIcon?: LucideIcon;
	eyebrow: string;
	title: string;
	subtitle: string;
	tagline: string;
	sections: ContentSection[];
	stats: ContentStat[];
	statsEyebrow?: string;
	statsTitle?: string;
};

const E = 'editorial-page';

export default function EditorialPage({
	breadcrumb,
	eyebrowIcon: EyebrowIcon,
	eyebrow,
	title,
	subtitle,
	tagline,
	sections,
	stats,
	statsEyebrow,
	statsTitle,
}: Props) {
	return (
		<>
			{/* ─── Hero ────────────────────────────────────────── */}
			<section className={`${E}__hero`}>
				<div className={`${E}__hero-inner`}>
					<nav className={`${E}__breadcrumb`} aria-label="Fil d'ariane">
						<Link href="/">Accueil</Link>
						<ChevronRight size={12} />
						<span>{breadcrumb}</span>
					</nav>

					<p className={`${E}__eyebrow`}>
						{EyebrowIcon && <EyebrowIcon size={14} />}
						{eyebrow}
					</p>

					<h1 className={`${E}__title`}>{title}</h1>

					<div className={`${E}__divider`} />

					<div className={`${E}__subtitle-upper`}>{subtitle}</div>
					<p className={`${E}__subtitle-script`}>{tagline}</p>
				</div>

				<div className={`${E}__wave`} aria-hidden="true">
					<WaveSVG />
				</div>
			</section>

			{/* ─── Sections alternées ──────────────────────────── */}
			<div className={`${E}__body`}>
				{sections.map((section, i) => (
					<section key={section.title} className={`${E}__section`}>
						<div className={`${E}__section-inner container${i % 2 === 1 ? ` ${E}__section-inner--reverse` : ''}`}>
							<div className={`${E}__card`}>
								<p className={`${E}__card-eyebrow`}>{section.eyebrow}</p>
								<h2 className={`${E}__card-title`}>{section.title}</h2>
								<div className={`${E}__card-body`}>
									{section.paragraphs.map((p, idx) => (
										<p key={idx}>{p}</p>
									))}
								</div>
							</div>
							<div className={`${E}__image-wrap`}>
								<Image
									src={section.image}
									alt={section.imageAlt}
									fill
									sizes="(max-width: 768px) 100vw, 50vw"
									className={`${E}__img`}
									loading="lazy"
								/>
							</div>
						</div>
					</section>
				))}
			</div>

			{/* ─── Stats ───────────────────────────────────────── */}
			<section className={`${E}__stats-section`}>
				<div className={`${E}__stats-divider`} aria-hidden="true" />
				<div className={`${E}__stats-inner container`}>
					{(statsEyebrow || statsTitle) && (
						<div className={`${E}__stats-header`}>
							{statsEyebrow && <p className={`${E}__stats-eyebrow`}>{statsEyebrow}</p>}
							{statsTitle  && <h2 className={`${E}__stats-title`}>{statsTitle}</h2>}
						</div>
					)}
					<div className={`${E}__stats-grid`}>
						{stats.map((s) => (
							<div key={s.label} className={`${E}__stat`}>
								<div className={`${E}__stat-value`}>{s.value}</div>
								<p className={`${E}__stat-label`}>{s.label}</p>
							</div>
						))}
					</div>
				</div>
			</section>
		</>
	);
}
