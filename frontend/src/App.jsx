import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Clients from './pages/Clients';
import Sales from './pages/Sales';
import NewSale from './pages/NewSale';
import StockMovements from './pages/StockMovements';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="produits" element={<Products />} />
            <Route path="categories" element={<Categories />} />
            <Route path="clients" element={<Clients />} />
            <Route path="ventes" element={<Sales />} />
            <Route path="ventes/nouvelle" element={<NewSale />} />
            <Route path="stock" element={<StockMovements />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
