# Commerciale — Gestion commerciale, ventes & stocks

Application web complète de gestion commerciale : catalogue produits, catégories, clients, encaissement de ventes, mouvements de stock, alertes de réapprovisionnement et tableau de bord statistique.

- **Backend** : Laravel 12 (API REST), PHP 8.2, MySQL / MariaDB
- **Frontend** : React 19, Vite, React Router 7, Axios, Recharts, CSS personnalisé
- **Base de données** : `commerciale_db`
- **Interface** : français, responsive (bureau, tablette, mobile)

---

## 1. Fonctionnalités

### Catalogue
- Création, modification, suppression et désactivation de produits.
- Référence générée automatiquement si elle est laissée vide.
- Catégories avec couleur et compteur de produits.
- Prix d'achat, prix de vente, marge calculée, unité, seuil d'alerte.
- Recherche, filtres (catégorie, niveau de stock) et tri.
- Le stock existant est modifié uniquement via un mouvement de stock (traçabilité).

### Clients
- Fiches clients avec coordonnées, ville et notes.
- Historique des dernières ventes et total dépensé (hors ventes annulées).
- Recherche par nom, e-mail, téléphone ou ville.
- Suppression bloquée lorsqu'un client possède des ventes.

### Ventes
- Encaissement en quelques étapes : client, panier, date, paiement, TVA, remise, note.
- Calcul automatique du sous-total, de la remise, de la TVA et du total TTC.
- Vérification de la disponibilité du stock **côté serveur** avant validation.
- Historique filtrable par recherche, statut, moyen de paiement et période.
- Fiche détaillée d'une vente avec lignes, quantités et totaux.
- Annulation d'une vente : le statut passe à « Annulée » et les quantités sont automatiquement réintégrées au stock.

### Stock
- Entrées, sorties et corrections d'inventaire.
- Mouvements horodatés avec quantité avant / après et motif.
- Lien vers la vente d'origine pour les sorties et annulations.
- Refus des sorties supérieures au stock disponible.

### Tableau de bord
- Chiffre d'affaires du jour, du mois et total.
- Nombre de ventes, panier moyen, croissance par rapport au mois précédent.
- Valeur du stock, nombre de produits, clients et alertes.
- Graphiques : ventes des 7 derniers jours, chiffre d'affaires sur 12 mois, répartition par catégorie, moyens de paiement.
- Top produits du mois, ventes récentes et produits en alerte.

### Alertes
- Produits en rupture et produits sous le seuil d'alerte.
- Badge d'alerte dans la navigation et raccourcis depuis le tableau de bord.

---

## 2. Prérequis

- PHP **8.2+** avec les extensions `pdo_mysql`, `mbstring`, `openssl`, `fileinfo`
- Composer
- Node.js **20+** et npm
- MySQL ou MariaDB (XAMPP, WAMP, MAMP ou installation native)

---

## 3. Installation

### 3.1 Base de données

Démarrer MySQL puis créer la base locale :

```sql
CREATE DATABASE commerciale_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Avec XAMPP sous Windows :

```powershell
C:\xampp\mysql\bin\mysql.exe -u root -e "CREATE DATABASE IF NOT EXISTS commerciale_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 3.2 Backend Laravel

```bash
cd backend
composer install
copy .env.example .env        # Windows
# cp .env.example .env        # macOS / Linux
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

`php artisan migrate --seed` crée les tables et charge les données de démonstration directement dans MySQL local. Le fichier `commerciale_db.sql` fourni à la racine peut aussi être importé à la place du seeder, dans la base vide. Depuis l'invite de commandes Windows, à la racine du projet :

```cmd
C:\xampp\mysql\bin\mysql.exe -u root commerciale_db < commerciale_db.sql
```

Avec un autre emplacement de MySQL, adaptez le chemin de `mysql.exe`. Après l'import du dump, ne lancez pas `migrate --seed` : le dump contient déjà le schéma et les données.

L'API Laravel est disponible localement sur **http://127.0.0.1:8000**. Elle n'est pas une API distante : elle relie l'interface React à la base MySQL locale.

Le fichier `.env.example` est déjà configuré pour MySQL local :

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=commerciale_db
DB_USERNAME=root
DB_PASSWORD=
```

Adaptez `DB_USERNAME` / `DB_PASSWORD` si nécessaire.

### 3.3 Frontend React

Dans un second terminal :

```bash
cd frontend
npm install
npm run dev
```

L'application est disponible sur **http://127.0.0.1:5173**.

Le serveur Vite redirige automatiquement les requêtes `/api` vers Laravel sur `http://127.0.0.1:8000`. Aucun fichier `.env` frontend n'est nécessaire pour l'utilisation locale. Une URL personnalisée ne sert que si le backend est volontairement hébergé ailleurs :

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

### 3.4 Données de démonstration

Le seeder crée :

- 5 catégories
- 20 produits (dont des produits en rupture et en stock faible)
- 10 clients
- 25 ventes (24 validées, 1 annulée) réparties sur les derniers mois, dont des ventes du jour
- 80 mouvements de stock

Pour réinitialiser complètement la démonstration :

```bash
cd backend
php artisan migrate:fresh --seed
```

> Aucune authentification n'est demandée dans ce TP : l'interface est directement accessible.

---

## 4. API REST

Toutes les routes sont préfixées par `/api` et renvoient du JSON.

### Tableau de bord et santé

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/health` | État de l'API et connexion à la base |
| `GET` | `/api/dashboard` | KPIs, graphiques, ventes récentes et alertes |

### Produits

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/products` | Liste paginée (`search`, `category_id`, `status`, `sort`, `direction`, `page`, `per_page`) |
| `POST` | `/api/products` | Création (stock initial + mouvement automatique) |
| `GET` | `/api/products/{id}` | Détail |
| `PUT/PATCH` | `/api/products/{id}` | Modification (hors stock) |
| `DELETE` | `/api/products/{id}` | Suppression si aucun article vendu |
| `GET` | `/api/products/options` | Produits actifs pour le panier |
| `GET` | `/api/products/low-stock` | Produits sous le seuil d'alerte |
| `POST` | `/api/products/{id}/stock-adjustments` | Entrée, sortie ou inventaire |
| `GET` | `/api/products/{id}/movements` | Historique des mouvements du produit |

Filtres de statut produit : `alert` (faible + rupture), `low`, `out`, `in`.

### Catégories

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/categories` | Liste paginée (`search`, `all`) |
| `POST` | `/api/categories` | Création |
| `GET` | `/api/categories/{id}` | Détail |
| `PUT/PATCH` | `/api/categories/{id}` | Modification |
| `DELETE` | `/api/categories/{id}` | Suppression si la catégorie est vide |

### Clients

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/clients` | Liste paginée (`search`, `sort`, `direction`, `all`) |
| `POST` | `/api/clients` | Création |
| `GET` | `/api/clients/{id}` | Fiche + 10 dernières ventes |
| `PUT/PATCH` | `/api/clients/{id}` | Modification |
| `DELETE` | `/api/clients/{id}` | Suppression si aucune vente |

### Ventes

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/sales` | Historique paginé + résumé (`search`, `status`, `payment_method`, `date_from`, `date_to`) |
| `POST` | `/api/sales` | Enregistrement atomique d'une vente |
| `GET` | `/api/sales/{id}` | Détail d'une vente |
| `POST` | `/api/sales/{id}/cancel` | Annulation + restauration du stock |

Exemple de création de vente :

```json
{
  "client_id": 1,
  "sale_date": "2026-10-29T14:30:00",
  "payment_method": "card",
  "tax_rate": 20,
  "discount_amount": 5,
  "notes": "Livraison offerte",
  "items": [
    { "product_id": 1, "quantity": 2, "unit_price": 199.00 }
  ]
}
```

Règles appliquées par le serveur :

- client et produits existants ;
- au moins une ligne, un produit par ligne ;
- quantité entière positive ;
- produit actif ;
- stock suffisant pour chaque ligne ;
- remise inférieure ou égale au sous-total ;
- TVA entre 0 et 100 % ;
- calcul du total : `(sous-total − remise) + TVA`.

### Mouvements de stock

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/stock-movements` | Journal paginé (`search`, `type`, `date_from`, `date_to`) |

Types : `in` (entrée), `out` (sortie), `adjustment` (inventaire).

---

## 5. Modèle de données

```text
categories 1 ─── n products
clients    1 ─── n sales
sales      1 ─── n sale_items n ─── 1 products
products   1 ─── n stock_movements n ─── 0..1 sales
```

- `products.stock` est un entier non signé.
- `sales.status` vaut `completed` ou `cancelled`.
- Les lignes de vente conservent le nom et la référence du produit au moment de la vente.
- `stock_movements.quantity` est signé ; `stock_before` / `stock_after` permettent l'audit.

---

## 6. Tests et vérifications

### Backend

```bash
cd backend
php artisan test
```

Les tests couvrent notamment :

- CRUD catégories, clients et produits ;
- génération de référence et mouvement de stock initial ;
- filtres d'alerte de stock ;
- ajustements de stock et refus de stock négatif ;
- calculs de vente (sous-total, remise, TVA, total) ;
- refus d'une vente en stock insuffisant ou avec produit inactif ;
- annulation d'une vente et restauration du stock ;
- exclusion des ventes annulées des statistiques ;
- endpoints du tableau de bord.

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

---

## 7. Structure du projet

```text
TP3/
├── backend/                  API Laravel
│   ├── app/
│   │   ├── Http/Controllers/  Dashboard, produits, catégories, clients, ventes, stock
│   │   ├── Http/Requests/     Validation des entrées
│   │   ├── Http/Resources/    Réponses JSON
│   │   ├── Models/            Catégorie, produit, client, vente, ligne, mouvement
│   │   └── Services/          SaleService, StockService
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/api.php
│   └── tests/Feature/
└── frontend/                 Interface React
    ├── src/
    │   ├── api/
    │   ├── components/        Modales, formulaires, tableaux, navigation
    │   ├── context/           Notifications toast
    │   ├── pages/             Dashboard, produits, catégories, clients, ventes, stock
    │   ├── styles/            Design system CSS
    │   └── utils/             Formats français, libellés, statuts
    └── vite.config.js         Proxy /api vers Laravel
```

---

## 8. Points techniques

- **Transactions SQL** : création et annulation de ventes exécutées dans une transaction avec verrouillage pessimiste (`lockForUpdate`) pour éviter les surventes concurrentes.
- **Traçabilité** : chaque variation de stock crée un mouvement lié au produit et, si applicable, à la vente.
- **Intégrité** : suppression refusée pour les produits/clients utilisés dans des ventes et les catégories non vides.
- **API sans authentification** : choix assumé pour un TP de démonstration. En production, ajouter Sanctum, des rôles et une protection des routes.
- **Affichage** : montants en euros et dates au format français (`Intl.NumberFormat('fr-FR')`).
"# d-veloppement-application-de-gestion-de-ventes-et-des-stocks-" 
