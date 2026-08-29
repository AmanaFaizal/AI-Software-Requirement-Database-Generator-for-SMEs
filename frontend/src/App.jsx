import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BusinessProvider } from './context/BusinessContext';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BusinessSelectPage from './pages/BusinessSelectPage';
import DashboardLayout from './pages/DashboardLayout';
import InventoryPage from './pages/InventoryPage';
import CategoriesPage from './pages/CategoriesPage';
import DealersPage from './pages/DealersPage';
import PurchasesPage from './pages/PurchasesPage';
import InvoicesPage from './pages/InvoicesPage';
import ReportsPage from './pages/ReportsPage';
import RemindersPage from './pages/RemindersPage';
import SalesPage from './pages/SalesPage';
import ExpensesPage from './pages/ExpensesPage';

function RootRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? '/businesses' : '/login'} replace />;
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BusinessProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/businesses"
                element={
                  <ProtectedRoute>
                    <BusinessSelectPage />
                  </ProtectedRoute>
                }
              />
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/dealers" element={<DealersPage />} />
                <Route path="/purchases" element={<PurchasesPage />} />
                <Route path="/sales" element={<SalesPage />} />
                <Route path="/expenses" element={<ExpensesPage />} />
                <Route path="/invoices" element={<InvoicesPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/reminders" element={<RemindersPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </BusinessProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
