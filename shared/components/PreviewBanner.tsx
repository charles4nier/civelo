// Mode brouillon/preview (roadmap 2026-09-14) — affiché uniquement quand le
// Next.js Draft Mode est actif (posé par `app/(payload)/api/preview`).
// Styles en ligne volontairement : ce composant est rendu à l'intérieur du
// `RootLayout` de N'IMPORTE lequel des 4 thèmes (edito/moderne/accueillant/
// classique, voir `app/(frontend)/layout.tsx`), qui ont chacun leur propre
// feuille de style globale — pas de dépendance à l'une d'elles.
export default function PreviewBanner() {
	return (
		<div
			style={{
				position: 'sticky',
				top: 0,
				zIndex: 9999,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				gap: '0.75rem',
				padding: '0.5rem 1rem',
				background: '#1a1a1a',
				color: '#fff',
				fontSize: '0.85rem',
				fontFamily: 'system-ui, sans-serif',
				textAlign: 'center'
			}}
		>
			<span>Vous visualisez un brouillon, pas la version publiée du site.</span>
			<a href="/api/preview/disable" style={{ color: '#fff', textDecoration: 'underline', flexShrink: 0 }}>
				Quitter l&apos;aperçu
			</a>
		</div>
	);
}
