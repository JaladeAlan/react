import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";

// Context & Routing
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import { setupApiInterceptors } from "./utils/api";

// Layout
import Header from "./components/Header";
import Footer from "./components/Footer";

// Pages
import Splash from "./pages/Splash";
import Dashboard from "./pages/Dashboard";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Settings from "./pages/Settings/Settings";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import VerifyEmail from "./pages/Auth/VerifyEmail";
import EmailVerified from "./pages/Auth/EmailVerified";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetVerify from "./pages/Auth/ResetVerify";
import SetNewPassword from "./pages/Auth/SetNewPassword";
import ProductList from "./pages/Marketplace/ProductList";
import LandDetails from "./pages/Lands/LandDetails";
import Checkout from "./pages/Marketplace/Checkout";
import Portfolio from "./pages/Portfolio/Portfolio";
import Wallet from "./pages/Wallet/Wallet";
import Withdraw from "./pages/Portfolio/Withdraw";
import Lands from "./pages/Lands/LandList";
import NotificationsPage from "./pages/NotificationsPage";

import CreateLand from "./pages/Admin/CreateLand";
import EditLand from "./pages/Admin/EditLand";
import AdminLands from "./pages/Admin/Land";
import AdminGuard from "./components/AdminGuard";

// ------------------------------------------------------------
// Axios interceptors with React Router
// ------------------------------------------------------------
function ApiInterceptorWrapper({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    setupApiInterceptors(navigate);
  }, [navigate]);

  return children;
}

// ------------------------------------------------------------
// Animated Routes Component
// ------------------------------------------------------------
function AnimatedRoutes() {
  const location = useLocation();

  // Hide header/footer on auth pages
  const hideHeaderFooter = [
    "/login",
    "/register",
    "/verify-email",
    "/forgot-password",
    "/reset-verify",
    "/set-new-password",
  ].includes(location.pathname);

  return (
    <>
      {!hideHeaderFooter && <Header />}

      <main
        className={`${
          !hideHeaderFooter ? "pt-20" : ""
        } min-h-screen px-6 bg-gray-50 dark:bg-gray-900 transition-colors`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <Routes location={location} key={location.pathname}>
              {/* Public Routes */}
              <Route path="/" element={<Splash />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/email-verified" element={<EmailVerified />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-verify" element={<ResetVerify />} />
              <Route path="/set-new-password" element={<SetNewPassword />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lands"
                element={
                  <ProtectedRoute>
                    <Lands />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/portfolio"
                element={
                  <ProtectedRoute>
                    <Portfolio />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/withdraw"
                element={
                  <ProtectedRoute>
                    <Withdraw />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wallet"
                element={
                  <ProtectedRoute>
                    <Wallet />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/marketplace"
                element={
                  <ProtectedRoute>
                    <ProductList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lands/:id"
                element={
                  <ProtectedRoute>
                    <LandDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/lands"
                element={
                  <ProtectedRoute>
                    <AdminGuard>
                      <AdminLands />
                    </AdminGuard>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/lands/create"
                element={
                  <ProtectedRoute>
                    <AdminGuard>
                      <CreateLand />
                    </AdminGuard>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/lands/:id/edit"
                element={
                  <ProtectedRoute>
                    <AdminGuard>
                      <EditLand />
                    </AdminGuard>
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route
                path="*"
                element={
                  <h1 className="text-center mt-20 text-xl text-gray-700">
                    404 – Page Not Found
                  </h1>
                }
              />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      {!hideHeaderFooter && <Footer />}
    </>
  );
}

// ------------------------------------------------------------
// Main App Entry
// ------------------------------------------------------------
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ApiInterceptorWrapper>
          <ScrollToTop />
          
          {/* Global Toast Container - react-hot-toast */}
          <Toaster
            position="top-center"
            reverseOrder={false}
            gutter={8}
            containerStyle={{
              top: 80, // Below header (header is at z-[9000] with height ~64px)
              zIndex: 99999, // Above everything
            }}
            toastOptions={{
              duration: 5000,
              style: {
                background: "#363636",
                color: "#fff",
                fontSize: "16px",
                fontWeight: "600",
                padding: "16px 24px",
                borderRadius: "12px",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
              },
              success: {
                duration: 5000,
                style: {
                  background: "#10b981",
                  color: "#fff",
                },
                iconTheme: {
                  primary: "#fff",
                  secondary: "#10b981",
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: "#ef4444",
                  color: "#fff",
                },
                iconTheme: {
                  primary: "#fff",
                  secondary: "#ef4444",
                },
              },
              loading: {
                style: {
                  background: "#3b82f6",
                  color: "#fff",
                },
                iconTheme: {
                  primary: "#fff",
                  secondary: "#3b82f6",
                },
              },
            }}
          />
          
          <AnimatedRoutes />
        </ApiInterceptorWrapper>
      </AuthProvider>
    </BrowserRouter>
  );
}