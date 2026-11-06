import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeftRight,
  FilterX,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import api, { getErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import useDebounce from '../hooks/useDebounce';
import PageHeader from '../components/PageHeader';
import Badge from '../components/Badge';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import ProductFormModal from '../components/ProductFormModal';
import StockAdjustModal from '../components/StockAdjustModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatCurrency, formatNumber, STOCK_STATUS } from '../utils/format';

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'alert', label: 'Alertes de stock' },
  { value: 'low', label: 'Stock faible' },
  { value: 'out', label: 'Rupture de stock' },
  { value: 'in', label: 'Stock sain' },
];

const SORT_OPTIONS = [
  { value: 'created_at:desc', label: 'Plus récents' },
  { value: 'name:asc', label: 'Nom (A → Z)' },
  { value: 'stock:asc', label: 'Stock croissant' },
  { value: 'sale_price:desc', label: 'Prix décroissant' },
];

export default function Products() {
  const { notify } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') || '';

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [categoryId, setCategoryId] = useState('');
  const [sort, setSort] = useState('created_at:desc');
  const [page, setPage] = useState(1);

  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [stockProduct, setStockProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api
      .get('/categories', { params: { all: 1 } })
      .then(({ data }) => setCategories(data.data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryId, status, sort]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    const [sortField, direction] = sort.split(':');

    try {
      const { data } = await api.get('/products', {
        params: {
          search: debouncedSearch || undefined,
          category_id: categoryId || undefined,
          status: status || undefined,
          sort: sortField,
          direction,
          page,
          per_page: 10,
        },
      });
      setProducts(data.data);
      setMeta(data.meta);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      setProducts([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, categoryId, status, sort, page]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const updateStatus = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set('status', value);
    else next.delete('status');
    setSearchParams(next, { replace: true });
  };

  const hasFilters = Boolean(search || categoryId || status || sort !== 'created_at:desc');

  const clearFilters = () => {
    setSearch('');
    setCategoryId('');
    setSort('created_at:desc');
    setSearchParams({}, { replace: true });
  };

  const handleSaved = (savedProduct, isEditing) => {
    notify(
      isEditing
        ? `Le produit « ${savedProduct.name} » a été mis à jour.`
        : `Le produit « ${savedProduct.name} » a été créé.`
    );
    loadProducts();
    window.dispatchEvent(new Event('stock:changed'));
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingProduct) return;
    setDeleting(true);

    try {
      await api.delete(`/products/${deletingProduct.id}`);
      notify(`Le produit « ${deletingProduct.name} » a été supprimé.`);
      setDeletingProduct(null);
      if (products.length === 1 && page > 1) setPage(page - 1);
      else loadProducts();
      window.dispatchEvent(new Event('stock:changed'));
    } catch (requestError) {
      notify(getErrorMessage(requestError), 'error');
    } finally {
      setDeleting(false);
    }
  };

  const totalLabel = useMemo(
    () => (meta ? `${formatNumber(meta.total)} produit${meta.total > 1 ? 's' : ''}` : ''),
    [meta]
  );

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Produits"
        description="Gérez votre catalogue, vos prix et les niveaux de stock."
        actions={
          <>
            <button type="button" className="btn btn-secondary" onClick={loadProducts} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'spin' : ''} /> Actualiser
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setEditingProduct(null);
                setFormOpen(true);
              }}
            >
              <Plus size={17} /> Nouveau produit
            </button>
          </>
        }
      />

      <div className="card toolbar-card">
        <div className="toolbar">
          <div className="search-box">
            <Search size={17} />
            <input
              type="search"
              placeholder="Rechercher un produit ou une référence…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Rechercher un produit"
            />
            {search && (
              <button type="button" className="search-clear" onClick={() => setSearch('')} aria-label="Effacer">
                ×
              </button>
            )}
          </div>

          <div className="toolbar-filters">
            <div className="select-wrap">
              <SlidersHorizontal size={15} />
              <select
                className="toolbar-select"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                aria-label="Filtrer par catégorie"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="select-wrap">
              <AlertTriangle size={15} />
              <select
                className="toolbar-select"
                value={status}
                onChange={(event) => updateStatus(event.target.value)}
                aria-label="Filtrer par statut de stock"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <select
              className="toolbar-select toolbar-select-plain"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              aria-label="Trier les produits"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {hasFilters && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={clearFilters}>
                <FilterX size={15} /> Réinitialiser
              </button>
            )}
          </div>
        </div>
        <div className="toolbar-foot">
          <span>{totalLabel}</span>
          {status === 'alert' && (
            <span className="toolbar-note">
              <AlertTriangle size={14} /> Affichage des produits sous le seuil d’alerte
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="error-panel">
          <AlertTriangle size={21} />
          <div>
            <strong>Impossible de charger les produits</strong>
            <p>{error}</p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={loadProducts}>
            Réessayer
          </button>
        </div>
      )}

      <div className="card table-card">
        {loading ? (
          <div className="table-skeleton">
            {Array.from({ length: 6 }).map((_, index) => (
              <div className="skeleton-row" key={index}>
                <span className="skeleton skeleton-avatar" />
                <span className="skeleton skeleton-line" />
                <span className="skeleton skeleton-short" />
                <span className="skeleton skeleton-short" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={Package}
            title={hasFilters ? 'Aucun produit trouvé' : 'Votre catalogue est vide'}
            description={
              hasFilters
                ? 'Essayez de modifier vos critères de recherche ou de filtrage.'
                : 'Ajoutez votre premier produit pour commencer à enregistrer des ventes.'
            }
            action={
              hasFilters ? (
                <button type="button" className="btn btn-secondary btn-sm" onClick={clearFilters}>
                  Réinitialiser les filtres
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setEditingProduct(null);
                    setFormOpen(true);
                  }}
                >
                  <Plus size={15} /> Nouveau produit
                </button>
              )
            }
          />
        ) : (
          <>
            <div className="table-scroll">
              <table className="data-table products-table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Catégorie</th>
                    <th>Prix d’achat</th>
                    <th>Prix de vente</th>
                    <th>Stock</th>
                    <th>Statut</th>
                    <th className="align-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const statusInfo = STOCK_STATUS[product.stock_status] || STOCK_STATUS.in;
                    const ratio = Math.max(
                      4,
                      Math.min(100, Math.round((product.stock / Math.max(product.stock_alert * 2, 1)) * 100))
                    );

                    return (
                      <tr key={product.id} className={!product.is_active ? 'row-inactive' : ''}>
                        <td>
                          <div className="product-cell">
                            <span
                              className="product-thumb"
                              style={{
                                background: `${product.category?.color || '#6366f1'}18`,
                                color: product.category?.color || '#6366f1',
                              }}
                            >
                              {product.name.charAt(0).toUpperCase()}
                            </span>
                            <div>
                              <strong>{product.name}</strong>
                              <span>
                                {product.reference}
                                {!product.is_active && <em className="inactive-tag">Inactif</em>}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="category-chip">
                            <span
                              className="category-dot"
                              style={{ background: product.category?.color || '#94a3b8' }}
                            />
                            {product.category?.name || 'Sans catégorie'}
                          </span>
                        </td>
                        <td className="text-muted">{formatCurrency(product.purchase_price)}</td>
                        <td>
                          <strong>{formatCurrency(product.sale_price)}</strong>
                          <span className="cell-sub">marge {formatCurrency(product.margin)}</span>
                        </td>
                        <td>
                          <div className="stock-cell">
                            <span>
                              <strong>{formatNumber(product.stock)}</strong> {product.unit}
                            </span>
                            <div className={`stock-meter stock-meter-${product.stock_status}`}>
                              <span style={{ width: `${ratio}%` }} />
                            </div>
                            <small>seuil {product.stock_alert}</small>
                          </div>
                        </td>
                        <td>
                          <Badge tone={statusInfo.tone} dot>
                            {statusInfo.label}
                          </Badge>
                        </td>
                        <td className="align-right">
                          <div className="row-actions">
                            <button
                              type="button"
                              className="icon-btn"
                              onClick={() => openEdit(product)}
                              title="Modifier le produit"
                              aria-label={`Modifier ${product.name}`}
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              className="icon-btn"
                              onClick={() => setStockProduct(product)}
                              title="Ajuster le stock"
                              aria-label={`Ajuster le stock de ${product.name}`}
                            >
                              <ArrowLeftRight size={16} />
                            </button>
                            <button
                              type="button"
                              className="icon-btn icon-btn-danger"
                              onClick={() => setDeletingProduct(product)}
                              title="Supprimer le produit"
                              aria-label={`Supprimer ${product.name}`}
                            >
                              <Trash2 size={16} />
                            </button>
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
                Affichage de <strong>{products.length}</strong> produit{products.length > 1 ? 's' : ''} sur{' '}
                <strong>{meta?.total ?? 0}</strong>
              </p>
              <Pagination meta={meta} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      <ProductFormModal
        open={formOpen}
        product={editingProduct}
        categories={categories}
        onClose={() => {
          setFormOpen(false);
          setEditingProduct(null);
        }}
        onSaved={handleSaved}
      />

      <StockAdjustModal
        open={Boolean(stockProduct)}
        product={stockProduct}
        onClose={() => setStockProduct(null)}
        onSaved={(updatedProduct) => {
          notify(`Stock de « ${updatedProduct.name} » mis à jour : ${updatedProduct.stock} ${updatedProduct.unit}.`);
          loadProducts();
          window.dispatchEvent(new Event('stock:changed'));
        }}
      />

      <ConfirmDialog
        open={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Supprimer le produit"
        message={
          deletingProduct
            ? `Voulez-vous vraiment supprimer « ${deletingProduct.name} » ? Cette action est irréversible.`
            : ''
        }
      />
    </div>
  );
}
