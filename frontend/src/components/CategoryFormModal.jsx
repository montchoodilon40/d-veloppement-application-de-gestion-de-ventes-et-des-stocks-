import { useEffect, useState } from 'react';
import { Save, Tags } from 'lucide-react';
import api, { getErrorMessage } from '../api/client';
import Modal from './Modal';
import { CATEGORY_COLORS } from '../utils/format';

const EMPTY_FORM = {
  name: '',
  description: '',
  color: CATEGORY_COLORS[0],
};

export default function CategoryFormModal({ open, category, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isEditing = Boolean(category);

  useEffect(() => {
    if (!open) return;
    setError('');
    setForm(
      category
        ? {
            name: category.name || '',
            description: category.description || '',
            color: category.color || CATEGORY_COLORS[0],
          }
        : EMPTY_FORM
    );
  }, [open, category]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = isEditing
        ? await api.put(`/categories/${category.id}`, form)
        : await api.post('/categories', form);
      onSaved?.(response.data.data, isEditing);
      onClose?.();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={saving ? undefined : onClose}
      title={isEditing ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
      subtitle="Organisez votre catalogue par familles de produits."
      icon={Tags}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
            Annuler
          </button>
          <button type="submit" form="category-form" className="btn btn-primary" disabled={saving}>
            {saving ? <span className="spinner spinner-sm" /> : <Save size={17} />}
            {isEditing ? 'Enregistrer' : 'Créer la catégorie'}
          </button>
        </>
      }
    >
      <form id="category-form" onSubmit={submit} className="form-stack">
        {error && <div className="form-error">{error}</div>}

        <div className="field">
          <label htmlFor="category-name">Nom de la catégorie *</label>
          <input
            id="category-name"
            className="input"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Ex. Informatique"
            required
            autoFocus
          />
        </div>

        <div className="field">
          <label>Couleur</label>
          <div className="color-picker-row">
            {CATEGORY_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`color-swatch ${form.color === color ? 'is-selected' : ''}`}
                style={{ background: color }}
                onClick={() => setForm((current) => ({ ...current, color }))}
                aria-label={`Choisir la couleur ${color}`}
              />
            ))}
            <label className="color-custom" title="Couleur personnalisée">
              <input
                type="color"
                value={form.color}
                onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))}
              />
            </label>
          </div>
        </div>

        <div className="field">
          <label htmlFor="category-description">Description</label>
          <textarea
            id="category-description"
            className="textarea"
            rows="3"
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            placeholder="Description de la catégorie (optionnel)"
          />
        </div>

        <div className="category-preview" style={{ '--category-color': form.color }}>
          <span className="category-preview-dot" />
          <div>
            <strong>{form.name || 'Nom de la catégorie'}</strong>
            <span>{form.description || 'Aperçu de la catégorie'}</span>
          </div>
        </div>
      </form>
    </Modal>
  );
}
