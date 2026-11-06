import { useEffect, useState } from 'react';
import { Save, UserRound } from 'lucide-react';
import api, { getErrorMessage } from '../api/client';
import Modal from './Modal';

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  notes: '',
};

export default function ClientFormModal({ open, client, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isEditing = Boolean(client);

  useEffect(() => {
    if (!open) return;
    setError('');
    setForm(
      client
        ? {
            name: client.name || '',
            email: client.email || '',
            phone: client.phone || '',
            address: client.address || '',
            city: client.city || '',
            notes: client.notes || '',
          }
        : EMPTY_FORM
    );
  }, [open, client]);

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
      city: form.city || null,
      notes: form.notes || null,
    };

    try {
      const response = isEditing
        ? await api.put(`/clients/${client.id}`, payload)
        : await api.post('/clients', payload);
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
      title={isEditing ? 'Modifier le client' : 'Nouveau client'}
      subtitle={isEditing ? 'Mettez à jour la fiche client.' : 'Enregistrez un nouveau contact commercial.'}
      icon={UserRound}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
            Annuler
          </button>
          <button type="submit" form="client-form" className="btn btn-primary" disabled={saving}>
            {saving ? <span className="spinner spinner-sm" /> : <Save size={17} />}
            {isEditing ? 'Enregistrer' : 'Créer le client'}
          </button>
        </>
      }
    >
      <form id="client-form" onSubmit={submit} className="form-stack">
        {error && <div className="form-error">{error}</div>}

        <div className="form-grid form-grid-2">
          <div className="field field-span-2">
            <label htmlFor="client-name">Nom complet *</label>
            <input
              id="client-name"
              className="input"
              value={form.name}
              onChange={update('name')}
              placeholder="Ex. Sophie Martin"
              required
              autoFocus
            />
          </div>

          <div className="field">
            <label htmlFor="client-email">Adresse e-mail</label>
            <input
              id="client-email"
              type="email"
              className="input"
              value={form.email}
              onChange={update('email')}
              placeholder="client@exemple.fr"
            />
          </div>

          <div className="field">
            <label htmlFor="client-phone">Téléphone</label>
            <input
              id="client-phone"
              className="input"
              value={form.phone}
              onChange={update('phone')}
              placeholder="06 12 34 56 78"
            />
          </div>

          <div className="field">
            <label htmlFor="client-address">Adresse</label>
            <input
              id="client-address"
              className="input"
              value={form.address}
              onChange={update('address')}
              placeholder="12 rue des Lilas"
            />
          </div>

          <div className="field">
            <label htmlFor="client-city">Ville</label>
            <input
              id="client-city"
              className="input"
              value={form.city}
              onChange={update('city')}
              placeholder="Paris"
            />
          </div>

          <div className="field field-span-2">
            <label htmlFor="client-notes">Notes</label>
            <textarea
              id="client-notes"
              className="textarea"
              rows="3"
              value={form.notes}
              onChange={update('notes')}
              placeholder="Informations complémentaires (optionnel)"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
