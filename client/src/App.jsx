import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import CreateOrderPage from './pages/CreateOrderPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProviderDashboardPage from './pages/ProviderDashboardPage';
import ProviderProfilePage from './pages/ProviderProfilePage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/providers/:providerId" element={<ProviderProfilePage />} />
        <Route
          path="/orders/new/:providerId"
          element={
            <ProtectedRoute role="user">
              <CreateOrderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="provider">
              <ProviderDashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
