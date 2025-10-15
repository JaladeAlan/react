import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

// Context
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Components
import Header from "./components/Header";
import Footer from "./components/Footer";

// General
import Splash from "./pages/Splash";
import Settings from "./pages/Settings/Settings";

// Auth
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Verify from "./pages/Auth/Verify";
import ForgotPassword from "./pages/Auth/ForgotPassword";

// Marketplace
import ProductList from "./pages/Marketplace/ProductList";
import ProductDetail from "./pages/Marketplace/ProductDetail";
import Checkout from "./pages/Marketplace/Checkout";

// Portfolio
import Portfolio from "./pages/Portfolio/Portfolio";
import Withdraw from "./pages/Portfolio/Withdraw";

function AppContent() {
  const location = useLocation();

  // Hide header/footer on auth pages
  const hideHeaderFooter = ["/login", "/register", "/verify", "/forgot-password"].includes(
    location.pathname
  );

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
              <Route path="/verify" element={<Verify />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Protected Routes */}
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
                path="/marketplace"
                element={
                  <ProtectedRoute>
                    <ProductList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/marketplace/:id"
                element={
                  <ProtectedRoute>
                    <ProductDetail />
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

              {/* Fallback for invalid routes */}
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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
