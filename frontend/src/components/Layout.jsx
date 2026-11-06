import { useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeftRight,
  BarChart3,
  Bell,
  LayoutDashboard,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Sparkles,
  Tags,
  Users,
  X,
} from 'lucide-react';
import api from '../api/client';
import Avatar from './Avatar';
import { formatDateLong } from '../utils/format';

const NAV_GROUPS = [
  {
    label: 'Pilotage',
    items: [{ to: '/', label: 'Tableau de bord', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Gestion',
    items: [
      { to: '/produits', label: 'Produits', icon: Package, alerts: true },
      { to: '/categories', label: 'Catégories', icon: Tags },
      { to: '/clients', label: 'Clients', icon: Users },
      { to: '/ventes', label: 'Ventes', icon: ShoppingCart },
      { to: '/stock', label: 'Mouvements de stock', icon: ArrowLeftRight },
    ],
  },
];

const PAGE_TITLES = {
  '/': 'Tableau de bord',
  '/produits': 'Produits',
  '/categories': 'Catégories',
  '/clients': 'Clients',
  '/ventes': 'Ventes',
  '/ventes/nouvelle': 'Nouvelle vente',
  '/stock': 'Mouvements de stock',
};

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(0);

  const loadAlerts = useCallback(async () => {
    try {
      const { data } = await api.get('/dashboard');
      setAlertCount(
        (data.kpis?.low_stock_count || 0) + (data.kpis?.out_of_stock_count || 0)
      );
    } catch {
      // Le compteur d'alertes reste silencieux si l'API n'est pas disponible.
    }
  }, []);

  useEffect(() => {
    loadAlerts();
    const handleStockChanged = () => loadAlerts();
    window.addEventListener('stock:changed', handleStockChanged);
    return () => window.removeEventListener('stock:changed', handleStockChanged);
  }, [loadAlerts]);

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const pageTitle = PAGE_TITLES[location.pathname] || 'Commerciale';

  return (
    <div className="app-shell">
      <div
        className={`sidebar-backdrop ${mobileOpen ? 'is-open' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <aside className={`sidebar ${mobileOpen ? 'is-open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-mark">
            <BarChart3 size={22} />
          </span>
          <div>
            <strong>Commerciale</strong>
            <span>Ventes & stocks</span>
          </div>
          <button
            type="button"
            className="sidebar-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Fermer le menu"
          >
            <X size={19} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_GROUPS.map((group) => (
            <div className="nav-group" key={group.label}>
              <p className="nav-label">{group.label}</p>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
                  >
                    <Icon size={18} strokeWidth={1.9} />
                    <span>{item.label}</span>
                    {item.alerts && alertCount > 0 && (
                      <span className="nav-badge">{alertCount}</span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className={`sidebar-alert-card ${alertCount > 0 ? 'has-alert' : ''}`}>
            <span className="sidebar-alert-icon">
              {alertCount > 0 ? <AlertTriangle size={18} /> : <Sparkles size={18} />}
            </span>
            <div>
              <strong>
                {alertCount > 0
                  ? `${alertCount} alerte${alertCount > 1 ? 's' : ''} de stock`
                  : 'Stocks sous contrôle'}
              </strong>
              <p>
                {alertCount > 0
                  ? 'Des produits nécessitent un réapprovisionnement.'
                  : 'Aucun produit sous le seuil d’alerte.'}
              </p>
            </div>
            <NavLink to="/produits?status=alert" className="sidebar-alert-link">
              Voir
            </NavLink>
          </div>

          <div className="sidebar-user">
            <Avatar name="Camille Moreau" size="sm" />
            <div className="sidebar-user-info">
              <strong>Camille Moreau</strong>
              <span>Administratrice</span>
            </div>
            <button type="button" className="sidebar-user-settings" aria-label="Paramètres">
              <Settings size={17} />
            </button>
          </div>
        </div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="icon-btn menu-toggle"
              onClick={() => setMobileOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <Menu size={20} />
            </button>
            <div className="topbar-breadcrumb">
              <span>Commerciale</span>
              <span className="breadcrumb-separator">/</span>
              <strong>{pageTitle}</strong>
            </div>
          </div>

          <div className="topbar-right">
            <span className="topbar-date">{formatDateLong(new Date())}</span>
            <NavLink to="/produits?status=alert" className="icon-btn topbar-bell" aria-label="Alertes de stock">
              <Bell size={19} />
              {alertCount > 0 && <span className="notification-dot">{alertCount > 9 ? '9+' : alertCount}</span>}
            </NavLink>
            <span className="topbar-avatar">
              <Avatar name="Camille Moreau" size="sm" />
            </span>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>

        <footer className="app-footer">
          <span>Commerciale © {new Date().getFullYear()}</span>
          <span>Application de gestion des ventes et des stocks</span>
        </footer>
      </div>
    </div>
  );
}
