import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// Route protection validation component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('dhanvantari_admin_token');
  // Fetch using the correct key name that we used in AdminLogin.tsx
  const role = localStorage.getItem('dhanvantari_admin_role');

  // Accept both string formats just to be safe
  if (!token || (role !== 'ROLE_ADMIN' && role !== 'ADMIN')) {
    // Force clear details and redirect to login if session is invalid or unauthorized
    localStorage.removeItem('dhanvantari_admin_token');
    localStorage.removeItem('dhanvantari_admin_name');
    localStorage.removeItem('dhanvantari_admin_role');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Route */}
        <Route path="/" element={<AdminLogin />} />

        {/* Back-Office Dashboard Route (Protected) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback Redirection */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;