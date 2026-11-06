import { useCallback, useEffect, useState } from 'react';
import {
  Eye,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  Users,
} from 'lucide-react';
import api, { getErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import useDebounce from '../hooks/useDebounce';
import PageHeader from '../components/PageHeader';
import Avatar from '../components/Avatar';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import ClientFormModal from '../components/ClientFormModal';
import ClientDetailModal from '../components/ClientDetailModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatCurrency, formatDate, formatNumber } from '../utils/format';

export default function Clients() {
  const { notify } = useToast();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [page, setPage] = useState(1);
  const [clients, setClients] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [detailClient, setDetailClient] = useState(null);
  const [deletingClient, setDeletingClient] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const loadClients = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/clients', {
        params: {
          search: debouncedSearch || undefined,
          page,
          per_page: 10,
        },
      });
      setClients(data.data);
      setMeta(data.meta);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      setClients([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const handleSaved = (client, isEditing) => {
    notify(
      isEditing
        ? `Le client « ${client.name} » a été mis à jour.`
        : `Le client « ${client.name} » a été créé.`
    );
    loadClients();
  };

  const confirmDelete = async () => {
    if (!deletingClient) return;
    setDeleting(true);

    try {
      await api.delete(`/clients/${deletingClient.id}`);
      notify(`Le client « ${deletingClient.name} » a été supprimé.`);
      setDeletingClient(null);
      if (clients.length === 1 && page > 1) setPage(page - 1);
      else loadClients();
    } catch (requestError) {
      notify(getErrorMessage(requestError), 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Relation client"
        title="Clients"
        description="Centralisez les coordonnées et l’historique d’achat de vos clients."
        actions={
          <>
            <button type="button" className="btn btn-secondary" onClick={loadClients} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'spin' : ''} /> Actualiser
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setEditingClient(null);
                setFormOpen(true);
              }}
            >
              <Plus size={17} /> Nouveau client
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
              placeholder="Rechercher par nom, e-mail, téléphone ou ville…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Rechercher un client"
            />
            {search && (
              <button type="button" className="search-clear" onClick={() => setSearch('')} aria-label="Effacer">
                ×
              </button>
            )}
          </div>
        </div>
        <div className="toolbar-foot">
          <span>{meta ? `${formatNumber(meta.total)} client${meta.total > 1 ? 's' : ''}` : ''}</span>
          <span className="toolbar-note">
            <Users size={14} /> Fiches clients et historique des achats
          </span>
        </div>
      </div>

      {error && (
        <div className="error-panel">
          <UserRound size={21} />
          <div>
            <strong>Impossible de charger les clients</strong>
            <p>{error}</p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={loadClients}>
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
        ) : clients.length === 0 ? (
          <EmptyState
            icon={Users}
            title={search ? 'Aucun client trouvé' : 'Aucun client enregistré'}
            description={
              search
                ? 'Essayez un autre nom, e-mail ou numéro de téléphone.'
                : 'Ajoutez votre premier client pour enregistrer des ventes.'
            }
            action={
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setEditingClient(null);
                  setFormOpen(true);
                }}
              >
                <Plus size={15} /> Nouveau client
              </button>
            }
          />
        ) : (
          <>
            <div className="table-scroll">
              <table className="data-table clients-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Coordonnées</th>
                    <th>Ville</th>
                    <th>Achats</th>
                    <th>Total dépensé</th>
                    <th>Client depuis</th>
                    <th className="align-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id}>
                      <td>
                        <div className="person-cell">
                          <Avatar name={client.name} size="sm" />
                          <div>
                            <strong>{client.name}</strong>
                            <span>Client #{String(client.id).padStart(4, '0')}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="contact-cell">
                          {client.email && (
                            <span>
                              <Mail size={13} /> {client.email}
                            </span>
                          )}
                          {client.phone && (
                            <span>
                              <Phone size={13} /> {client.phone}
                            </span>
                          )}
                          {!client.email && !client.phone && <span className="text-muted">—</span>}
                        </div>
                      </td>
                      <td>
                        <span className="city-cell">
                          <MapPin size={14} />
                          {client.city || '—'}
                        </span>
                      </td>
                      <td>
                        <span className="count-pill">{formatNumber(client.sales_count || 0)}</span>
                      </td>
                      <td>
                        <strong>{formatCurrency(client.total_spent || 0)}</strong>
                      </td>
                      <td className="text-muted">{formatDate(client.created_at)}</td>
                      <td className="align-right">
                        <div className="row-actions">
                          <button
                            type="button"
                            className="icon-btn"
                            title="Voir la fiche"
                            onClick={() => setDetailClient(client)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-btn"
                            title="Modifier le client"
                            onClick={() => {
                              setEditingClient(client);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-btn icon-btn-danger"
                            title="Supprimer le client"
                            onClick={() => setDeletingClient(client)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <p>
                Affichage de <strong>{clients.length}</strong> client{clients.length > 1 ? 's' : ''} sur{' '}
                <strong>{meta?.total ?? 0}</strong>
              </p>
              <Pagination meta={meta} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      <ClientFormModal
        open={formOpen}
        client={editingClient}
        onClose={() => {
          setFormOpen(false);
          setEditingClient(null);
        }}
        onSaved={handleSaved}
      />

      <ClientDetailModal
        open={Boolean(detailClient)}
        client={detailClient}
        onClose={() => setDetailClient(null)}
        onEdit={(client) => {
          setDetailClient(null);
          setEditingClient(client);
          setFormOpen(true);
        }}
      />

      <ConfirmDialog
        open={Boolean(deletingClient)}
        onClose={() => setDeletingClient(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Supprimer le client"
        message={
          deletingClient
            ? `Voulez-vous vraiment supprimer la fiche de « ${deletingClient.name} » ?`
            : ''
        }
      />
    </div>
  );
}
