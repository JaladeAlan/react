import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

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

  // Scroll to top on route change ✅
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Hide header/footer on auth routes
  const hideHeaderFooter = [
    "/login",
    "/register",
    "/verify",
    "/forgot-password",
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
              {/* General */}
              <Route path="/" element={<Splash />} />
              <Route path="/settings" element={<Settings />} />

              {/* Auth */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Marketplace */}
              <Route path="/marketplace" element={<ProductList />} />
              <Route path="/marketplace/:id" element={<ProductDetail />} />
              <Route path="/checkout" element={<Checkout />} />

              {/* Portfolio */}
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/withdraw" element={<Withdraw />} />

              {/* Fallback */}
              <Route
                path="*"
                element={
                  <h1 className="text-center mt-20 text-xl font-semibold text-gray-700">
                    404 - Page Not Found
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
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
