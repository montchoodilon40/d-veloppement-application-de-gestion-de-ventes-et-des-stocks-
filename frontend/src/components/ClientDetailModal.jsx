import { useEffect, useState } from 'react';
import { Mail, MapPin, Pencil, Phone, ShoppingBag, UserRound } from 'lucide-react';
import api, { getErrorMessage } from '../api/client';
import Modal from './Modal';
import Avatar from './Avatar';
import Badge from './Badge';
import EmptyState from './EmptyState';
import {
  formatCurrency,
  formatDate,
  formatNumber,
  SALE_STATUS,
} from '../utils/format';

export default function ClientDetailModal({ open, client, onClose, onEdit }) {
  const [details, setDetails] = useState(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !client) return;

    let active = true;
    setLoading(true);
    setError('');
    setDetails(null);

    api
      .get(`/clients/${client.id}`)
      .then(({ data }) => {
        if (!active) return;
        setDetails(data.data);
        setSales(Array.isArray(data.sales) ? data.sales : data.sales?.data || []);
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
  }, [open, client]);

  if (!client) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Fiche client"
      subtitle={client.name}
      icon={UserRound}
      size="lg"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Fermer
          </button>
          <button type="button" className="btn btn-primary" onClick={() => onEdit?.(details || client)}>
            <Pencil size={16} /> Modifier le client
          </button>
        </>
      }
    >
      {loading ? (
        <div className="loading-block">
          <span className="spinner" />
          <span>Chargement de la fiche…</span>
        </div>
      ) : error ? (
        <div className="form-error">{error}</div>
      ) : (
        <div className="client-detail">
          <div className="client-detail-hero">
            <Avatar name={details?.name || client.name} size="lg" />
            <div>
              <h3>{details?.name || client.name}</h3>
              <p>{details?.city || 'Ville non renseignée'}</p>
            </div>
            <div className="client-detail-stats">
              <div>
                <strong>{formatNumber(details?.sales_count ?? client.sales_count ?? 0)}</strong>
                <span>achat{Number(details?.sales_count ?? client.sales_count) > 1 ? 's' : ''}</span>
              </div>
              <div>
                <strong>{formatCurrency(details?.total_spent ?? client.total_spent ?? 0)}</strong>
                <span>total dépensé</span>
              </div>
            </div>
          </div>

          <div className="client-contact-grid">
            <div>
              <span>
                <Mail size={15} /> E-mail
              </span>
              <strong>{details?.email || 'Non renseigné'}</strong>
            </div>
            <div>
              <span>
                <Phone size={15} /> Téléphone
              </span>
              <strong>{details?.phone || 'Non renseigné'}</strong>
            </div>
            <div>
              <span>
                <MapPin size={15} /> Adresse
              </span>
              <strong>{[details?.address, details?.city].filter(Boolean).join(', ') || 'Non renseignée'}</strong>
            </div>
          </div>

          {details?.notes && <div className="client-note-box">{details.notes}</div>}

          <div className="client-sales-heading">
            <h4>Dernières ventes</h4>
            <span>{sales.length} affichée{sales.length > 1 ? 's' : ''}</span>
          </div>

          {sales.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="Aucune vente pour ce client"
              description="Les prochaines ventes apparaîtront dans cette fiche."
            />
          ) : (
            <div className="table-scroll">
              <table className="data-table compact-table">
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Date</th>
                    <th>Articles</th>
                    <th>Statut</th>
                    <th className="align-right">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id}>
                      <td>
                        <strong>{sale.reference}</strong>
                      </td>
                      <td className="text-muted">{formatDate(sale.sale_date)}</td>
                      <td className="text-muted">{sale.items_count} article(s)</td>
                      <td>
                        <Badge tone={SALE_STATUS[sale.status]?.tone || 'neutral'} dot>
                          {SALE_STATUS[sale.status]?.label || sale.status}
                        </Badge>
                      </td>
                      <td className="align-right">
                        <strong>{formatCurrency(sale.total)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
