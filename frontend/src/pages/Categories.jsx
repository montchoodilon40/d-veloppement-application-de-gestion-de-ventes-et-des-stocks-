import { useCallback, useEffect, useMemo, useState } from 'react';
import { Layers3, Pencil, Plus, Search, Tags, Trash2 } from 'lucide-react';
import api, { getErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import useDebounce from '../hooks/useDebounce';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import CategoryFormModal from '../components/CategoryFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatNumber } from '../utils/format';

export default function Categories() {
  const { notify } = useToast();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/categories', {
        params: { all: 1, search: debouncedSearch || undefined },
      });
      setCategories(data.data);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const totalProducts = useMemo(
    () => categories.reduce((sum, category) => sum + Number(category.products_count || 0), 0),
    [categories]
  );

  const handleSaved = (category, isEditing) => {
    notify(
      isEditing
        ? `La catégorie « ${category.name} » a été mise à jour.`
        : `La catégorie « ${category.name} » a été créée.`
    );
    loadCategories();
  };

  const confirmDelete = async () => {
    if (!deletingCategory) return;
    setDeleting(true);
    try {
      await api.delete(`/categories/${deletingCategory.id}`);
      notify(`La catégorie « ${deletingCategory.name} » a été supprimée.`);
      setDeletingCategory(null);
      loadCategories();
    } catch (requestError) {
      notify(getErrorMessage(requestError), 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Organisation"
        title="Catégories"
        description="Structurez votre catalogue par famille de produits."
        actions={
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setEditingCategory(null);
              setFormOpen(true);
            }}
          >
            <Plus size={17} /> Nouvelle catégorie
          </button>
        }
      />

      <div className="category-summary">
        <div className="summary-stat">
          <span className="summary-icon summary-icon-primary">
            <Tags size={19} />
          </span>
          <div>
            <strong>{formatNumber(categories.length)}</strong>
            <span>catégorie{categories.length > 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="summary-stat">
          <span className="summary-icon summary-icon-info">
            <Layers3 size={19} />
          </span>
          <div>
            <strong>{formatNumber(totalProducts)}</strong>
            <span>produit{totalProducts > 1 ? 's' : ''} classé{totalProducts > 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="category-search">
          <Search size={17} />
          <input
            type="search"
            placeholder="Rechercher une catégorie…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Rechercher une catégorie"
          />
        </div>
      </div>

      {error && (
        <div className="error-panel">
          <Tags size={21} />
          <div>
            <strong>Impossible de charger les catégories</strong>
            <p>{error}</p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={loadCategories}>
            Réessayer
          </button>
        </div>
      )}

      {loading ? (
        <div className="category-grid">
          {Array.from({ length: 5 }).map((_, index) => (
            <div className="category-card skeleton-card" key={index}>
              <span className="skeleton skeleton-avatar" />
              <span className="skeleton skeleton-line" />
              <span className="skeleton skeleton-short" />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Tags}
            title={search ? 'Aucune catégorie trouvée' : 'Aucune catégorie créée'}
            description={
              search
                ? 'Modifiez votre recherche pour trouver une catégorie.'
                : 'Créez des catégories pour organiser vos produits.'
            }
            action={
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setEditingCategory(null);
                  setFormOpen(true);
                }}
              >
                <Plus size={15} /> Nouvelle catégorie
              </button>
            }
          />
        </div>
      ) : (
        <div className="category-grid">
          {categories.map((category) => (
            <article
              className="category-card"
              key={category.id}
              style={{ '--category-color': category.color || '#6366f1' }}
            >
              <div className="category-card-top">
                <span className="category-icon">
                  <Tags size={20} />
                </span>
                <div className="category-actions">
                  <button
                    type="button"
                    className="icon-btn"
                    title="Modifier la catégorie"
                    onClick={() => {
                      setEditingCategory(category);
                      setFormOpen(true);
                    }}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn icon-btn-danger"
                    title="Supprimer la catégorie"
                    onClick={() => setDeletingCategory(category)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <h2>{category.name}</h2>
              <p>{category.description || 'Aucune description renseignée.'}</p>
              <div className="category-card-footer">
                <span className="category-count">
                  {formatNumber(category.products_count || 0)} produit
                  {Number(category.products_count) > 1 ? 's' : ''}
                </span>
                <span className="category-bar">
                  <span
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(6, (Number(category.products_count) / Math.max(totalProducts, 1)) * 100)
                      )}%`,
                    }}
                  />
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      <CategoryFormModal
        open={formOpen}
        category={editingCategory}
        onClose={() => {
          setFormOpen(false);
          setEditingCategory(null);
        }}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={Boolean(deletingCategory)}
        onClose={() => setDeletingCategory(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Supprimer la catégorie"
        message={
          deletingCategory
            ? `Voulez-vous vraiment supprimer la catégorie « ${deletingCategory.name} » ?`
            : ''
        }
      />
    </div>
  );
}
