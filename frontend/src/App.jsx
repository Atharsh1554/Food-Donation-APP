import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import ProtectRoute from './components/ProtectRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RestaurantDashboard from './pages/RestaurantDashboard';
import NgoDashboard from './pages/NgoDashboard';
import DonationDetails from './pages/DonationDetails';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Restaurant Dashboard Route */}
                <Route 
                  path="/restaurant-dashboard" 
                  element={
                    <ProtectRoute allowedRoles={['restaurant']}>
                      <RestaurantDashboard />
                    </ProtectRoute>
                  } 
                />

                {/* NGO Dashboard Route */}
                <Route 
                  path="/ngo-dashboard" 
                  element={
                    <ProtectRoute allowedRoles={['ngo']}>
                      <NgoDashboard />
                    </ProtectRoute>
                  } 
                />

                {/* Donation Details Route */}
                <Route 
                  path="/donations/:id" 
                  element={
                    <ProtectRoute>
                      <DonationDetails />
                    </ProtectRoute>
                  } 
                />

                {/* Profile Route */}
                <Route 
                  path="/profile" 
                  element={
                    <ProtectRoute>
                      <Profile />
                    </ProtectRoute>
                  } 
                />

                {/* Catch All Redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
