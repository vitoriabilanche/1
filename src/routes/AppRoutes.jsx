import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import DashboardPage from '@/pages/DashboardPage';
import ProjectsPage from '@/pages/ProjectsPage';
import ProjectDetailsPage from '@/pages/ProjectDetailsPage';
import SettingsPage from '@/pages/SettingsPage';
import SensorsPage from '@/pages/SensorsPage';
import SensorDetailsPage from '@/pages/SensorDetailsPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/layouts/DashboardLayout';
import LandingPage from '@/pages/LandingPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      
      <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/projects" element={
          <ProtectedRoute>
            <DashboardLayout>
              <ProjectsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/projects/:projectId" element={
          <ProtectedRoute>
            <DashboardLayout>
              <ProjectDetailsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/sensors" element={
          <ProtectedRoute>
            <DashboardLayout>
              <SensorsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/sensors/:sensorId" element={
          <ProtectedRoute>
            <DashboardLayout>
              <SensorDetailsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/settings" element={
          <ProtectedRoute>
            <DashboardLayout>
              <SettingsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;