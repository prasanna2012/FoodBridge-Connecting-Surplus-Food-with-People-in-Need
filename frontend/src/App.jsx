import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import AvailableDonations from './pages/AvailableDonations';
import DonationDetails from './pages/DonationDetails';
import AddDonation from './pages/AddDonation';
import DonorDashboard from './pages/DonorDashboard';
import NgoDashboard from './pages/NgoDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DonationTracking from './pages/DonationTracking';
import DonationHistory from './pages/DonationHistory';
import NotFound from './pages/NotFound';

export const App = () => {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen flex flex-col bg-warm-50/50 text-gray-800 font-sans antialiased selection:bg-brand-100 selection:text-brand-900">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Pages */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/donations" element={<AvailableDonations />} />
                <Route path="/donations/:id" element={<DonationDetails />} />
                <Route path="/tracking/:id" element={<DonationTracking />} />
                <Route path="/history" element={<DonationHistory />} />

                {/* Donor Protected Routes */}
                <Route
                  path="/donations/add"
                  element={
                    <ProtectedRoute allowedRoles={['donor', 'admin']}>
                      <AddDonation />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/donor/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['donor', 'admin']}>
                      <DonorDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* NGO Protected Routes */}
                <Route
                  path="/ngo/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['ngo', 'admin']}>
                      <NgoDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Protected Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
