import { useEffect, useMemo, useState } from 'react';
import { Package, Save } from 'lucide-react';
import api, { getErrorMessage } from '../api/client';
import Modal from './Modal';
import { formatCurrency } from '../utils/format';

const EMPTY_FORM = {
  name: '',
  reference: '',
  category_id: '',
  description: '',
  purchase_price: '',
  sale_price: '',
  stock: '',
  stock_alert: 5,
  unit: 'pièce',
  is_active: true,
};

export default function ProductFormModal({ open, product, categories, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isEditing = Boolean(product);

  useEffect(() => {
    if (!open) return;
    setError('');
    if (product) {
      setForm({
        name: product.name || '',
        reference: product.reference || '',
        category_id: product.category_id || '',
        description: product.description || '',
        purchase_price: product.purchase_price ?? '',
        sale_price: product.sale_price ?? '',
        stock: product.stock ?? 0,
        stock_alert: product.stock_alert ?? 5,
        unit: product.unit || 'pièce',
        is_active: Boolean(product.is_active),
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, product]);

  const margin = useMemo(() => {
    const purchase = Number(form.purchase_price);
    const sale = Number(form.sale_price);
    if (!purchase || !sale) return null;
    return {
      amount: sale - purchase,
      rate: ((sale - purchase) / purchase) * 100,
    };
  }, [form.purchase_price, form.sale_price]);

  const update = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      name: form.name,
      reference: form.reference || null,
      category_id: form.category_id || null,
      description: form.description || null,
      purchase_price: Number(form.purchase_price || 0),
      sale_price: Number(form.sale_price || 0),
      stock_alert: Number(form.stock_alert || 0),
      unit: form.unit || 'pièce',
      is_active: form.is_active,
    };

    if (!isEditing) payload.stock = Number(form.stock || 0);

    try {
      const response = isEditing
        ? await api.put(`/products/${product.id}`, payload)
        : await api.post('/products', payload);
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
      title={isEditing ? 'Modifier le produit' : 'Nouveau produit'}
      subtitle={isEditing ? 'Mettez à jour les informations du catalogue.' : 'Ajoutez un article à votre catalogue.'}
      icon={Package}
      size="lg"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
            Annuler
          </button>
          <button type="submit" form="product-form" className="btn btn-primary" disabled={saving}>
            {saving ? <span className="spinner spinner-sm" /> : <Save size={17} />}
            {isEditing ? 'Enregistrer' : 'Créer le produit'}
          </button>
        </>
      }
    >
      <form id="product-form" onSubmit={submit} className="form-stack">
        {error && <div className="form-error">{error}</div>}

        <div className="form-grid form-grid-2">
          <div className="field field-span-2">
            <label htmlFor="product-name">Nom du produit *</label>
            <input
              id="product-name"
              className="input"
              value={form.name}
              onChange={update('name')}
              placeholder="Ex. Casque Bluetooth AirBeat"
              required
              autoFocus
            />
          </div>

          <div className="field">
            <label htmlFor="product-reference">Référence</label>
            <input
              id="product-reference"
              className="input"
              value={form.reference}
              onChange={update('reference')}
              placeholder="Auto si vide"
              disabled={isEditing && Boolean(product?.reference)}
            />
            {!isEditing && <small className="field-hint">Laissez vide pour générer une référence.</small>}
          </div>

          <div className="field">
            <label htmlFor="product-category">Catégorie</label>
            <select
              id="product-category"
              className="select"
              value={form.category_id}
              onChange={update('category_id')}
            >
              <option value="">Sans catégorie</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="product-purchase">Prix d’achat (€) *</label>
            <input
              id="product-purchase"
              type="number"
              min="0"
              step="0.01"
              className="input"
              value={form.purchase_price}
              onChange={update('purchase_price')}
              placeholder="0,00"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="product-sale">Prix de vente (€) *</label>
            <input
              id="product-sale"
              type="number"
              min="0"
              step="0.01"
              className="input"
              value={form.sale_price}
              onChange={update('sale_price')}
              placeholder="0,00"
              required
            />
          </div>

          {!isEditing ? (
            <div className="field">
              <label htmlFor="product-stock">Stock initial</label>
              <input
                id="product-stock"
                type="number"
                min="0"
                step="1"
                className="input"
                value={form.stock}
                onChange={update('stock')}
                placeholder="0"
              />
              <small className="field-hint">Un mouvement « Stock initial » sera enregistré.</small>
            </div>
          ) : (
            <div className="field">
              <label>Stock actuel</label>
              <div className="readonly-value">
                <strong>{product.stock}</strong>
                <span>{product.unit}</span>
              </div>
              <small className="field-hint">Modifiez le stock depuis l’action « Ajuster ».</small>
            </div>
          )}

          <div className="field">
            <label htmlFor="product-alert">Seuil d’alerte</label>
            <input
              id="product-alert"
              type="number"
              min="0"
              step="1"
              className="input"
              value={form.stock_alert}
              onChange={update('stock_alert')}
              placeholder="5"
            />
          </div>

          <div className="field">
            <label htmlFor="product-unit">Unité</label>
            <input
              id="product-unit"
              className="input"
              value={form.unit}
              onChange={update('unit')}
              placeholder="pièce, lot, kg…"
              list="product-units"
            />
            <datalist id="product-units">
              <option value="pièce" />
              <option value="lot" />
              <option value="kg" />
              <option value="litre" />
              <option value="mètre" />
              <option value="heure" />
            </datalist>
          </div>

          {margin && (
            <div className="form-highlight">
              <div>
                <span>Marge unitaire</span>
                <strong>{formatCurrency(margin.amount)}</strong>
              </div>
              <div>
                <span>Taux de marge</span>
                <strong className={margin.rate >= 0 ? 'text-success' : 'text-danger'}>
                  {margin.rate.toFixed(1)} %
                </strong>
              </div>
            </div>
          )}

          <div className="field field-span-2">
            <label htmlFor="product-description">Description</label>
            <textarea
              id="product-description"
              className="textarea"
              rows="3"
              value={form.description}
              onChange={update('description')}
              placeholder="Description du produit (optionnel)"
            />
          </div>

          <label className="switch-row field-span-2">
            <input type="checkbox" checked={form.is_active} onChange={update('is_active')} />
            <span className="switch" />
            <div>
              <strong>Produit actif</strong>
              <span>Seuls les produits actifs peuvent être ajoutés à une vente.</span>
            </div>
          </label>
        </div>
      </form>
    </Modal>
  );
}
