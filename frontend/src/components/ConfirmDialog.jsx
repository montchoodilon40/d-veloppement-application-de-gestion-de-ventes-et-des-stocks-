import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirmer la suppression',
  message,
  confirmLabel = 'Supprimer',
  cancelLabel = 'Annuler',
  loading = false,
  tone = 'danger',
}) {
  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn btn-${tone}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <span className="spinner spinner-sm" />}
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="confirm-content">
        <div className={`confirm-icon ${tone === 'danger' ? 'is-danger' : ''}`}>
          <AlertTriangle size={23} />
        </div>
        <p>{message}</p>
      </div>
    </Modal>
  );
}
