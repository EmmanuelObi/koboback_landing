import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App.tsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.tsx";
import Terms from "./pages/Terms.tsx";
import Waitlist from "./pages/Waitlist.tsx";
import { AuthProvider } from "./product/context/AuthContext.tsx";
import ProtectedRoute from "./product/components/ProtectedRoute.tsx";
import ProductAuth from "./product/pages/ProductAuth.tsx";
import OnboardingPage from "./product/pages/OnboardingPage.tsx";
import DashboardPage from "./product/pages/DashboardPage.tsx";
import ProfilePage from "./product/pages/ProfilePage.tsx";
import StatementsPage from "./product/pages/StatementsPage.tsx";
import AuditJobPage from "./product/pages/AuditJobPage.tsx";
import ReportPage from "./product/pages/ReportPage.tsx";
import CookieBanner from "./components/CookieBanner.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/waitlist" element={<Waitlist />} />
          <Route path="/product" element={<ProductAuth />} />
          <Route
            path="/product/onboarding"
            element={
              <ProtectedRoute requireOnboarding={false}>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/product/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/product/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/product/statements"
            element={
              <ProtectedRoute>
                <StatementsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/product/audit"
            element={<Navigate to="/product/statements" replace />}
          />
          <Route
            path="/product/audit/:jobId"
            element={
              <ProtectedRoute>
                <AuditJobPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/product/report/:jobId"
            element={
              <ProtectedRoute>
                <ReportPage />
              </ProtectedRoute>
            }
          />
        </Routes>
        <CookieBanner />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
