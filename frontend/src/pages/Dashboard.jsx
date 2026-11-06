import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Package,
  Plus,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api, { getErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';
import {
  formatCompactCurrency,
  formatCurrency,
  formatNumber,
  formatRelativeDate,
  PAYMENT_LABELS,
  SALE_STATUS,
} from '../utils/format';

function ChartTooltip({ active, payload, label, valueLabel = 'CA' }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;

  return (
    <div className="chart-tooltip">
      <span>{label}</span>
      <strong>{formatCurrency(item.total ?? item.revenue ?? payload[0].value)}</strong>
      {item.count !== undefined && <small>{item.count} vente{item.count > 1 ? 's' : ''}</small>}
      {item.quantity !== undefined && <small>{item.quantity} unité{item.quantity > 1 ? 's' : ''}</small>}
      {!item.count && !item.quantity && <small>{valueLabel}</small>}
    </div>
  );
}

const MONTH_SHORT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
const DAY_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

export default function Dashboard() {
  const { notify } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const response = await api.get('/dashboard');
      setData(response.data);
      if (isRefresh) notify('Tableau de bord actualisé.', 'success');
    } catch (requestError) {
      const message = getErrorMessage(requestError);
      setError(message);
      if (isRefresh) notify(message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const weeklyData = useMemo(
    () =>
      (data?.sales_last_7_days || []).map((day) => {
        const date = new Date(`${day.date}T12:00:00`);
        return {
          ...day,
          label: `${DAY_SHORT[date.getDay()]} ${date.getDate()}`,
        };
      }),
    [data]
  );

  const monthlyData = useMemo(
    () =>
      (data?.monthly_revenue || []).map((month) => {
        const [year, monthNumber] = month.month.split('-');
        return {
          ...month,
          label: `${MONTH_SHORT[Number(monthNumber) - 1]} ${year.slice(2)}`,
        };
      }),
    [data]
  );

  const weeklyTotal = weeklyData.reduce((total, day) => total + Number(day.total), 0);
  const monthTopCategories = useMemo(
    () => [...(data?.sales_by_category || [])].sort((a, b) => b.revenue - a.revenue),
    [data]
  );
  const categoryTotal = monthTopCategories.reduce((total, category) => total + Number(category.revenue), 0);

  if (loading) {
    return (
      <div className="page-loader">
        <span className="spinner" />
        <p>Chargement de votre tableau de bord…</p>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader
          eyebrow="Vue d’ensemble"
          title="Tableau de bord"
          description="Suivez l’activité commerciale et l’état de votre stock en temps réel."
        />
        <div className="error-panel">
          <AlertTriangle size={22} />
          <div>
            <strong>Impossible de charger les données</strong>
            <p>{error}</p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={() => load()}>
            <RefreshCw size={16} /> Réessayer
          </button>
        </div>
      </>
    );
  }

  const { kpis, recent_sales: recentSales = [], low_stock_products: lowStock = [], top_products: topProducts = [] } = data;

  return (
    <div className="dashboard-page">
      <PageHeader
        eyebrow="Vue d’ensemble"
        title="Tableau de bord"
        description="Suivez l’activité commerciale et l’état de votre stock en temps réel."
        actions={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => load(true)}
              disabled={refreshing}
            >
              <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
              Actualiser
            </button>
            <Link to="/ventes/nouvelle" className="btn btn-primary">
              <Plus size={17} /> Nouvelle vente
            </Link>
          </>
        }
      />

      <section className="stat-grid">
        <StatCard
          label="Chiffre d’affaires du mois"
          value={formatCurrency(kpis.revenue_month)}
          icon={CircleDollarSign}
          tone="primary"
          trend={kpis.revenue_growth}
          meta={`${formatNumber(kpis.sales_month)} vente${kpis.sales_month > 1 ? 's' : ''} ce mois-ci`}
          footer={
            <span className="stat-footnote">
              Mois précédent : {formatCurrency(kpis.revenue_previous_month)}
            </span>
          }
        />
        <StatCard
          label="Ventes du jour"
          value={formatNumber(kpis.sales_today)}
          icon={ShoppingBag}
          tone="success"
          meta={`${formatCurrency(kpis.revenue_today)} encaissés`}
          footer={
            <span className="stat-footnote">
              Panier moyen : {formatCurrency(kpis.average_basket)}
            </span>
          }
        />
        <StatCard
          label="Alertes de stock"
          value={formatNumber(kpis.low_stock_count + kpis.out_of_stock_count)}
          icon={AlertTriangle}
          tone="warning"
          meta={`${kpis.out_of_stock_count} rupture${kpis.out_of_stock_count > 1 ? 's' : ''} · ${kpis.low_stock_count} stock faible`}
          footer={
            <Link to="/produits?status=alert" className="stat-link">
              Réapprovisionner <ArrowUpRight size={14} />
            </Link>
          }
        />
        <StatCard
          label="Clients actifs"
          value={formatNumber(kpis.clients_count)}
          icon={Users}
          tone="violet"
          meta={`+${kpis.new_clients_month} nouveau${kpis.new_clients_month > 1 ? 'x' : ''} ce mois-ci`}
          footer={
            <span className="stat-footnote">
              Valeur du stock : {formatCompactCurrency(kpis.stock_value)}
            </span>
          }
        />
      </section>

      <section className="dashboard-grid dashboard-grid-main">
        <article className="card chart-card">
          <div className="card-header">
            <div>
              <p className="card-eyebrow">Performance</p>
              <h2>Évolution des ventes</h2>
              <p className="card-subtitle">Chiffre d’affaires des 7 derniers jours</p>
            </div>
            <div className="chart-total">
              <span>Total 7 jours</span>
              <strong>{formatCurrency(weeklyTotal)}</strong>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 12, right: 8, left: -14, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#eef1f6" strokeDasharray="4 4" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(value) => `${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value} €`}
                  width={62}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#c7d2fe', strokeWidth: 1.5 }} />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                  dot={{ r: 3, strokeWidth: 2, fill: '#fff', stroke: '#4f46e5' }}
                  activeDot={{ r: 5, strokeWidth: 3, fill: '#fff', stroke: '#4f46e5' }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="card donut-card">
          <div className="card-header">
            <div>
              <p className="card-eyebrow">Mix produit</p>
              <h2>Ventes par catégorie</h2>
              <p className="card-subtitle">Répartition du mois en cours</p>
            </div>
          </div>

          {monthTopCategories.length > 0 ? (
            <>
              <div className="donut-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={monthTopCategories}
                      dataKey="revenue"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={88}
                      paddingAngle={3}
                      stroke="none"
                      isAnimationActive={false}
                    >
                      {monthTopCategories.map((entry, index) => (
                        <Cell key={entry.name} fill={entry.color || '#6366f1'} opacity={1 - index * 0.04} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) =>
                        active && payload?.length ? (
                          <div className="chart-tooltip">
                            <span>{payload[0].name}</span>
                            <strong>{formatCurrency(payload[0].value)}</strong>
                          </div>
                        ) : null
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="donut-center">
                  <span>Total</span>
                  <strong>{formatCompactCurrency(categoryTotal)}</strong>
                </div>
              </div>
              <div className="donut-legend">
                {monthTopCategories.slice(0, 5).map((category) => (
                  <div className="donut-legend-row" key={category.name}>
                    <span className="legend-dot" style={{ background: category.color || '#6366f1' }} />
                    <span className="legend-label">{category.name}</span>
                    <span className="legend-value">{formatCurrency(category.revenue)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              icon={Boxes}
              title="Aucune vente ce mois-ci"
              description="Enregistrez une vente pour voir la répartition."
              action={
                <Link to="/ventes/nouvelle" className="btn btn-primary btn-sm">
                  <Plus size={15} /> Nouvelle vente
                </Link>
              }
            />
          )}
        </article>
      </section>

      <section className="dashboard-grid dashboard-grid-secondary">
        <article className="card table-card">
          <div className="card-header">
            <div>
              <p className="card-eyebrow">Activité récente</p>
              <h2>Dernières ventes</h2>
              <p className="card-subtitle">Les transactions les plus récentes</p>
            </div>
            <Link to="/ventes" className="link-action">
              Tout voir <ArrowRight size={15} />
            </Link>
          </div>

          {recentSales.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="Aucune vente enregistrée"
              description="Votre historique de ventes apparaîtra ici."
            />
          ) : (
            <div className="table-scroll">
              <table className="data-table compact-table">
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Client</th>
                    <th>Date</th>
                    <th>Paiement</th>
                    <th>Statut</th>
                    <th className="align-right">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale) => (
                    <tr key={sale.id}>
                      <td>
                        <Link to={`/ventes?search=${encodeURIComponent(sale.reference)}`} className="table-link">
                          {sale.reference}
                        </Link>
                      </td>
                      <td>
                        <div className="person-cell">
                          <Avatar name={sale.client?.name} size="xs" />
                          <span>{sale.client?.name}</span>
                        </div>
                      </td>
                      <td className="text-muted">{formatRelativeDate(sale.sale_date)}</td>
                      <td className="text-muted">{PAYMENT_LABELS[sale.payment_method] || sale.payment_method}</td>
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
        </article>

        <article className="card lowstock-card">
          <div className="card-header">
            <div>
              <p className="card-eyebrow">À surveiller</p>
              <h2>Stocks faibles</h2>
              <p className="card-subtitle">Produits sous le seuil d’alerte</p>
            </div>
            <Link to="/produits?status=alert" className="link-action">
              Gérer
            </Link>
          </div>

          {lowStock.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Tous les stocks sont sains"
              description="Aucun produit ne nécessite de réapprovisionnement."
            />
          ) : (
            <div className="lowstock-list">
              {lowStock.map((product) => {
                const isOut = product.stock <= 0;
                return (
                  <Link to="/produits?status=alert" className="lowstock-row" key={product.id}>
                    <span
                      className="lowstock-thumb"
                      style={{ background: `${product.category?.color || '#6366f1'}1a`, color: product.category?.color || '#6366f1' }}
                    >
                      {product.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="lowstock-info">
                      <strong>{product.name}</strong>
                      <span>
                        {product.reference} · seuil {product.stock_alert}
                      </span>
                    </div>
                    <Badge tone={isOut ? 'danger' : 'warning'}>
                      {isOut ? 'Rupture' : `${product.stock} restant${product.stock > 1 ? 's' : ''}`}
                    </Badge>
                  </Link>
                );
              })}
              <div className="lowstock-footer">
                <AlertTriangle size={15} />
                <span>
                  {kpis.out_of_stock_count + kpis.low_stock_count} produit(s) à réapprovisionner
                </span>
                <Link to="/produits?status=alert">Voir tout</Link>
              </div>
            </div>
          )}
        </article>
      </section>

      <section className="dashboard-grid dashboard-grid-main">
        <article className="card chart-card">
          <div className="card-header">
            <div>
              <p className="card-eyebrow">Tendance annuelle</p>
              <h2>Chiffre d’affaires mensuel</h2>
              <p className="card-subtitle">Évolution sur les 12 derniers mois</p>
            </div>
            <Badge tone="info" className="badge-soft">
              <CalendarDays size={13} /> 12 mois
            </Badge>
          </div>
          <div className="chart-container chart-container-bar">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 12, right: 8, left: -14, bottom: 0 }} barCategoryGap="28%">
                <CartesianGrid vertical={false} stroke="#eef1f6" strokeDasharray="4 4" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11.5 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(value) => `${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value} €`}
                  width={56}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8faff', radius: 8 }} />
                <Bar dataKey="total" fill="#6366f1" radius={[7, 7, 2, 2]} maxBarSize={34} isAnimationActive={false}>
                  {monthlyData.map((entry, index) => (
                    <Cell
                      key={entry.month}
                      fill={index === monthlyData.length - 1 ? '#4f46e5' : '#c7d2fe'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="card top-products-card">
          <div className="card-header">
            <div>
              <p className="card-eyebrow">Best-sellers</p>
              <h2>Top produits</h2>
              <p className="card-subtitle">Meilleures ventes du mois</p>
            </div>
            <TrendingUp size={18} className="card-header-icon" />
          </div>

          {topProducts.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Pas encore de ventes ce mois-ci"
              description="Les produits les plus vendus seront affichés ici."
            />
          ) : (
            <div className="top-products-list">
              {topProducts.map((product, index) => (
                <div className="top-product-row" key={product.product_id}>
                  <span className={`rank rank-${index + 1}`}>{String(index + 1).padStart(2, '0')}</span>
                  <div className="top-product-info">
                    <strong>{product.name}</strong>
                    <span>{product.reference} · {formatNumber(product.quantity)} vendus</span>
                  </div>
                  <strong className="top-product-revenue">{formatCurrency(product.revenue)}</strong>
                </div>
              ))}
            </div>
          )}

          <div className="top-products-summary">
            <Clock3 size={15} />
            <span>Sur les {formatNumber(kpis.sales_month)} ventes du mois</span>
          </div>
        </article>
      </section>
    </div>
  );
}
