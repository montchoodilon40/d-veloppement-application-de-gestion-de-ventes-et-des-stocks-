import { useEffect, useMemo, useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, ClipboardCheck, Save } from 'lucide-react';
import api, { getErrorMessage } from '../api/client';
import Modal from './Modal';

const TYPES = [
  { value: 'in', label: 'Entrée', icon: ArrowDownToLine, description: 'Réception de stock' },
  { value: 'out', label: 'Sortie', icon: ArrowUpFromLine, description: 'Perte ou casse' },
  { value: 'adjustment', label: 'Inventaire', icon: ClipboardCheck, description: 'Corriger la quantité' },
];

export default function StockAdjustModal({ open, product, onClose, onSaved }) {
  const [type, setType] = useState('in');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setType('in');
    setQuantity('');
    setReason('');
    setError('');
  }, [open, product]);

  const quantityNumber = Number(quantity);
  const after = useMemo(() => {
    if (!product) return 0;
    if (!quantity && type !== 'adjustment') return product.stock;
    if (type === 'in') return product.stock + quantityNumber;
    if (type === 'out') return product.stock - quantityNumber;
    return quantityNumber;
  }, [product, type, quantity, quantityNumber]);

  if (!product) return null;

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await api.post(`/products/${product.id}/stock-adjustments`, {
        type,
        quantity: Number(quantity),
        reason: reason || null,
      });
      onSaved?.(response.data.product);
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
      title="Ajuster le stock"
      subtitle={product.name}
      icon={ClipboardCheck}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
            Annuler
          </button>
          <button type="submit" form="stock-form" className="btn btn-primary" disabled={saving}>
            {saving ? <span className="spinner spinner-sm" /> : <Save size={17} />}
            Valider le mouvement
          </button>
        </>
      }
    >
      <form id="stock-form" onSubmit={submit} className="form-stack">
        {error && <div className="form-error">{error}</div>}

        <div className="stock-modal-current">
          <div>
            <span>Stock actuel</span>
            <strong>
              {product.stock} <small>{product.unit}</small>
            </strong>
          </div>
          <div>
            <span>Seuil d’alerte</span>
            <strong>
              {product.stock_alert} <small>{product.unit}</small>
            </strong>
          </div>
          <div className={`stock-modal-after ${after <= product.stock_alert ? 'is-warning' : ''}`}>
            <span>Après mouvement</span>
            <strong>
              {type === 'out' && after < 0 ? '—' : after} <small>{product.unit}</small>
            </strong>
          </div>
        </div>

        <div className="field">
          <label>Type de mouvement</label>
          <div className="type-selector">
            {TYPES.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`type-option ${type === option.value ? 'is-selected' : ''}`}
                  onClick={() => {
                    setType(option.value);
                    setQuantity(option.value === 'adjustment' ? String(product.stock) : '');
                  }}
                >
                  <Icon size={19} />
                  <span>
                    <strong>{option.label}</strong>
                    <small>{option.description}</small>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="field">
          <label htmlFor="stock-quantity">
            {type === 'in' ? 'Quantité à ajouter *' : type === 'out' ? 'Quantité à retirer *' : 'Nouvelle quantité en stock *'}
          </label>
          <input
            id="stock-quantity"
            type="number"
            min="0"
            step="1"
            className="input"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            placeholder="0"
            required
            autoFocus
          />
        </div>

        <div className="field">
          <label htmlFor="stock-reason">Motif</label>
          <input
            id="stock-reason"
            className="input"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Ex. Réapprovisionnement fournisseur, casse…"
          />
        </div>
      </form>
    </Modal>
  );
}
