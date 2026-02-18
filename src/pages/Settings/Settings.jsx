import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  KeyRound, RotateCcw, UserCircle, Landmark, ShieldCheck,
  ChevronRight, ArrowLeft,
} from "lucide-react";
import { serif } from "./tokens";
import ProfileSettings from "./ProfileSettings";
import TransactionPin  from "./TransactionPin";
import ResetPin        from "./ResetPin";
import BankDetails     from "./BankDetails";
import KycPanel        from "./KycPanel";

// ─── Navigation config ────────────────────────────────────────────
const NAV = [
  { id: "profile", label: "Profile",         icon: UserCircle,  desc: "Name, email & password"  },
  { id: "pin",     label: "Transaction PIN", icon: KeyRound,    desc: "Set or update your PIN"  },
  { id: "reset",   label: "Reset PIN",       icon: RotateCcw,   desc: "Forgot your PIN?"        },
  { id: "bank",    label: "Bank Details",    icon: Landmark,    desc: "Payout account"          },
  { id: "kyc",     label: "Identity (KYC)",  icon: ShieldCheck, desc: "Verify your identity"    },
];

// ─── KYC status badge ─────────────────────────────────────────────
function KycBadge({ status }) {
  if (!status || status === "not_submitted") return null;
  const map = {
    pending:  { label: "Pending",  cls: "bg-amber-100 text-amber-700 border-amber-200"       },
    approved: { label: "Verified", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    rejected: { label: "Rejected", cls: "bg-red-100 text-red-700 border-red-200"             },
    resubmit: { label: "Action",   cls: "bg-orange-100 text-orange-700 border-orange-200"    },
  };
  const m = map[status];
  if (!m) return null;
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded-full leading-none shrink-0 ${m.cls}`}>
      {m.label}
    </span>
  );
}

// ─── Nav item ─────────────────────────────────────────────────────
function NavItem({ item, active, kycStatus, onClick }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 touch-manipulation ${
        active
          ? "bg-amber-50 border border-amber-200 shadow-sm"
          : "hover:bg-stone-100 active:bg-stone-100 border border-transparent"
      }`}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
        active ? "bg-amber-500 text-white" : "bg-stone-100 text-stone-500 group-hover:bg-stone-200"
      }`}>
        <Icon size={17} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-semibold leading-none ${active ? "text-amber-700" : "text-stone-700"}`}>
            {item.label}
          </span>
          {item.id === "kyc" && <KycBadge status={kycStatus} />}
        </div>
        <p className="text-xs text-stone-400 mt-1 truncate">{item.desc}</p>
      </div>
      <ChevronRight size={14} className={`shrink-0 ${active ? "text-amber-400" : "text-stone-300 group-hover:text-stone-400"}`} />
    </button>
  );
}

// ─── Desktop panel header ─────────────────────────────────────────
function PanelHeader({ item }) {
  const Icon = item.icon;
  return (
    <div className="mb-7 pb-5 border-b border-stone-100">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
          <Icon size={16} className="text-amber-600" />
        </div>
        <h2 className="text-xl text-stone-800 font-semibold" style={serif}>{item.label}</h2>
      </div>
      <p className="text-stone-400 text-sm mt-2 ml-12 leading-relaxed">{item.desc}</p>
    </div>
  );
}

// ─── Sidebar help widget ──────────────────────────────────────────
function HelpCard() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
      <p className="text-amber-800 text-xs font-bold mb-1">Need help?</p>
      <p className="text-amber-700 text-xs leading-relaxed">
        Contact support if you run into any issues with your account settings.
      </p>
    </div>
  );
}

// ─── Settings root ────────────────────────────────────────────────
export default function Settings() {
  const [activeTab, setActiveTab]   = useState("profile");
  const [kycStatus, setKycStatus]   = useState(null);
  const [mobilePanel, setMobilePanel] = useState(false);

  const activeNav = NAV.find((n) => n.id === activeTab);

  const selectTab = (id) => {
    setActiveTab(id);
    setMobilePanel(true);
  };

  const renderPanel = () => {
    switch (activeTab) {
      case "profile": return <ProfileSettings />;
      case "pin":     return <TransactionPin />;
      case "reset":   return <ResetPin />;
      case "bank":    return <BankDetails />;
      case "kyc":     return <KycPanel kycStatus={kycStatus} setKycStatus={setKycStatus} />;
      default:        return null;
    }
  };

  return (
    <div
      className="min-h-screen bg-stone-50 text-stone-800"
      style={{ fontFamily: "'Lato', 'Helvetica Neue', sans-serif" }}
    >
      {/* Subtle dot texture — desktop only for perf */}
      <div
        className="fixed inset-0 pointer-events-none hidden sm:block"
        style={{
          backgroundImage: "radial-gradient(circle, #d6d3d1 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.4,
        }}
      />

      {/* Amber top accent bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 z-50" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-28 sm:py-12">

        {/* ── Page heading ───────────────────────────────────── */}
        {/* Hidden on mobile when a panel is open */}
        <motion.div
          animate={{ opacity: mobilePanel ? 0 : 1, height: mobilePanel ? 0 : "auto" }}
          transition={{ duration: 0.15 }}
          className="overflow-hidden sm:!opacity-100 sm:!h-auto mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl text-stone-800 font-semibold" style={serif}>
            Account Settings
          </h1>
          <p className="text-stone-400 text-sm mt-1">
            Manage your profile, security, and verification
          </p>
        </motion.div>

        <div className="sm:flex sm:gap-6 sm:items-start">

          {/* ── Mobile: nav list ─────────────────────────────── */}
          <AnimatePresence>
            {!mobilePanel && (
              <motion.div
                key="mobile-nav"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18 }}
                className="sm:hidden space-y-2"
              >
                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-2 space-y-0.5">
                  {NAV.map((item) => (
                    <NavItem
                      key={item.id}
                      item={item}
                      active={activeTab === item.id}
                      kycStatus={kycStatus}
                      onClick={() => selectTab(item.id)}
                    />
                  ))}
                </div>
                <HelpCard />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Mobile: panel view ───────────────────────────── */}
          <AnimatePresence>
            {mobilePanel && (
              <motion.div
                key="mobile-panel"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.2 }}
                className="sm:hidden"
              >
                {/* Mobile panel header with back button */}
                <div className="flex items-center gap-3 mb-5">
                  <button
                    onClick={() => setMobilePanel(false)}
                    className="w-9 h-9 rounded-xl bg-white border border-stone-200 shadow-sm flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors touch-manipulation shrink-0"
                    aria-label="Back to settings menu"
                  >
                    <ArrowLeft size={16} />
                  </button>

                  {activeNav && (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                        <activeNav.icon size={14} className="text-amber-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-base font-semibold text-stone-800 leading-tight truncate" style={serif}>
                          {activeNav.label}
                        </h2>
                        <p className="text-stone-400 text-xs truncate">{activeNav.desc}</p>
                      </div>
                    </div>
                  )}

                  {activeTab === "kyc" && (
                    <KycBadge status={kycStatus} />
                  )}
                </div>

                {/* Panel card */}
                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
                  {renderPanel()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Desktop: sidebar ─────────────────────────────── */}
          <aside className="hidden sm:block w-60 shrink-0 sticky top-6 space-y-3">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-2 space-y-0.5">
              {NAV.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  active={activeTab === item.id}
                  kycStatus={kycStatus}
                  onClick={() => setActiveTab(item.id)}
                />
              ))}
            </div>
            <HelpCard />
          </aside>

          {/* ── Desktop: content panel ───────────────────────── */}
          <main className="hidden sm:block flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -14 }}
                  transition={{ duration: 0.18 }}
                  className="p-6 sm:p-8"
                >
                  {activeTab !== "kyc" && activeNav && (
                    <PanelHeader item={activeNav} />
                  )}
                  {renderPanel()}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}