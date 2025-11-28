
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { TourProvider } from '@/contexts/TourContext';
import { Toaster } from '@/components/ui/toaster';
import SplashScreen from '@/pages/SplashScreen';
import LoginPage from '@/pages/LoginPage';
import HomePage from '@/pages/HomePage';
import ProfilePage from '@/pages/ProfilePage';
import MedalsPage from '@/pages/MedalsPage';
import TourSetupPage from '@/pages/TourSetupPage';
import TourRecommendationsPage from '@/pages/TourRecommendationsPage';
import ActiveTourPage from '@/pages/ActiveTourPage';
import NavigationPage from '@/pages/NavigationPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import AddPlacePage from '@/pages/AddPlacePage';

function App() {
  return (
    <AuthProvider>
      <TourProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/medals"
              element={
                <ProtectedRoute>
                  <MedalsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tour-setup"
              element={
                <ProtectedRoute>
                  <TourSetupPage />
                </ProtectedRoute>
              }
            />
             <Route
              path="/tour-recommendations"
              element={
                <ProtectedRoute>
                  <TourRecommendationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/active-tour"
              element={
                <ProtectedRoute>
                  <ActiveTourPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/navigation/:placeId"
              element={
                <ProtectedRoute>
                  <NavigationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-place"
              element={
                <ProtectedRoute>
                  <AddPlacePage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        <Toaster />
      </TourProvider>
    </AuthProvider>
  );
}

export default App;
