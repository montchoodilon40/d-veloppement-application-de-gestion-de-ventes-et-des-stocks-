# Commerciale — Frontend React

Interface de gestion commerciale construite avec React 19 et Vite.

## Démarrage

```bash
npm install
npm run dev
```

L'application est servie sur `http://127.0.0.1:5173`.

Le proxy Vite redirige les requêtes `/api` vers l'API Laravel sur `http://127.0.0.1:8000`. Pour cibler une autre URL :

```bash
# frontend/.env
VITE_API_URL=http://127.0.0.1:8000/api
```

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement avec HMR |
| `npm run build` | Build de production dans `dist/` |
| `npm run preview` | Prévisualisation du build sur `http://localhost:4173` |
| `npm run lint` | Analyse statique avec Oxlint |

## Pages

- `/` — tableau de bord et statistiques
- `/produits` — catalogue, prix, alertes de stock
- `/categories` — catégories
- `/clients` — fiches clients et historique
- `/ventes` — historique, filtres et annulations
- `/ventes/nouvelle` — encaissement
- `/stock` — journal des mouvements

La documentation complète (installation backend, base de données, API, tests) se trouve dans le [README principal](../README.md).
