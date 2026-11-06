import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

export default function StatCard({ label, value, icon: Icon, tone = 'primary', meta, trend, footer }) {
  const isPositive = Number(trend) >= 0;

  return (
    <article className={`stat-card stat-${tone}`}>
      <div className="stat-top">
        <span className="stat-icon">
          {Icon && <Icon size={20} />}
        </span>
        {trend !== undefined && trend !== null && (
          <span className={`stat-trend ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(Number(trend)).toFixed(1)}%
          </span>
        )}
      </div>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      {meta && <p className="stat-meta">{meta}</p>}
      {footer}
    </article>
  );
}
