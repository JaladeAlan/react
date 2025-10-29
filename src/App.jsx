import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Context & Routing
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";

// Layout
import Header from "./components/Header";
import Footer from "./components/Footer";

// Pages
import Splash from "./pages/Splash";
import Dashboard from "./pages/Dashboard";
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

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <AnimatedRoutes />
        {/* ✅ Toastify container */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="colored"
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
