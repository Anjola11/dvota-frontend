import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Login } from '@/pages/auth/Login';
import { Signup } from '@/pages/auth/Signup';
import { VerifyOtp } from '@/pages/auth/VerifyOtp';
import { Dashboard } from '@/pages/dashboard/Dashboard';
import { ElectionDetails } from '@/pages/election/ElectionDetails';
import { Results } from '@/pages/election/Results';

import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { ResetPassword } from '@/pages/auth/ResetPassword';
import { CreateElection } from '@/pages/election/CreateElection';
import { ManageElection } from '@/pages/election/ManageElection';
import { Settings } from '@/pages/settings/Settings';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/create-election" element={
              <ProtectedRoute>
                <CreateElection />
              </ProtectedRoute>
            } />
            <Route path="/election/:id/manage" element={
              <ProtectedRoute>
                <ManageElection />
              </ProtectedRoute>
            } />
            <Route path="/election/:id" element={
              <ProtectedRoute>
                <ElectionDetails />
              </ProtectedRoute>
            } />
            <Route path="/election/:id/results" element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            } />
          </Route>

          {/* Root Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
