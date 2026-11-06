import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  CalendarRange,
  CreditCard,
  Eye,
  FileText,
  FilterX,
  Plus,
  ReceiptText,
  RefreshCw,
  Search,
  ShoppingBag,
  Wallet,
  XCircle,
} from 'lucide-react';
import api, { getErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import useDebounce from '../hooks/useDebounce';
import PageHeader from '../components/PageHeader';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import SaleDetailModal from '../components/SaleDetailModal';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
  PAYMENT_LABELS,
  PAYMENT_METHODS,
  SALE_STATUS,
} from '../utils/format';

export default function Sales() {
  const { notify } = useToast();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const debouncedSearch = useDebounce(search);
  const [status, setStatus] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  const [sales, setSales] = useState([]);
  const [meta, setMeta] = useState(null);
  const [summary, setSummary] = useState({ sales_count: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [detailSale, setDetailSale] = useState(null);
  const [saleToCancel, setSaleToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, paymentMethod, dateFrom, dateTo]);

  const loadSales = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/sales', {
        params: {
          search: debouncedSearch || undefined,
          status: status || undefined,
          payment_method: paymentMethod || undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
          page,
          per_page: 10,
          sort: 'sale_date',
          direction: 'desc',
        },
      });
      setSales(data.data);
      setMeta(data.meta);
      setSummary(data.summary || { sales_count: 0, revenue: 0 });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      setSales([]);
      setMeta(null);
      setSummary({ sales_count: 0, revenue: 0 });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, paymentMethod, dateFrom, dateTo, page]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const hasFilters = Boolean(search || status || paymentMethod || dateFrom || dateTo);

  const resetFilters = () => {
    setSearch('');
    setStatus('');
    setPaymentMethod('');
    setDateFrom('');
    setDateTo('');
  };

  const confirmCancel = async () => {
    if (!saleToCancel) return;
    setCancelling(true);

    try {
      await api.post(`/sales/${saleToCancel.id}/cancel`);
      notify(`La vente ${saleToCancel.reference} a été annulée. Le stock a été restauré.`);
      setSaleToCancel(null);
      setDetailSale(null);
      loadSales();
      window.dispatchEvent(new Event('stock:changed'));
    } catch (requestError) {
      notify(getErrorMessage(requestError), 'error');
    } finally {
      setCancelling(false);
    }
  };

  const averageBasket = useMemo(
    () => (summary.sales_count > 0 ? summary.revenue / summary.sales_count : 0),
    [summary]
  );

  return (
    <div>
      <PageHeader
        eyebrow="Transactions"
        title="Ventes"
        description="Consultez l’historique, filtrez les transactions et gérez les annulations."
        actions={
          <>
            <button type="button" className="btn btn-secondary" onClick={loadSales} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'spin' : ''} /> Actualiser
            </button>
            <Link to="/ventes/nouvelle" className="btn btn-primary">
              <Plus size={17} /> Nouvelle vente
            </Link>
          </>
        }
      />

      <div className="sales-summary">
        <div className="sales-summary-card">
          <span className="sales-summary-icon icon-primary">
            <Wallet size={19} />
          </span>
          <div>
            <span>Chiffre d’affaires filtré</span>
            <strong>{formatCurrency(summary.revenue)}</strong>
          </div>
        </div>
        <div className="sales-summary-card">
          <span className="sales-summary-icon icon-info">
            <ReceiptText size={19} />
          </span>
          <div>
            <span>Ventes validées</span>
            <strong>{formatNumber(summary.sales_count)}</strong>
          </div>
        </div>
        <div className="sales-summary-card">
          <span className="sales-summary-icon icon-success">
            <ShoppingBag size={19} />
          </span>
          <div>
            <span>Panier moyen</span>
            <strong>{formatCurrency(averageBasket)}</strong>
          </div>
        </div>
      </div>

      <div className="card toolbar-card">
        <div className="toolbar toolbar-wrap">
          <div className="search-box">
            <Search size={17} />
            <input
              type="search"
              placeholder="Rechercher une vente, un client…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Rechercher une vente"
            />
            {search && (
              <button type="button" className="search-clear" onClick={() => setSearch('')} aria-label="Effacer">
                ×
              </button>
            )}
          </div>

          <div className="toolbar-filters">
            <select
              className="toolbar-select toolbar-select-plain"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              aria-label="Filtrer par statut"
            >
              <option value="">Tous les statuts</option>
              <option value="completed">Validées</option>
              <option value="cancelled">Annulées</option>
            </select>

            <div className="select-wrap">
              <CreditCard size={15} />
              <select
                className="toolbar-select"
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
                aria-label="Filtrer par moyen de paiement"
              >
                <option value="">Tous les paiements</option>
                {PAYMENT_METHODS.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="toolbar toolbar toolbar-dates">
          <div className="date-filter">
            <CalendarRange size={15} />
            <label htmlFor="date-from">Du</label>
            <input
              id="date-from"
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(event) => setDateFrom(event.target.value)}
            />
          </div>
          <div className="date-filter">
            <CalendarRange size={15} />
            <label htmlFor="date-to">Au</label>
            <input
              id="date-to"
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(event) => setDateTo(event.target.value)}
            />
          </div>
          {hasFilters && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={resetFilters}>
              <FilterX size={15} /> Réinitialiser
            </button>
          )}
          <span className="toolbar-count">
            {meta ? `${formatNumber(meta.total)} transaction${meta.total > 1 ? 's' : ''}` : ''}
          </span>
        </div>
      </div>

      {error && (
        <div className="error-panel">
          <FileText size={21} />
          <div>
            <strong>Impossible de charger les ventes</strong>
            <p>{error}</p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={loadSales}>
            Réessayer
          </button>
        </div>
      )}

      <div className="card table-card">
        {loading ? (
          <div className="table-skeleton">
            {Array.from({ length: 6 }).map((_, index) => (
              <div className="skeleton-row" key={index}>
                <span className="skeleton skeleton-line" />
                <span className="skeleton skeleton-avatar" />
                <span className="skeleton skeleton-short" />
                <span className="skeleton skeleton-short" />
              </div>
            ))}
          </div>
        ) : sales.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title={hasFilters ? 'Aucune vente ne correspond' : 'Aucune vente enregistrée'}
            description={
              hasFilters
                ? 'Ajustez vos filtres ou votre recherche pour retrouver une transaction.'
                : 'Commencez par enregistrer votre première vente.'
            }
            action={
              hasFilters ? (
                <button type="button" className="btn btn-secondary btn-sm" onClick={resetFilters}>
                  Réinitialiser les filtres
                </button>
              ) : (
                <Link to="/ventes/nouvelle" className="btn btn-primary btn-sm">
                  <Plus size={15} /> Nouvelle vente
                </Link>
              )
            }
          />
        ) : (
          <>
            <div className="table-scroll">
              <table className="data-table sales-table">
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Date</th>
                    <th>Client</th>
                    <th>Articles</th>
                    <th>Paiement</th>
                    <th>Statut</th>
                    <th className="align-right">Montant TTC</th>
                    <th className="align-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => {
                    const statusInfo = SALE_STATUS[sale.status] || SALE_STATUS.completed;
                    return (
                      <tr key={sale.id}>
                        <td>
                          <button
                            type="button"
                            className="table-link table-link-button"
                            onClick={() => setDetailSale(sale)}
                          >
                            {sale.reference}
                          </button>
                        </td>
                        <td className="text-muted">{formatDateTime(sale.sale_date)}</td>
                        <td>
                          <div className="person-cell">
                            <Avatar name={sale.client?.name} size="xs" />
                            <span>{sale.client?.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className="count-pill">{sale.items_count}</span>
                        </td>
                        <td>
                          <span className="payment-cell">
                            <CreditCard size={14} />
                            {PAYMENT_LABELS[sale.payment_method] || sale.payment_method}
                          </span>
                        </td>
                        <td>
                          <Badge tone={statusInfo.tone} dot>
                            {statusInfo.label}
                          </Badge>
                        </td>
                        <td className="align-right">
                          <strong>{formatCurrency(sale.total)}</strong>
                        </td>
                        <td className="align-right">
                          <div className="row-actions">
                            <button
                              type="button"
                              className="icon-btn"
                              title="Voir la vente"
                              onClick={() => setDetailSale(sale)}
                            >
                              <Eye size={16} />
                            </button>
                            {sale.status === 'completed' && (
                              <button
                                type="button"
                                className="icon-btn icon-btn-danger"
                                title="Annuler la vente"
                                onClick={() => setSaleToCancel(sale)}
                              >
                                <XCircle size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <p>
                Affichage de <strong>{sales.length}</strong> vente{sales.length > 1 ? 's' : ''} sur{' '}
                <strong>{meta?.total ?? 0}</strong>
              </p>
              <Pagination meta={meta} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      <SaleDetailModal
        open={Boolean(detailSale)}
        sale={detailSale}
        onClose={() => setDetailSale(null)}
        onRequestCancel={(sale) => {
          setDetailSale(null);
          setSaleToCancel(sale);
        }}
      />

      <ConfirmDialog
        open={Boolean(saleToCancel)}
        onClose={() => setSaleToCancel(null)}
        onConfirm={confirmCancel}
        loading={cancelling}
        title="Annuler la vente"
        confirmLabel="Annuler la vente"
        cancelLabel="Conserver"
        message={
          saleToCancel
            ? `Voulez-vous annuler la vente ${saleToCancel.reference} d’un montant de ${formatCurrency(
                saleToCancel.total
              )} ? Les quantités seront réintégrées au stock.`
            : ''
        }
      />
    </div>
  );
}
