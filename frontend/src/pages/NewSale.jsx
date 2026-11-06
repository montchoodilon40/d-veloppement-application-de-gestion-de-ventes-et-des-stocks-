import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Check,
  CreditCard,
  Minus,
  PackageSearch,
  Plus,
  ReceiptText,
  Search,
  ShoppingCart,
  Trash2,
  UserPlus,
  UserRound,
} from 'lucide-react';
import api, { getErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import useDebounce from '../hooks/useDebounce';
import PageHeader from '../components/PageHeader';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import ClientFormModal from '../components/ClientFormModal';
import EmptyState from '../components/EmptyState';
import {
  formatCurrency,
  PAYMENT_METHODS,
  STOCK_STATUS,
  TAX_RATES,
  toDateInputValue,
} from '../utils/format';

export default function NewSale() {
  const navigate = useNavigate();
  const { notify } = useToast();

  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientId, setClientId] = useState('');
  const [clientFormOpen, setClientFormOpen] = useState(false);

  const [productSearch, setProductSearch] = useState('');
  const debouncedProductSearch = useDebounce(productSearch, 300);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const [cart, setCart] = useState([]);
  const [saleDate, setSaleDate] = useState(toDateInputValue());
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [taxRate, setTaxRate] = useState(20);
  const [discountInput, setDiscountInput] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadClients = useCallback(async () => {
    setClientsLoading(true);
    try {
      const { data } = await api.get('/clients', { params: { all: 1 } });
      setClients(data.data);
    } catch (requestError) {
      notify(getErrorMessage(requestError), 'error');
    } finally {
      setClientsLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  useEffect(() => {
    let active = true;
    setProductsLoading(true);

    api
      .get('/products/options', {
        params: { search: debouncedProductSearch || undefined, limit: 9 },
      })
      .then(({ data }) => {
        if (active) setProducts(data.data);
      })
      .catch((requestError) => {
        if (active) notify(getErrorMessage(requestError), 'error');
      })
      .finally(() => {
        if (active) setProductsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [debouncedProductSearch, notify]);

  const selectedClient = useMemo(
    () => clients.find((client) => String(client.id) === String(clientId)),
    [clients, clientId]
  );

  const subtotal = useMemo(
    () => cart.reduce((total, line) => total + Number(line.product.sale_price) * line.quantity, 0),
    [cart]
  );

  const discount = useMemo(() => {
    const value = Number(discountInput) || 0;
    return Math.max(0, Math.min(value, subtotal));
  }, [discountInput, subtotal]);

  const taxableBase = Math.max(0, subtotal - discount);
  const taxAmount = taxableBase * (Number(taxRate) / 100);
  const total = taxableBase + taxAmount;
  const totalItems = cart.reduce((sum, line) => sum + line.quantity, 0);

  const addProduct = (product) => {
    if (product.stock <= 0) {
      notify(`Le produit « ${product.name} » est en rupture de stock.`, 'error');
      return;
    }

    setCart((current) => {
      const existing = current.find((line) => line.product.id === product.id);

      if (existing) {
        if (existing.quantity >= product.stock) {
          notify(`Stock maximum atteint pour « ${product.name} » (${product.stock}).`, 'info');
          return current;
        }
        return current.map((line) =>
          line.product.id === product.id ? { ...line, quantity: line.quantity + 1 } : line
        );
      }

      return [...current, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, nextQuantity) => {
    setCart((current) =>
      current.map((line) => {
        if (line.product.id !== productId) return line;
        const value = Math.max(1, Math.min(Number(nextQuantity) || 1, line.product.stock));
        return { ...line, quantity: value };
      })
    );
  };

  const removeLine = (productId) => {
    setCart((current) => current.filter((line) => line.product.id !== productId));
  };

  const quantityInCart = (productId) =>
    cart.find((line) => line.product.id === productId)?.quantity || 0;

  const submit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!clientId) {
      setFormError('Veuillez sélectionner un client pour enregistrer la vente.');
      return;
    }

    if (cart.length === 0) {
      setFormError('Ajoutez au moins un produit à la vente.');
      return;
    }

    const invalidLine = cart.find((line) => line.quantity > line.product.stock);
    if (invalidLine) {
      setFormError(`Stock insuffisant pour « ${invalidLine.product.name} ».`);
      return;
    }

    setSubmitting(true);

    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;
    const saleDateValue = saleDate ? `${saleDate}T${time}` : null;

    try {
      const { data } = await api.post('/sales', {
        client_id: Number(clientId),
        sale_date: saleDateValue,
        payment_method: paymentMethod,
        tax_rate: Number(taxRate),
        discount_amount: discount,
        notes: notes || null,
        items: cart.map((line) => ({
          product_id: line.product.id,
          quantity: line.quantity,
          unit_price: Number(line.product.sale_price),
        })),
      });

      notify(`Vente ${data.data.reference} enregistrée avec succès.`, 'success');
      window.dispatchEvent(new Event('stock:changed'));
      navigate('/ventes');
    } catch (requestError) {
      setFormError(getErrorMessage(requestError));
      notify('La vente n’a pas pu être enregistrée.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="new-sale-page">
      <PageHeader
        eyebrow="Encaissement"
        title="Nouvelle vente"
        description="Sélectionnez le client, composez le panier et validez la transaction."
        actions={
          <Link to="/ventes" className="btn btn-secondary">
            <ArrowLeft size={16} /> Retour aux ventes
          </Link>
        }
      />

      <form onSubmit={submit} className="sale-layout">
        <div className="sale-main">
          <section className="card sale-step">
            <div className="sale-step-head">
              <span className="step-number">1</span>
              <div>
                <h2>Client</h2>
                <p>À qui est destinée cette vente ?</p>
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setClientFormOpen(true)}>
                <UserPlus size={15} /> Nouveau
              </button>
            </div>

            <div className="sale-client-row">
              <div className="field flex-1">
                <label htmlFor="sale-client">Sélectionner un client *</label>
                <select
                  id="sale-client"
                  className="select select-lg"
                  value={clientId}
                  onChange={(event) => setClientId(event.target.value)}
                  disabled={clientsLoading}
                >
                  <option value="">
                    {clientsLoading ? 'Chargement des clients…' : 'Choisir un client…'}
                  </option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                      {client.city ? ` — ${client.city}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {selectedClient && (
                <div className="sale-client-preview">
                  <Avatar name={selectedClient.name} size="md" />
                  <div>
                    <strong>{selectedClient.name}</strong>
                    <span>{selectedClient.email || selectedClient.phone || 'Sans contact'}</span>
                    <small>{selectedClient.city || 'Ville non renseignée'}</small>
                  </div>
                  <Badge tone="success" dot>
                    {selectedClient.sales_count || 0} achat(s)
                  </Badge>
                </div>
              )}
            </div>
          </section>

          <section className="card sale-step">
            <div className="sale-step-head">
              <span className="step-number">2</span>
              <div>
                <h2>Produits</h2>
                <p>Recherchez un article puis ajoutez-le au panier.</p>
              </div>
              <span className="step-count">{products.length} résultat(s)</span>
            </div>

            <div className="search-box sale-product-search">
              <Search size={17} />
              <input
                type="search"
                placeholder="Rechercher par nom ou référence…"
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
                aria-label="Rechercher un produit à vendre"
              />
              {productSearch && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() => setProductSearch('')}
                  aria-label="Effacer"
                >
                  ×
                </button>
              )}
            </div>

            {productsLoading ? (
              <div className="sale-products-loading">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div className="sale-product-skeleton" key={index}>
                    <span className="skeleton skeleton-avatar" />
                    <span className="skeleton skeleton-line" />
                    <span className="skeleton skeleton-short" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <EmptyState
                icon={PackageSearch}
                title="Aucun produit trouvé"
                description="Essayez un autre nom ou une autre référence."
              />
            ) : (
              <div className="sale-product-grid">
                {products.map((product) => {
                  const statusInfo = STOCK_STATUS[product.stock_status] || STOCK_STATUS.in;
                  const inCart = quantityInCart(product.id);
                  const isUnavailable = product.stock <= 0;

                  return (
                    <button
                      type="button"
                      className={`sale-product-card ${isUnavailable ? 'is-unavailable' : ''} ${inCart ? 'is-selected' : ''}`}
                      key={product.id}
                      onClick={() => addProduct(product)}
                      disabled={isUnavailable}
                    >
                      <div className="sale-product-top">
                        <span
                          className="sale-product-thumb"
                          style={{
                            background: `${product.category?.color || '#6366f1'}18`,
                            color: product.category?.color || '#6366f1',
                          }}
                        >
                          {product.name.charAt(0).toUpperCase()}
                        </span>
                        <div className="sale-product-info">
                          <strong>{product.name}</strong>
                          <span>{product.reference}</span>
                        </div>
                        <span className={`sale-add ${inCart ? 'is-added' : ''}`}>
                          {inCart ? <Check size={15} /> : <Plus size={15} />}
                        </span>
                      </div>
                      <div className="sale-product-bottom">
                        <strong>{formatCurrency(product.sale_price)}</strong>
                        <Badge tone={statusInfo.tone}>
                          {isUnavailable ? 'Rupture' : `${product.stock} ${product.unit}`}
                        </Badge>
                      </div>
                      {inCart > 0 && <span className="sale-product-badge">{inCart} au panier</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="card cart-card">
            <div className="cart-head">
              <div>
                <h2>
                  <ShoppingCart size={18} /> Panier
                </h2>
                <p>
                  {totalItems} article{totalItems > 1 ? 's' : ''} · {cart.length} produit
                  {cart.length > 1 ? 's' : ''}
                </p>
              </div>
              {cart.length > 0 && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCart([])}>
                  <Trash2 size={14} /> Vider
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="cart-empty">
                <span>
                  <ShoppingCart size={23} />
                </span>
                <h3>Votre panier est vide</h3>
                <p>Ajoutez des produits depuis la sélection ci-dessus.</p>
              </div>
            ) : (
              <div className="cart-lines">
                {cart.map((line) => (
                  <div className="cart-line" key={line.product.id}>
                    <span
                      className="cart-thumb"
                      style={{
                        background: `${line.product.category?.color || '#6366f1'}18`,
                        color: line.product.category?.color || '#6366f1',
                      }}
                    >
                      {line.product.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="cart-line-info">
                      <strong>{line.product.name}</strong>
                      <span>
                        {line.product.reference} · {formatCurrency(line.product.sale_price)} /{' '}
                        {line.product.unit}
                      </span>
                    </div>
                    <div className="quantity-stepper">
                      <button
                        type="button"
                        onClick={() => updateQuantity(line.product.id, line.quantity - 1)}
                        disabled={line.quantity <= 1}
                        aria-label="Diminuer la quantité"
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={line.product.stock}
                        value={line.quantity}
                        onChange={(event) => updateQuantity(line.product.id, event.target.value)}
                        aria-label={`Quantité de ${line.product.name}`}
                      />
                      <button
                        type="button"
                        onClick={() => updateQuantity(line.product.id, line.quantity + 1)}
                        disabled={line.quantity >= line.product.stock}
                        aria-label="Augmenter la quantité"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <strong className="cart-line-total">
                      {formatCurrency(Number(line.product.sale_price) * line.quantity)}
                    </strong>
                    <button
                      type="button"
                      className="icon-btn icon-btn-danger"
                      onClick={() => removeLine(line.product.id)}
                      aria-label={`Retirer ${line.product.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="sale-summary">
          <div className="card sale-summary-card">
            <div className="sale-summary-head">
              <span className="sale-summary-icon">
                <ReceiptText size={20} />
              </span>
              <div>
                <h2>Résumé de la vente</h2>
                <p>Vérifiez les informations avant validation.</p>
              </div>
            </div>

            {formError && (
              <div className="form-error">
                <AlertTriangle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <div className="sale-summary-fields">
              <div className="field">
                <label htmlFor="sale-date">
                  <CalendarDays size={14} /> Date de la vente
                </label>
                <input
                  id="sale-date"
                  type="date"
                  className="input"
                  value={saleDate}
                  onChange={(event) => setSaleDate(event.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="sale-payment">
                  <CreditCard size={14} /> Mode de paiement
                </label>
                <select
                  id="sale-payment"
                  className="select"
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-grid form-grid-2">
                <div className="field">
                  <label htmlFor="sale-tax">TVA</label>
                  <select
                    id="sale-tax"
                    className="select"
                    value={taxRate}
                    onChange={(event) => setTaxRate(event.target.value)}
                  >
                    {TAX_RATES.map((rate) => (
                      <option key={rate} value={rate}>
                        {rate} %
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="sale-discount">Remise (€)</label>
                  <input
                    id="sale-discount"
                    type="number"
                    min="0"
                    step="0.01"
                    className="input"
                    value={discountInput}
                    onChange={(event) => setDiscountInput(event.target.value)}
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="sale-notes">Note (optionnel)</label>
                <textarea
                  id="sale-notes"
                  className="textarea"
                  rows="2"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Informations complémentaires…"
                />
              </div>
            </div>

            <div className="sale-totals sale-totals-box">
              <div>
                <span>Sous-total</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>
              {discount > 0 && (
                <div className="sale-total-discount">
                  <span>Remise</span>
                  <strong>−{formatCurrency(discount)}</strong>
                </div>
              )}
              <div>
                <span>TVA ({Number(taxRate)} %)</span>
                <strong>{formatCurrency(taxAmount)}</strong>
              </div>
              <div className="sale-total-final">
                <span>Total à encaisser</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
            </div>

            {Number(discountInput) > subtotal && (
              <p className="field-hint field-hint-warning">
                <AlertTriangle size={13} /> La remise est plafonnée au sous-total.
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-block"
              disabled={submitting || cart.length === 0 || !clientId}
            >
              {submitting ? <span className="spinner spinner-sm" /> : <Check size={18} />}
              Valider la vente · {formatCurrency(total)}
            </button>

            <p className="sale-summary-hint">
              Le stock sera automatiquement mis à jour après validation.
            </p>
          </div>

          <div className="sale-help-card">
            <span>
              <UserRound size={17} />
            </span>
            <div>
              <strong>Besoin d’aide ?</strong>
              <p>Le stock est vérifié côté serveur au moment de la validation de la vente.</p>
            </div>
          </div>
        </aside>
      </form>

      <ClientFormModal
        open={clientFormOpen}
        client={null}
        onClose={() => setClientFormOpen(false)}
        onSaved={(client) => {
          setClients((current) => [client, ...current]);
          setClientId(client.id);
          notify(`Le client « ${client.name} » a été créé et sélectionné.`);
          loadClients();
        }}
      />
    </div>
  );
}
