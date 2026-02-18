import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, Clock, XCircle, RefreshCw, Upload, X,
  User, Calendar, Phone, MapPin, CreditCard, Camera,
  ChevronRight, ChevronLeft, AlertCircle, Shield
} from "lucide-react";
import api from "../../utils/api";

/* ─── Google Fonts ─────────────────────────────────────────────── */
const FontLink = () => (
  <link
    href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap"
    rel="stylesheet"
  />
);

/* ─── Constants ─────────────────────────────────────────────────── */
const STEPS = ["Personal", "Address", "Identity", "Documents", "Review"];

const ID_TYPES = [
  { value: "nin",             label: "National Identity Number (NIN)" },
  { value: "drivers_license", label: "Driver's License" },
  { value: "voters_card",     label: "Voter's Card" },
  { value: "passport",        label: "International Passport" },
  { value: "bvn",             label: "Bank Verification Number (BVN)" },
];

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba",
  "Yobe","Zamfara",
];

/* ─── Status Banner ─────────────────────────────────────────────── */
function StatusBanner({ kyc, onResubmit }) {
  const configs = {
    pending: {
      icon: <Clock size={22} />,
      title: "Under Review",
      body: "Your documents are being reviewed. This usually takes 1–2 business days.",
      bg: "from-amber-950/60 to-amber-900/40",
      border: "border-amber-600/30",
      accent: "text-amber-400",
      dot: "bg-amber-400",
    },
    approved: {
      icon: <CheckCircle size={22} />,
      title: "Verified",
      body: "Your identity has been verified. You have full access to all platform features.",
      bg: "from-emerald-950/60 to-emerald-900/40",
      border: "border-emerald-600/30",
      accent: "text-emerald-400",
      dot: "bg-emerald-400",
    },
    rejected: {
      icon: <XCircle size={22} />,
      title: "Verification Failed",
      body: null,
      bg: "from-red-950/60 to-red-900/40",
      border: "border-red-600/30",
      accent: "text-red-400",
      dot: "bg-red-400",
    },
    resubmit: {
      icon: <RefreshCw size={22} />,
      title: "Resubmission Required",
      body: null,
      bg: "from-orange-950/60 to-orange-900/40",
      border: "border-orange-600/30",
      accent: "text-orange-400",
      dot: "bg-orange-400",
    },
  };

  const c = configs[kyc.status];
  if (!c) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border bg-gradient-to-br ${c.bg} ${c.border} p-6 mb-8`}
    >
      <div className="flex items-start gap-4">
        <div className={`mt-0.5 ${c.accent}`}>{c.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full animate-pulse ${c.dot}`} />
            <p className={`font-semibold text-sm tracking-wide uppercase ${c.accent}`}>
              {c.title}
            </p>
          </div>
          {c.body && <p className="text-slate-300 text-sm leading-relaxed">{c.body}</p>}
          {kyc.rejection_reason && (
            <p className="text-slate-300 text-sm leading-relaxed">
              <span className="text-slate-400">Reason: </span>{kyc.rejection_reason}
            </p>
          )}
          {(kyc.status === "rejected" || kyc.status === "resubmit") && (
            <button
              onClick={onResubmit}
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 transition-colors px-4 py-1.5 rounded-lg"
            >
              <RefreshCw size={14} />
              Submit Again
            </button>
          )}
          {kyc.submission_date && (
            <p className="text-slate-500 text-xs mt-3">
              Submitted {new Date(kyc.submission_date).toLocaleDateString("en-NG", {
                day: "numeric", month: "long", year: "numeric"
              })}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── File Drop Zone ─────────────────────────────────────────────── */
function FileDropZone({ label, sublabel, name, required = false, value, onChange }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);
  const preview = value ? URL.createObjectURL(value) : null;

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) onChange(name, file);
  };

  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {sublabel && <p className="text-slate-500 text-xs mb-3">{sublabel}</p>}

      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-700 group">
          <img src={preview} alt="preview" className="w-full h-44 object-cover" />
          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={() => onChange(name, null)}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl h-44 flex flex-col items-center justify-center
            cursor-pointer transition-all select-none
            ${dragging
              ? "border-amber-500 bg-amber-500/10"
              : "border-slate-700 hover:border-slate-500 bg-slate-800/40 hover:bg-slate-800/70"
            }
          `}
        >
          <Upload size={24} className="text-slate-500 mb-3" />
          <p className="text-slate-400 text-sm font-medium">Drop image here</p>
          <p className="text-slate-600 text-xs mt-1">or click to browse · JPG, PNG · max 5MB</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onChange(name, e.target.files[0] || null)}
          />
        </div>
      )}
    </div>
  );
}

/* ─── Field Component ────────────────────────────────────────────── */
function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle size={11} />{error}</p>}
    </div>
  );
}

const inputCls = "w-full bg-slate-800/60 border border-slate-700 text-slate-100 placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/30 transition-all";
const selectCls = inputCls + " appearance-none cursor-pointer";

/* ─── Step Progress Rail ─────────────────────────────────────────── */
function ProgressRail({ current }) {
  return (
    <div className="flex items-center mb-10">
      {STEPS.map((step, i) => {
        const done    = i < current;
        const active  = i === current;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <motion.div
                animate={{
                  scale: active ? 1.1 : 1,
                  backgroundColor: done ? "#f59e0b" : active ? "#f59e0b" : "#1e293b",
                  borderColor: done || active ? "#f59e0b" : "#334155",
                }}
                transition={{ duration: 0.25 }}
                className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                style={{ color: done || active ? "#0f172a" : "#64748b" }}
              >
                {done ? <CheckCircle size={14} /> : i + 1}
              </motion.div>
              <span className={`text-xs mt-1.5 font-medium whitespace-nowrap ${active ? "text-amber-400" : done ? "text-slate-400" : "text-slate-600"}`}>
                {step}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px mx-2 mb-5 relative overflow-hidden bg-slate-800">
                <motion.div
                  className="h-full bg-amber-500"
                  animate={{ width: done ? "100%" : "0%" }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Review Row ─────────────────────────────────────────────────── */
function ReviewRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-slate-800 last:border-0">
      <span className="text-slate-500 text-sm">{label}</span>
      <span className="text-slate-200 text-sm font-medium text-right max-w-xs">{value}</span>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */
export default function KycVerification() {
  const [kycStatus, setKycStatus]   = useState(null);   
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [step, setStep]             = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors]         = useState({});

  const [form, setForm] = useState({
    full_name:     "",
    date_of_birth: "",
    phone_number:  "",
    address:       "",
    city:          "",
    state:         "",
    country:       "Nigeria",
    id_type:       "",
    id_number:     "",
    id_front:      null,
    id_back:       null,
    selfie:        null,
  });

  /* Fetch status */
  useEffect(() => {
    api.get("/kyc/status")
      .then(({ data }) => {
        setKycStatus(data.data);
        // Show form immediately if not_submitted or force resubmit
        if (data.data.status === "not_submitted") setShowForm(true);
      })
      .catch(() => setKycStatus({ status: "not_submitted", is_verified: false }))
      .finally(() => setLoadingStatus(false));
  }, []);

  const setField  = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const setFile   = (k, f) => setForm((p) => ({ ...p, [k]: f }));

  /* Per-step validation */
  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.full_name.trim())     e.full_name     = "Full name is required";
      if (!form.date_of_birth)        e.date_of_birth = "Date of birth is required";
      if (!form.phone_number.trim())  e.phone_number  = "Phone number is required";
    }
    if (step === 1) {
      if (!form.address.trim()) e.address = "Address is required";
      if (!form.city.trim())    e.city    = "City is required";
      if (!form.state)          e.state   = "State is required";
    }
    if (step === 2) {
      if (!form.id_type)              e.id_type   = "Please select an ID type";
      if (!form.id_number.trim())     e.id_number = "ID number is required";
    }
    if (step === 3) {
      if (!form.id_front) e.id_front = "Front of ID is required";
      if (!form.selfie)   e.selfie   = "Selfie photo is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => { if (validateStep()) setStep((s) => s + 1); };
  const prevStep = () => { setStep((s) => s - 1); setErrors({}); };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== null && v !== "") fd.append(k, v);
    });

    try {
      await api.post("/kyc/submit", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setKycStatus({ status: "pending", submission_date: new Date().toISOString() });
      setShowForm(false);
    } catch (err) {
      const msg = err.response?.data?.message || "Submission failed. Please try again.";
      const serverErrors = err.response?.data?.errors || {};
      setSubmitError(msg);
      // Map server errors back to steps
      setErrors(Object.fromEntries(
        Object.entries(serverErrors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
      ));
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Render ── */
  if (loadingStatus) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const idTypeLabel = ID_TYPES.find(t => t.value === form.id_type)?.label || "—";

  return (
    <>
      <FontLink />
      <div className="min-h-screen bg-slate-950 text-slate-100" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* Subtle grid background */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(#f59e0b 1px, transparent 1px), linear-gradient(90deg, #f59e0b 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative max-w-2xl mx-auto px-4 py-12">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Shield size={18} className="text-amber-400" />
              </div>
              <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest">Identity Verification</p>
            </div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-4xl text-slate-100 leading-tight">
              Verify Your Identity
            </h1>
            <p className="text-slate-400 mt-2 text-sm leading-relaxed max-w-md">
              Complete KYC verification to unlock all features including withdrawals and higher investment limits.
            </p>
          </motion.div>

          {/* Status banner for non-form states */}
          {kycStatus && kycStatus.status !== "not_submitted" && (
            <StatusBanner
              kyc={kycStatus}
              onResubmit={() => { setShowForm(true); setStep(0); }}
            />
          )}

          {/* KYC Form */}
          <AnimatePresence mode="wait">
            {showForm && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-slate-900/70 backdrop-blur border border-slate-800 rounded-2xl p-8"
              >
                <ProgressRail current={step} />

                <AnimatePresence mode="wait">

                  {/* ── Step 0: Personal ── */}
                  {step === 0 && (
                    <motion.div key="s0" {...stepAnim} className="space-y-5">
                      <StepHeader icon={<User size={16} />} title="Personal Information" />
                      <Field label="Full Legal Name" required error={errors.full_name}>
                        <input className={inputCls} placeholder="As it appears on your ID"
                          value={form.full_name}
                          onChange={e => setField("full_name", e.target.value)} />
                      </Field>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Date of Birth" required error={errors.date_of_birth}>
                          <input type="date" className={inputCls}
                            max={new Date().toISOString().split("T")[0]}
                            value={form.date_of_birth}
                            onChange={e => setField("date_of_birth", e.target.value)} />
                        </Field>
                        <Field label="Phone Number" required error={errors.phone_number}>
                          <input className={inputCls} placeholder="+234 800 000 0000"
                            value={form.phone_number}
                            onChange={e => setField("phone_number", e.target.value)} />
                        </Field>
                      </div>
                    </motion.div>
                  )}

                  {/* ── Step 1: Address ── */}
                  {step === 1 && (
                    <motion.div key="s1" {...stepAnim} className="space-y-5">
                      <StepHeader icon={<MapPin size={16} />} title="Residential Address" />
                      <Field label="Street Address" required error={errors.address}>
                        <textarea className={inputCls + " resize-none h-20"} placeholder="House number, street name, landmark"
                          value={form.address}
                          onChange={e => setField("address", e.target.value)} />
                      </Field>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="City" required error={errors.city}>
                          <input className={inputCls} placeholder="e.g. Lagos"
                            value={form.city}
                            onChange={e => setField("city", e.target.value)} />
                        </Field>
                        <Field label="State" required error={errors.state}>
                          <select className={selectCls} value={form.state}
                            onChange={e => setField("state", e.target.value)}>
                            <option value="">Select state</option>
                            {NIGERIAN_STATES.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </Field>
                      </div>
                      <Field label="Country">
                        <input className={inputCls} value={form.country} readOnly
                          style={{ opacity: 0.5, cursor: "not-allowed" }} />
                      </Field>
                    </motion.div>
                  )}

                  {/* ── Step 2: Identity ── */}
                  {step === 2 && (
                    <motion.div key="s2" {...stepAnim} className="space-y-5">
                      <StepHeader icon={<CreditCard size={16} />} title="Identity Document" />
                      <Field label="Document Type" required error={errors.id_type}>
                        <select className={selectCls} value={form.id_type}
                          onChange={e => setField("id_type", e.target.value)}>
                          <option value="">Select document type</option>
                          {ID_TYPES.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Document Number" required error={errors.id_number}>
                        <input className={inputCls} placeholder="Enter your document number"
                          value={form.id_number}
                          onChange={e => setField("id_number", e.target.value)} />
                      </Field>
                      {form.id_type && (
                        <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                          <AlertCircle size={15} className="text-amber-400 mt-0.5 shrink-0" />
                          <p className="text-amber-300/80 text-xs leading-relaxed">
                            Ensure the number matches exactly what is printed on your {idTypeLabel.toLowerCase()}.
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* ── Step 3: Documents ── */}
                  {step === 3 && (
                    <motion.div key="s3" {...stepAnim} className="space-y-6">
                      <StepHeader icon={<Camera size={16} />} title="Upload Documents" />

                      <FileDropZone
                        label="ID Front" sublabel="Clear photo of the front of your document"
                        name="id_front" required value={form.id_front} onChange={setFile}
                      />
                      {errors.id_front && (
                        <p className="text-red-400 text-xs -mt-4 flex items-center gap-1">
                          <AlertCircle size={11} />{errors.id_front}
                        </p>
                      )}

                      <FileDropZone
                        label="ID Back" sublabel="Back of your document (if applicable)"
                        name="id_back" value={form.id_back} onChange={setFile}
                      />

                      <FileDropZone
                        label="Selfie" sublabel="A clear photo of your face — no glasses, good lighting"
                        name="selfie" required value={form.selfie} onChange={setFile}
                      />
                      {errors.selfie && (
                        <p className="text-red-400 text-xs -mt-4 flex items-center gap-1">
                          <AlertCircle size={11} />{errors.selfie}
                        </p>
                      )}
                    </motion.div>
                  )}

                  {/* ── Step 4: Review ── */}
                  {step === 4 && (
                    <motion.div key="s4" {...stepAnim} className="space-y-6">
                      <StepHeader icon={<CheckCircle size={16} />} title="Review & Submit" />

                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Personal</p>
                        <ReviewRow label="Full Name" value={form.full_name} />
                        <ReviewRow label="Date of Birth" value={form.date_of_birth} />
                        <ReviewRow label="Phone" value={form.phone_number} />
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Address</p>
                        <ReviewRow label="Street" value={form.address} />
                        <ReviewRow label="City" value={form.city} />
                        <ReviewRow label="State" value={form.state} />
                        <ReviewRow label="Country" value={form.country} />
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Identity</p>
                        <ReviewRow label="Document Type" value={idTypeLabel} />
                        <ReviewRow label="Document Number" value={form.id_number} />
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Documents</p>
                        <ReviewRow label="ID Front"  value={form.id_front?.name || "—"} />
                        <ReviewRow label="ID Back"   value={form.id_back?.name  || "Not provided"} />
                        <ReviewRow label="Selfie"    value={form.selfie?.name   || "—"} />
                      </div>

                      {submitError && (
                        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                          <XCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
                          <p className="text-red-300 text-sm">{submitError}</p>
                        </div>
                      )}

                      <p className="text-slate-500 text-xs leading-relaxed">
                        By submitting, you confirm that all information provided is accurate and that the documents belong to you. False submissions may result in account suspension.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
                  {step > 0 ? (
                    <button
                      type="button"
                      onClick={prevStep}
                      disabled={submitting}
                      className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors"
                    >
                      <ChevronLeft size={16} /> Back
                    </button>
                  ) : (
                    <div />
                  )}

                  {step < STEPS.length - 1 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm px-6 py-2.5 rounded-xl transition-all active:scale-95"
                    >
                      Continue <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-semibold text-sm px-6 py-2.5 rounded-xl transition-all active:scale-95"
                    >
                      {submitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                            className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full"
                          />
                          Submitting…
                        </>
                      ) : (
                        <>
                          <Shield size={15} /> Submit Verification
                        </>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Approved state — no form shown */}
          {kycStatus?.status === "approved" && !showForm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 text-center py-8"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
                <CheckCircle size={28} className="text-emerald-400" />
              </div>
              <p style={{ fontFamily: "'DM Serif Display', serif" }} className="text-2xl text-slate-100 mb-2">
                You're Verified
              </p>
              <p className="text-slate-500 text-sm">
                Verified on{" "}
                {kycStatus.verified_at
                  ? new Date(kycStatus.verified_at).toLocaleDateString("en-NG", {
                      day: "numeric", month: "long", year: "numeric",
                    })
                  : "—"}
              </p>
            </motion.div>
          )}

        </div>
      </div>
    </>
  );
}

/* ─── Helpers ───────────────────────────────────────────────────── */
const stepAnim = {
  initial:    { opacity: 0, x: 20 },
  animate:    { opacity: 1, x: 0 },
  exit:       { opacity: 0, x: -20 },
  transition: { duration: 0.22 },
};

function StepHeader({ icon, title }) {
  return (
    <div className="flex items-center gap-2.5 mb-2 pb-4 border-b border-slate-800">
      <span className="text-amber-400">{icon}</span>
      <h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-xl text-slate-100">
        {title}
      </h2>
    </div>
  );
}