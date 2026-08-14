'use client';

import React from 'react';
import { FieldLabel, FieldError, useField } from '@payloadcms/ui';
import type { SelectFieldClientComponent } from 'payload';
import './style.scss';

// Décision 11 — composant de champ personnalisé pour afficher un aperçu
// visuel par option plutôt qu'un simple `<select>` texte. Générique :
// réutilisé à la fois pour `gabarit` et pour `liste.carte` (chaque usage
// fournit sa propre carte image → option via `clientProps.previewImages`).
type PreviewPickerClientProps = {
	previewImages?: Record<string, string>;
};

const PreviewPicker: SelectFieldClientComponent = (props) => {
	const { field, path, readOnly, previewImages = {} } = props as typeof props &
		PreviewPickerClientProps;
	const { value, setValue } = useField<string>({ path });
	const options = field.options ?? [];

	return (
		<div className="preview-picker">
			<FieldLabel label={field.label} required={field.required} />
			<div className="preview-picker__grid">
				{options.map((option) => {
					const optionValue = typeof option === 'string' ? option : option.value;
					const optionLabel = typeof option === 'string' ? option : option.label;
					const image = previewImages[optionValue];
					const selected = value === optionValue;

					return (
						<button
							key={optionValue}
							type="button"
							disabled={readOnly}
							className={`preview-picker__option${selected ? ' preview-picker__option--selected' : ''}`}
							onClick={() => setValue(optionValue)}
							aria-pressed={selected}
						>
							<span className="preview-picker__image-wrap">
								{image ? (
									// eslint-disable-next-line @next/next/no-img-element
									<img src={image} alt="" className="preview-picker__image" />
								) : (
									<span className="preview-picker__image-placeholder">
										Aperçu à venir
									</span>
								)}
							</span>
							<span className="preview-picker__label">
								{typeof optionLabel === 'string' ? optionLabel : optionValue}
							</span>
						</button>
					);
				})}
			</div>
			<FieldError path={path} />
		</div>
	);
};

export default PreviewPicker;
