'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { FieldLabel, useField } from '@payloadcms/ui';
import { LucideIconByName } from '@shared/lib/icons';
import './style.scss';

// Décision 57 — `LucideIconByName` (déjà utilisé côté site public,
// `shared/lib/icons.ts`) réutilisé ici plutôt qu'un `import * as
// LucideIcons from 'lucide-react'` fait maison : ce pattern a déjà été
// abandonné une fois sur ce projet (+167 Ko de bundle mesurés).
type IconOption = { id: string; nom: string; icone: string };
type Props = {
	icones: IconOption[];
	path?: string;
	label?: string;
	required?: boolean;
};

export default function IconPickerFieldClient({ icones, path, label, required }: Props) {
	const { disabled, setValue, value } = useField<string>({ path });
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState('');
	const rootRef = useRef<HTMLDivElement>(null);

	const selected = icones.find((i) => i.id === value);
	const filtered = useMemo(
		() => icones.filter((i) => i.nom.toLowerCase().includes(query.toLowerCase())),
		[icones, query]
	);

	useEffect(() => {
		if (!open) return;
		function handleClick(e: MouseEvent) {
			if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		function handleKey(e: KeyboardEvent) {
			if (e.key === 'Escape') setOpen(false);
		}
		document.addEventListener('mousedown', handleClick);
		document.addEventListener('keydown', handleKey);
		return () => {
			document.removeEventListener('mousedown', handleClick);
			document.removeEventListener('keydown', handleKey);
		};
	}, [open]);

	return (
		<div className="field-type icon-picker" ref={rootRef}>
			<FieldLabel label={label} required={required} />
			<button
				type="button"
				className="icon-picker__trigger"
				disabled={disabled}
				onClick={() => setOpen((o) => !o)}
			>
				<LucideIconByName name={selected?.icone} size={18} aria-hidden="true" />
				<span className="icon-picker__trigger-label">{selected?.nom ?? 'Choisir une icône'}</span>
			</button>
			{open && (
				<div className="icon-picker__panel">
					<input
						type="text"
						className="icon-picker__search"
						placeholder="Rechercher une icône..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						autoFocus
					/>
					<ul className="icon-picker__list">
						{value && (
							<li>
								<button
									type="button"
									className="icon-picker__option icon-picker__option--clear"
									onClick={() => {
										setValue(null);
										setOpen(false);
									}}
								>
									Aucune icône
								</button>
							</li>
						)}
						{filtered.map((i) => (
							<li key={i.id}>
								<button
									type="button"
									className={`icon-picker__option${i.id === value ? ' icon-picker__option--active' : ''}`}
									onClick={() => {
										setValue(i.id);
										setOpen(false);
										setQuery('');
									}}
								>
									<LucideIconByName name={i.icone} size={18} aria-hidden="true" />
									<span>{i.nom}</span>
								</button>
							</li>
						))}
						{filtered.length === 0 && <li className="icon-picker__empty">Aucun résultat</li>}
					</ul>
				</div>
			)}
		</div>
	);
}
