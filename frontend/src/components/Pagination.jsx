import { ChevronLeft, ChevronRight } from 'lucide-react';

function buildPages(current, last) {
  if (last <= 7) return Array.from({ length: last }, (_, index) => index + 1);

  const pages = new Set([1, last, current, current - 1, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= last).sort((a, b) => a - b);

  const result = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) result.push('ellipsis');
    result.push(page);
  });

  return result;
}

export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) return null;

  const pages = buildPages(meta.current_page, meta.last_page);

  return (
    <div className="pagination">
      <p className="pagination-info">
        <strong>{meta.from ?? 0}</strong>–<strong>{meta.to ?? 0}</strong> sur <strong>{meta.total}</strong>
      </p>
      <div className="pagination-controls">
        <button
          type="button"
          className="icon-btn"
          disabled={meta.current_page <= 1}
          onClick={() => onPageChange(meta.current_page - 1)}
          aria-label="Page précédente"
        >
          <ChevronLeft size={17} />
        </button>
        {pages.map((page, index) =>
          page === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="pagination-ellipsis">
              …
            </span>
          ) : (
            <button
              key={page}
              type="button"
              className={`pagination-page ${page === meta.current_page ? 'is-active' : ''}`}
              onClick={() => onPageChange(page)}
              disabled={page === meta.current_page}
            >
              {page}
            </button>
          )
        )}
        <button
          type="button"
          className="icon-btn"
          disabled={meta.current_page >= meta.last_page}
          onClick={() => onPageChange(meta.current_page + 1)}
          aria-label="Page suivante"
        >
          <ChevronRight size={17} />
        </button>
      </div>
    </div>
  );
}
