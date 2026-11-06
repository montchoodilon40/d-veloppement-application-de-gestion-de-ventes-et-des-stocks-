import { useEffect, useState } from 'react';
import { CalendarDays, CreditCard, FileText, ShoppingBag, XCircle } from 'lucide-react';
import api, { getErrorMessage } from '../api/client';
import Modal from './Modal';
import Badge from './Badge';
import Avatar from './Avatar';
import EmptyState from './EmptyState';
import {
  formatCurrency,
  formatDateTime,
  PAYMENT_LABELS,
  SALE_STATUS,
} from '../utils/format';

export default function SaleDetailModal({ open, sale, onClose, onRequestCancel }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !sale) return;

    let active = true;
    setLoading(true);
    setError('');
    setDetails(null);

    api
      .get(`/sales/${sale.id}`)
      .then(({ data }) => {
        if (active) setDetails(data.data);
      })
      .catch((requestError) => {
        if (active) setError(getErrorMessage(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, sale]);

  if (!sale) return null;

  const current = details || sale;
  const status = SALE_STATUS[current.status] || SALE_STATUS.completed;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Vente ${current.reference}`}
      subtitle={formatDateTime(current.sale_date)}
      icon={FileText}
      size="lg"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Fermer
          </button>
          {current.status === 'completed' && (
            <button
              type="button"
              className="btn btn-danger-soft"
              onClick={() => onRequestCancel?.(current)}
            >
              <XCircle size={16} /> Annuler la vente
            </button>
          )}
        </>
      }
    >
      {loading ? (
        <div className="loading-block">
          <span className="spinner" />
          <span>Chargement de la vente…</span>
        </div>
      ) : error ? (
        <div className="form-error">{error}</div>
      ) : (
        <div className="sale-detail">
          <div className="sale-detail-top">
            <div className="sale-detail-client">
              <Avatar name={current.client?.name} size="md" />
              <div>
                <span>Client</span>
                <strong>{current.client?.name}</strong>
                <small>{current.client?.email || current.client?.phone || '—'}</small>
              </div>
            </div>
            <div className="sale-detail-meta">
              <div>
                <span>
                  <CalendarDays size={14} /> Date
                </span>
                <strong>{formatDateTime(current.sale_date)}</strong>
              </div>
              <div>
                <span>
                  <CreditCard size={14} /> Paiement
                </span>
                <strong>{PAYMENT_LABELS[current.payment_method] || current.payment_method}</strong>
              </div>
              <div>
                <span>Statut</span>
                <Badge tone={status.tone} dot>
                  {status.label}
                </Badge>
              </div>
            </div>
          </div>

          <div className="sale-items-heading">
            <h4>Articles vendus</h4>
            <span>{current.items?.length || current.items_count || 0} ligne(s)</span>
          </div>

          {current.items?.length ? (
            <div className="sale-items-list">
              {current.items.map((item) => (
                <div className="sale-item-row" key={item.id}>
                  <span className="sale-item-icon">
                    <ShoppingBag size={16} />
                  </span>
                  <div className="sale-item-info">
                    <strong>{item.product_name}</strong>
                    <span>{item.product_reference || '—'}</span>
                  </div>
                  <span className="sale-item-qty">
                    {item.quantity} × {formatCurrency(item.unit_price)}
                  </span>
                  <strong className="sale-item-total">{formatCurrency(item.line_total)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={ShoppingBag}
              title="Détail indisponible"
              description="Les articles de cette vente n’ont pas pu être chargés."
            />
          )}

          <div className="sale-totals">
            <div>
              <span>Sous-total</span>
              <strong>{formatCurrency(current.subtotal)}</strong>
            </div>
            {Number(current.discount_amount) > 0 && (
              <div className="sale-total-discount">
                <span>Remise</span>
                <strong>−{formatCurrency(current.discount_amount)}</strong>
              </div>
            )}
            <div>
              <span>TVA ({Number(current.tax_rate).toFixed(Number(current.tax_rate) % 1 === 0 ? 0 : 1)} %)</span>
              <strong>{formatCurrency(current.tax_amount)}</strong>
            </div>
            <div className="sale-total-final">
              <span>Total</span>
              <strong>{formatCurrency(current.total)}</strong>
            </div>
          </div>

          {current.notes && (
            <div className="sale-notes">
              <span>
                <FileText size={14} /> Note
              </span>
              <p>{current.notes}</p>
            </div>
          )}

          {current.status === 'cancelled' && (
            <div className="cancel-notice">
              <XCircle size={17} />
              <div>
                <strong>Cette vente a été annulée</strong>
                <p>Les quantités ont été automatiquement réintégrées dans le stock.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
