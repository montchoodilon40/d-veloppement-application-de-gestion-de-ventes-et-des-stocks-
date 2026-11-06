import { useCallback, useEffect, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  CalendarRange,
  ClipboardCheck,
  FilterX,
  RefreshCw,
  Search,
} from 'lucide-react';
import api, { getErrorMessage } from '../api/client';
import useDebounce from '../hooks/useDebounce';
import PageHeader from '../components/PageHeader';
import Badge from '../components/Badge';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import { formatDateTime, formatNumber, MOVEMENT_TYPES } from '../utils/format';

const TYPE_ICONS = {
  in: ArrowDownToLine,
  out: ArrowUpFromLine,
  adjustment: ClipboardCheck,
};

export default function StockMovements() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [type, setType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  const [movements, setMovements] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, type, dateFrom, dateTo]);

  const loadMovements = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/stock-movements', {
        params: {
          search: debouncedSearch || undefined,
          type: type || undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
          page,
          per_page: 15,
        },
      });
      setMovements(data.data);
      setMeta(data.meta);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      setMovements([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, type, dateFrom, dateTo, page]);

  useEffect(() => {
    loadMovements();
  }, [loadMovements]);

  const hasFilters = Boolean(search || type || dateFrom || dateTo);

  const resetFilters = () => {
    setSearch('');
    setType('');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div>
      <PageHeader
        eyebrow="Traçabilité"
        title="Mouvements de stock"
        description="Suivez chaque entrée, sortie et correction d’inventaire de vos produits."
        actions={
          <button type="button" className="btn btn-secondary" onClick={loadMovements} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> Actualiser
          </button>
        }
      />

      <div className="card toolbar-card">
        <div className="toolbar toolbar-wrap">
          <div className="search-box">
            <Search size={17} />
            <input
              type="search"
              placeholder="Rechercher par produit ou référence…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Rechercher un mouvement"
            />
            {search && (
              <button type="button" className="search-clear" onClick={() => setSearch('')} aria-label="Effacer">
                ×
              </button>
            )}
          </div>

          <div className="toolbar-filters">
            <div className="select-wrap">
              <ArrowLeftRight size={15} />
              <select
                className="toolbar-select"
                value={type}
                onChange={(event) => setType(event.target.value)}
                aria-label="Filtrer par type de mouvement"
              >
                <option value="">Tous les types</option>
                <option value="in">Entrées</option>
                <option value="out">Sorties</option>
                <option value="adjustment">Inventaires</option>
              </select>
            </div>
          </div>
        </div>

        <div className="toolbar toolbar-dates">
          <div className="date-filter">
            <CalendarRange size={15} />
            <label htmlFor="movement-from">Du</label>
            <input
              id="movement-from"
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(event) => setDateFrom(event.target.value)}
            />
          </div>
          <div className="date-filter">
            <CalendarRange size={15} />
            <label htmlFor="movement-to">Au</label>
            <input
              id="movement-to"
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
            {meta ? `${formatNumber(meta.total)} mouvement${meta.total > 1 ? 's' : ''}` : ''}
          </span>
        </div>
      </div>

      {error && (
        <div className="error-panel">
          <ArrowLeftRight size={21} />
          <div>
            <strong>Impossible de charger les mouvements</strong>
            <p>{error}</p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={loadMovements}>
            Réessayer
          </button>
        </div>
      )}

      <div className="card table-card">
        {loading ? (
          <div className="table-skeleton">
            {Array.from({ length: 7 }).map((_, index) => (
              <div className="skeleton-row" key={index}>
                <span className="skeleton skeleton-avatar" />
                <span className="skeleton skeleton-line" />
                <span className="skeleton skeleton-short" />
                <span className="skeleton skeleton-short" />
              </div>
            ))}
          </div>
        ) : movements.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title={hasFilters ? 'Aucun mouvement trouvé' : 'Aucun mouvement de stock'}
            description={
              hasFilters
                ? 'Modifiez vos filtres pour élargir la recherche.'
                : 'Les mouvements sont créés automatiquement lors des ventes et des ajustements de stock.'
            }
            action={
              hasFilters ? (
                <button type="button" className="btn btn-secondary btn-sm" onClick={resetFilters}>
                  Réinitialiser les filtres
                </button>
              ) : null
            }
          />
        ) : (
          <>
            <div className="table-scroll">
              <table className="data-table movements-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Produit</th>
                    <th>Type</th>
                    <th className="align-right">Variation</th>
                    <th className="align-center">Avant → Après</th>
                    <th>Motif</th>
                    <th>Vente liée</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((movement) => {
                    const typeInfo = MOVEMENT_TYPES[movement.type] || MOVEMENT_TYPES.adjustment;
                    const Icon = TYPE_ICONS[movement.type] || ArrowLeftRight;
                    const positive = movement.quantity > 0;

                    return (
                      <tr key={movement.id}>
                        <td className="text-muted nowrap">{formatDateTime(movement.created_at)}</td>
                        <td>
                          <div className="product-cell">
                            <span
                              className="product-thumb product-thumb-sm"
                              style={{
                                background: `${movement.product?.category?.color || '#6366f1'}18`,
                                color: movement.product?.category?.color || '#6366f1',
                              }}
                            >
                              {movement.product?.name?.charAt(0).toUpperCase() || '?'}
                            </span>
                            <div>
                              <strong>{movement.product?.name || 'Produit supprimé'}</strong>
                              <span>{movement.product?.reference}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge tone={typeInfo.tone}>
                            <Icon size={13} /> {typeInfo.label}
                          </Badge>
                        </td>
                        <td className="align-right">
                          <strong className={positive ? 'text-success' : 'text-danger'}>
                            {positive ? '+' : ''}
                            {formatNumber(movement.quantity)}
                          </strong>
                        </td>
                        <td className="align-center">
                          <span className="stock-transition">
                            {movement.stock_before} <span>→</span> <strong>{movement.stock_after}</strong>
                          </span>
                        </td>
                        <td className="text-muted">{movement.reason || '—'}</td>
                        <td>
                          {movement.sale_reference ? (
                            <span className="sale-reference-chip">{movement.sale_reference}</span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <p>
                Affichage de <strong>{movements.length}</strong> mouvement{movements.length > 1 ? 's' : ''} sur{' '}
                <strong>{meta?.total ?? 0}</strong>
              </p>
              <Pagination meta={meta} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
