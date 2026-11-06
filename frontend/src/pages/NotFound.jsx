import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="not-found">
      <span className="not-found-icon">
        <Compass size={30} />
      </span>
      <p className="page-eyebrow">Erreur 404</p>
      <h1>Page introuvable</h1>
      <p>La page que vous cherchez n’existe pas ou a été déplacée.</p>
      <Link to="/" className="btn btn-primary">
        <ArrowLeft size={16} /> Retour au tableau de bord
      </Link>
    </div>
  );
}
