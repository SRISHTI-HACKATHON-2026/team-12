import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <div className="min-h-[100svh] w-full bg-slate-100 text-slate-900 font-sans flex flex-col items-center">
            {/* The container scales up to max-w-5xl on PC and acts like a mobile app on smaller screens */}
            <div className="w-full max-w-5xl bg-slate-50 min-h-[100svh] shadow-2xl relative overflow-hidden flex flex-col sm:my-0 lg:my-8 lg:min-h-[calc(100svh-4rem)] lg:rounded-3xl border border-slate-200">
              <AppRoutes />
            </div>
          </div>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
