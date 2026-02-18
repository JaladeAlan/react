import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  KeyRound, RotateCcw, UserCircle, Landmark, ShieldCheck, ChevronRight,
} from "lucide-react";
import TransactionPin from "./TransactionPin";
import ResetPin from "./ResetPin";
import ProfileSettings from "./ProfileSettings";
import BankDetails from "./BankDetails";
import KycPanel from "./KycPanel";

const FontLink = () => (
  <link
    href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Lato:wght@300;400;500;700&display=swap"
    rel="stylesheet"
  />
);

const NAV = [
  { id: "profile", label: "Profile",         icon: UserCircle,  desc: "Name, email & password"  },
  { id: "pin",     label: "Transaction PIN", icon: KeyRound,    desc: "Set or update your PIN"  },
  { id: "reset",   label: "Reset PIN",       icon: RotateCcw,   desc: "Forgot your PIN?"        },
  { id: "bank",    label: "Bank Details",    icon: Landmark,    desc: "Payout account"          },
  { id: "kyc",     label: "Identity (KYC)",  icon: ShieldCheck, desc: "Verify your identity"    },
];

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
    <span className={`text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded-full leading-none ${m.cls}`}>
      {m.label}
    </span>
  );
}

function NavItem({ item, active, kycStatus, onClick }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 ${
        active ? "bg-amber-50 border border-amber-200 shadow-sm" : "hover:bg-stone-100 border border-transparent"
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
      <ChevronRight size={14} className={`shrink-0 ${
        active ? "text-amber-400" : "text-stone-300 group-hover:text-stone-400"
      }`} />
    </button>
  );
}

function PanelHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-8 pb-5 border-b border-stone-100">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
          <Icon size={17} className="text-amber-600" />
        </div>
        <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl font-semibold text-stone-800">
          {title}
        </h2>
      </div>
      {subtitle && <p className="text-stone-400 text-sm mt-2 ml-12">{subtitle}</p>}
    </div>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [kycStatus, setKycStatus] = useState(null); // lifted — keeps sidebar badge live
  const activeNav = NAV.find(n => n.id === activeTab);

  return (
    <>
      <FontLink />
      <div className="min-h-screen bg-stone-50 py-10 px-4" style={{ fontFamily: "'Lato', sans-serif" }}>

        {/* Dot texture */}
        <div className="fixed inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, #d6d3d1 1px, transparent 1px)", backgroundSize: "28px 28px", opacity: 0.4 }} />

        {/* Amber top bar */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 z-50" />

        <div className="relative max-w-5xl mx-auto">

          <div className="mb-8">
            <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-3xl text-stone-800">
              Account Settings
            </h1>
            <p className="text-stone-400 text-sm mt-1">Manage your profile, security, and verification</p>
          </div>

          <div className="flex gap-6 items-start">

            {/* Sidebar */}
            <aside className="w-60 shrink-0 sticky top-6 space-y-3">
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-2 space-y-0.5">
                {NAV.map(item => (
                  <NavItem
                    key={item.id}
                    item={item}
                    active={activeTab === item.id}
                    kycStatus={kycStatus}
                    onClick={() => setActiveTab(item.id)}
                  />
                ))}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="text-amber-800 text-xs font-bold mb-1">Need help?</p>
                <p className="text-amber-700 text-xs leading-relaxed">
                  Contact support if you run into issues with your account settings.
                </p>
              </div>
            </aside>

            {/* Content panel */}
            <main className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -14 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="p-8"
                  >
                    {/* KYC renders its own header; all others get the generic one */}
                    {activeTab !== "kyc" && activeNav && (
                      <PanelHeader icon={activeNav.icon} title={activeNav.label} subtitle={activeNav.desc} />
                    )}

                    {activeTab === "profile" && <ProfileSettings />}
                    {activeTab === "pin"     && <TransactionPin />}
                    {activeTab === "reset"   && <ResetPin />}
                    {activeTab === "bank"    && <BankDetails />}
                    {activeTab === "kyc"     && (
                      <KycPanel kycStatus={kycStatus} setKycStatus={setKycStatus} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </main>

          </div>
        </div>
      </div>
    </>
  );
}