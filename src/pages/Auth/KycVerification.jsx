import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, Clock, XCircle, RefreshCw, Upload, X,
  User, MapPin, CreditCard, Camera,
  ChevronRight, ChevronLeft, AlertCircle, Shield,
  Eye, Smile, ArrowLeft, ArrowRight, RotateCcw, Video, VideoOff
} from "lucide-react";
import api from "../../utils/api";

/* ─── Fonts ──────────────────────────────────────────────────────── */
const FontLink = () => (
  <link
    href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Lato:wght@300;400;500;700&display=swap"
    rel="stylesheet"
  />
);

/* ─── Constants ──────────────────────────────────────────────────── */
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

const LIVENESS_PROMPTS = [
  { text: "Blink slowly twice",   icon: "eye",   duration: 5 },
  { text: "Smile naturally",      icon: "smile", duration: 5 },
  { text: "Turn your head left",  icon: "left",  duration: 5 },
  { text: "Turn your head right", icon: "right", duration: 5 },
  { text: "Nod your head gently", icon: "nod",   duration: 5 },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ─── Styles ─────────────────────────────────────────────────────── */
const inputCls = [
  "w-full bg-white border border-stone-200 text-stone-800",
  "placeholder-stone-400 rounded-xl px-4 py-3 text-sm",
  "focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20",
  "transition-all shadow-sm",
].join(" ");

const selectCls = inputCls + " appearance-none cursor-pointer";

/* ─── Prompt Icon ────────────────────────────────────────────────── */
function PromptIcon({ icon, size = 20 }) {
  const cls = "text-amber-600";
  if (icon === "eye")   return <Eye size={size} className={cls} />;
  if (icon === "smile") return <Smile size={size} className={cls} />;
  if (icon === "left")  return <ArrowLeft size={size} className={cls} />;
  if (icon === "right") return <ArrowRight size={size} className={cls} />;
  if (icon === "nod")   return <span className={cls} style={{ fontSize: size * 0.85, lineHeight: 1 }}>↕</span>;
  return null;
}

/* ─── Liveness Check ─────────────────────────────────────────────── */
function LivenessCheck({ onCapture, captured, onRetake }) {
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const streamRef  = useRef(null);
  const timerRef   = useRef(null);

  const [phase, setPhase]         = useState("idle");
  // idle | requesting | active | countdown | done | error
  const [prompts, setPrompts]     = useState([]);
  const [promptIdx, setPromptIdx] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [errorMsg, setErrorMsg]   = useState("");

  const currentPrompt = prompts[promptIdx];

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    clearInterval(timerRef.current);
  }, []);

  useEffect(() => () => stopStream(), [stopStream]);

  const startCamera = useCallback(async () => {
    setPhase("requesting");
    setErrorMsg("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      const chosen = shuffle(LIVENESS_PROMPTS).slice(0, 2);
      setPrompts(chosen);
      setPromptIdx(0);
      setPhase("active");
    } catch (err) {
      setErrorMsg(
        err.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access and try again."
          : "Could not access camera. Please ensure it is connected and try again."
      );
      setPhase("error");
    }
  }, []);

  const captureFrame = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (promptIdx < prompts.length - 1) {
      setPromptIdx(i => i + 1);
      setPhase("active");
    } else {
      canvas.toBlob(blob => {
        if (!blob) { setPhase("error"); setErrorMsg("Failed to capture image."); return; }
        const file = new File([blob], "liveness_selfie.jpg", { type: "image/jpeg" });
        stopStream();
        setPhase("done");
        onCapture(file);
      }, "image/jpeg", 0.92);
    }
  }, [promptIdx, prompts.length, stopStream, onCapture]);

  const beginCountdown = useCallback(() => {
    if (!currentPrompt) return;
    setPhase("countdown");
    setCountdown(currentPrompt.duration);

    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          captureFrame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [currentPrompt, captureFrame]);

  /* Captured state */
  if (captured) {
    const url = URL.createObjectURL(captured);
    return (
      <div className="space-y-3">
        <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-300 shadow-md group">
          <img src={url} alt="liveness" className="w-full h-52 object-cover" style={{ transform: "scaleX(-1)" }} />
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
            <CheckCircle size={11} /> Liveness verified
          </div>
        </div>
        <button type="button" onClick={onRetake}
          className="flex items-center gap-2 text-sm text-stone-400 hover:text-amber-600 font-semibold transition-colors">
          <RotateCcw size={13} /> Retake
        </button>
      </div>
    );
  }

  const isVideo = phase === "active" || phase === "countdown";

  return (
    <div className="space-y-4">
      {/* Camera viewport */}
      <div className="relative rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-inner"
        style={{ aspectRatio: "4/3" }}>

        <video
          ref={videoRef}
          playsInline muted
          className="w-full h-full object-cover"
          style={{ transform: "scaleX(-1)", display: isVideo ? "block" : "none" }}
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Oval guide */}
        {isVideo && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
              <defs>
                <mask id="face-cut">
                  <rect width="400" height="300" fill="white" />
                  <ellipse cx="200" cy="148" rx="98" ry="126" fill="black" />
                </mask>
              </defs>
              <rect width="400" height="300" fill="rgba(0,0,0,0.35)" mask="url(#face-cut)" />
              <ellipse cx="200" cy="148" rx="98" ry="126"
                fill="none"
                stroke={phase === "countdown" ? "#f59e0b" : "rgba(255,255,255,0.6)"}
                strokeWidth="2.5"
                strokeDasharray={phase === "countdown" ? "10 4" : "0"}
              />
            </svg>
          </div>
        )}

        {/* Countdown circle */}
        {phase === "countdown" && (
          <div className="absolute top-3 right-3 w-12 h-12 flex items-center justify-center">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" />
              <motion.circle cx="24" cy="24" r="20" fill="none" stroke="#f59e0b" strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 20}`}
                animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - countdown / (currentPrompt?.duration || 5)) }}
                transition={{ duration: 0.9, ease: "linear" }}
              />
            </svg>
            <span className="text-white font-bold text-sm z-10 relative">{countdown}</span>
          </div>
        )}

        {/* Idle placeholder */}
        {(phase === "idle" || phase === "requesting") && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-stone-200 shadow flex items-center justify-center">
              {phase === "requesting"
                ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full" />
                : <Video size={26} className="text-stone-400" />
              }
            </div>
            <p className="text-stone-500 text-sm font-medium">
              {phase === "requesting" ? "Starting camera…" : "Camera ready"}
            </p>
          </div>
        )}

        {/* Error state */}
        {phase === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <VideoOff size={26} className="text-red-400" />
            <p className="text-red-500 text-sm leading-relaxed">{errorMsg}</p>
          </div>
        )}
      </div>

      {/* Prompt card */}
      <AnimatePresence mode="wait">
        {isVideo && currentPrompt && (
          <motion.div
            key={`${promptIdx}-${phase}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-amber-200 shadow-sm flex items-center justify-center shrink-0">
              <PromptIcon icon={currentPrompt.icon} size={17} />
            </div>
            <div>
              <p className="text-xs text-amber-600 font-bold uppercase tracking-wider mb-0.5">
                Step {promptIdx + 1} of {prompts.length}
              </p>
              <p className="text-stone-800 font-semibold text-base leading-snug">{currentPrompt.text}</p>
              <p className="text-stone-400 text-xs mt-0.5">
                {phase === "active" ? "Press \"I'm Ready\" when set" : "Hold still, capturing…"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      {phase === "idle" && (
        <button type="button" onClick={startCamera}
          className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold text-sm px-5 py-3 rounded-xl transition-all active:scale-95 shadow-sm">
          <Camera size={16} /> Start Liveness Check
        </button>
      )}
      {phase === "active" && (
        <button type="button" onClick={beginCountdown}
          className="w-full flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-700 text-white font-bold text-sm px-5 py-3 rounded-xl transition-all active:scale-95 shadow-sm">
          I'm Ready
        </button>
      )}
      {phase === "error" && (
        <button type="button" onClick={startCamera}
          className="w-full flex items-center justify-center gap-2 bg-stone-700 hover:bg-stone-600 text-white font-bold text-sm px-5 py-3 rounded-xl transition-all">
          <RotateCcw size={14} /> Try Again
        </button>
      )}
      {phase === "countdown" && (
        <div className="w-full flex items-center justify-center gap-2 bg-stone-100 text-stone-400 font-medium text-sm px-5 py-3 rounded-xl select-none">
          Capturing…
        </div>
      )}

      {phase === "idle" && (
        <p className="text-stone-400 text-xs leading-relaxed text-center">
          Your camera is used only for identity verification. No video is recorded — only a single captured frame is submitted.
        </p>
      )}
    </div>
  );
}

/* ─── Status Banner ──────────────────────────────────────────────── */
function StatusBanner({ kyc, onResubmit }) {
  const cfg = {
    pending:  { icon: <Clock size={20} />,     title: "Under Review",         body: "Your documents are being reviewed. This typically takes 1–2 business days.", bg: "bg-amber-50",   border: "border-amber-200",   accent: "text-amber-700",   dot: "bg-amber-500"  },
    approved: { icon: <CheckCircle size={20} />,title: "Verified",             body: "Identity verified. You have full access to all platform features.",           bg: "bg-emerald-50", border: "border-emerald-200", accent: "text-emerald-700", dot: "bg-emerald-500"},
    rejected: { icon: <XCircle size={20} />,   title: "Verification Failed",  body: null,                                                                           bg: "bg-red-50",    border: "border-red-200",     accent: "text-red-700",     dot: "bg-red-500"    },
    resubmit: { icon: <RefreshCw size={20} />, title: "Resubmission Required",body: null,                                                                           bg: "bg-orange-50", border: "border-orange-200",  accent: "text-orange-700",  dot: "bg-orange-500" },
  };
  const c = cfg[kyc.status];
  if (!c) return null;

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border ${c.bg} ${c.border} p-5 mb-8 shadow-sm`}>
      <div className="flex items-start gap-4">
        <div className={`mt-0.5 ${c.accent}`}>{c.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full animate-pulse ${c.dot}`} />
            <p className={`font-bold text-sm tracking-wide uppercase ${c.accent}`}>{c.title}</p>
          </div>
          {c.body && <p className="text-stone-600 text-sm leading-relaxed">{c.body}</p>}
          {kyc.rejection_reason && (
            <p className="text-stone-600 text-sm leading-relaxed">
              <span className="text-stone-400">Reason: </span>{kyc.rejection_reason}
            </p>
          )}
          {(kyc.status === "rejected" || kyc.status === "resubmit") && (
            <button onClick={onResubmit}
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-white bg-stone-800 hover:bg-stone-700 transition-colors px-4 py-1.5 rounded-lg">
              <RefreshCw size={13} /> Submit Again
            </button>
          )}
          {kyc.submission_date && (
            <p className="text-stone-400 text-xs mt-3">
              Submitted {new Date(kyc.submission_date).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── File Drop Zone ─────────────────────────────────────────────── */
function FileDropZone({ label, sublabel, name, required = false, value, onChange }) {
  const inputRef  = useRef();
  const [drag, setDrag] = useState(false);
  const preview   = value ? URL.createObjectURL(value) : null;

  const onDrop = (e) => {
    e.preventDefault(); setDrag(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) onChange(name, file);
  };

  return (
    <div>
      <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {sublabel && <p className="text-stone-400 text-xs mb-3">{sublabel}</p>}
      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-stone-200 group shadow-sm">
          <img src={preview} alt="preview" className="w-full h-44 object-cover" />
          <div className="absolute inset-0 bg-stone-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button type="button" onClick={() => onChange(name, null)}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2">
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl h-44 flex flex-col items-center justify-center cursor-pointer select-none transition-all
            ${drag ? "border-amber-400 bg-amber-50" : "border-stone-200 hover:border-stone-300 bg-stone-50 hover:bg-white"}`}
        >
          <Upload size={22} className="text-stone-300 mb-3" />
          <p className="text-stone-500 text-sm font-medium">Drop image here</p>
          <p className="text-stone-400 text-xs mt-1">or click to browse · JPG, PNG · max 5MB</p>
          <input ref={inputRef} type="file" accept="image/*" className="hidden"
            onChange={e => onChange(name, e.target.files[0] || null)} />
        </div>
      )}
    </div>
  );
}

/* ─── Field ──────────────────────────────────────────────────────── */
function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle size={11} />{error}</p>}
    </div>
  );
}

/* ─── Progress Rail ──────────────────────────────────────────────── */
function ProgressRail({ current }) {
  return (
    <div className="flex items-center mb-10">
      {STEPS.map((step, i) => {
        const done = i < current, active = i === current;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <motion.div
                animate={{
                  backgroundColor: done ? "#f59e0b" : active ? "#fff" : "#f5f5f4",
                  borderColor: done || active ? "#f59e0b" : "#d6d3d1",
                  scale: active ? 1.1 : 1,
                }}
                transition={{ duration: 0.25 }}
                className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold shadow-sm"
                style={{ color: done ? "#fff" : active ? "#f59e0b" : "#a8a29e" }}
              >
                {done ? <CheckCircle size={14} /> : i + 1}
              </motion.div>
              <span className={`text-xs mt-1.5 font-semibold whitespace-nowrap
                ${active ? "text-amber-600" : done ? "text-stone-500" : "text-stone-300"}`}>{step}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 mb-5 bg-stone-200 rounded-full overflow-hidden">
                <motion.div className="h-full bg-amber-400 rounded-full"
                  animate={{ width: done ? "100%" : "0%" }} transition={{ duration: 0.4 }} />
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
    <div className="flex justify-between items-start py-2.5 border-b border-stone-100 last:border-0">
      <span className="text-stone-400 text-sm">{label}</span>
      <span className="text-stone-700 text-sm font-semibold text-right max-w-[60%]">{value}</span>
    </div>
  );
}

/* ─── Step Header ────────────────────────────────────────────────── */
function StepHeader({ icon, title }) {
  return (
    <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-stone-100">
      <span className="text-amber-500">{icon}</span>
      <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl text-stone-800 font-semibold">
        {title}
      </h2>
    </div>
  );
}

const stepAnim = {
  initial: { opacity: 0, x: 18 }, animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -18 }, transition: { duration: 0.22 },
};

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function KycVerification() {
  const [kycStatus, setKycStatus]         = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [showForm, setShowForm]           = useState(false);
  const [step, setStep]                   = useState(0);
  const [submitting, setSubmitting]       = useState(false);
  const [submitError, setSubmitError]     = useState("");
  const [errors, setErrors]               = useState({});

  const [form, setForm] = useState({
    full_name: "", date_of_birth: "", phone_number: "",
    address: "", city: "", state: "", country: "Nigeria",
    id_type: "", id_number: "",
    id_front: null, id_back: null,
    selfie: null,   // filled by liveness capture
  });

  useEffect(() => {
    api.get("/kyc/status")
      .then(({ data }) => {
        setKycStatus(data.data);
        if (data.data.status === "not_submitted") setShowForm(true);
      })
      .catch(() => setKycStatus({ status: "not_submitted", is_verified: false }))
      .finally(() => setLoadingStatus(false));
  }, []);

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setFile  = (k, f) => setForm(p => ({ ...p, [k]: f }));

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.full_name.trim())    e.full_name     = "Full name is required";
      if (!form.date_of_birth)       e.date_of_birth = "Date of birth is required";
      if (!form.phone_number.trim()) e.phone_number  = "Phone number is required";
    }
    if (step === 1) {
      if (!form.address.trim()) e.address = "Address is required";
      if (!form.city.trim())    e.city    = "City is required";
      if (!form.state)          e.state   = "State is required";
    }
    if (step === 2) {
      if (!form.id_type)          e.id_type   = "Please select an ID type";
      if (!form.id_number.trim()) e.id_number = "ID number is required";
    }
    if (step === 3) {
      if (!form.id_front) e.id_front = "Front of ID is required";
      if (!form.selfie)   e.selfie   = "Please complete the liveness check";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => { if (validateStep()) setStep(s => s + 1); };
  const prevStep = () => { setStep(s => s - 1); setErrors({}); };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== "") fd.append(k, v); });
    try {
      await api.post("/kyc/submit", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setKycStatus({ status: "pending", submission_date: new Date().toISOString() });
      setShowForm(false);
    } catch (err) {
      const msg = err.response?.data?.message || "Submission failed. Please try again.";
      const serverErrors = err.response?.data?.errors || {};
      setSubmitError(msg);
      setErrors(Object.fromEntries(
        Object.entries(serverErrors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
      ));
    } finally {
      setSubmitting(false);
    }
  };

  const idTypeLabel = ID_TYPES.find(t => t.value === form.id_type)?.label || "—";

  if (loadingStatus) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <FontLink />
      <div className="min-h-screen bg-stone-50 text-stone-800" style={{ fontFamily: "'Lato', sans-serif" }}>

        {/* Dot texture */}
        <div className="fixed inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, #d6d3d1 1px, transparent 1px)", backgroundSize: "28px 28px", opacity: 0.45 }} />

        {/* Amber top bar */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 z-50" />

        <div className="relative max-w-2xl mx-auto px-4 py-14">

          {/* Page header */}
          <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 shadow-sm flex items-center justify-center">
                <Shield size={18} className="text-amber-600" />
              </div>
              <p className="text-amber-600 text-xs font-bold uppercase tracking-widest">Identity Verification</p>
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-4xl text-stone-800 leading-tight">
              Verify Your Identity
            </h1>
            <p className="text-stone-500 mt-2 text-sm leading-relaxed max-w-md">
              Complete KYC verification to unlock withdrawals, higher investment limits, and full platform access.
            </p>
          </motion.div>

          {/* Status banner */}
          {kycStatus && kycStatus.status !== "not_submitted" && (
            <StatusBanner kyc={kycStatus} onResubmit={() => { setShowForm(true); setStep(0); }} />
          )}

          {/* Form card */}
          <AnimatePresence mode="wait">
            {showForm && (
              <motion.div key="form"
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl border border-stone-200 shadow-xl shadow-stone-200/60 p-8">

                <ProgressRail current={step} />

                <AnimatePresence mode="wait">

                  {/* Step 0 */}
                  {step === 0 && (
                    <motion.div key="s0" {...stepAnim} className="space-y-5">
                      <StepHeader icon={<User size={16} />} title="Personal Information" />
                      <Field label="Full Legal Name" required error={errors.full_name}>
                        <input className={inputCls} placeholder="As it appears on your ID"
                          value={form.full_name} onChange={e => setField("full_name", e.target.value)} />
                      </Field>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Date of Birth" required error={errors.date_of_birth}>
                          <input type="date" className={inputCls}
                            max={new Date().toISOString().split("T")[0]}
                            value={form.date_of_birth} onChange={e => setField("date_of_birth", e.target.value)} />
                        </Field>
                        <Field label="Phone Number" required error={errors.phone_number}>
                          <input className={inputCls} placeholder="+234 800 000 0000"
                            value={form.phone_number} onChange={e => setField("phone_number", e.target.value)} />
                        </Field>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 1 */}
                  {step === 1 && (
                    <motion.div key="s1" {...stepAnim} className="space-y-5">
                      <StepHeader icon={<MapPin size={16} />} title="Residential Address" />
                      <Field label="Street Address" required error={errors.address}>
                        <textarea className={inputCls + " resize-none h-20"}
                          placeholder="House number, street name, landmark"
                          value={form.address} onChange={e => setField("address", e.target.value)} />
                      </Field>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="City" required error={errors.city}>
                          <input className={inputCls} placeholder="e.g. Lagos"
                            value={form.city} onChange={e => setField("city", e.target.value)} />
                        </Field>
                        <Field label="State" required error={errors.state}>
                          <select className={selectCls} value={form.state}
                            onChange={e => setField("state", e.target.value)}>
                            <option value="">Select state</option>
                            {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </Field>
                      </div>
                      <Field label="Country">
                        <input className={inputCls} value={form.country} readOnly
                          style={{ opacity: 0.5, cursor: "not-allowed" }} />
                      </Field>
                    </motion.div>
                  )}

                  {/* Step 2 */}
                  {step === 2 && (
                    <motion.div key="s2" {...stepAnim} className="space-y-5">
                      <StepHeader icon={<CreditCard size={16} />} title="Identity Document" />
                      <Field label="Document Type" required error={errors.id_type}>
                        <select className={selectCls} value={form.id_type}
                          onChange={e => setField("id_type", e.target.value)}>
                          <option value="">Select document type</option>
                          {ID_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </Field>
                      <Field label="Document Number" required error={errors.id_number}>
                        <input className={inputCls} placeholder="Enter your document number"
                          value={form.id_number} onChange={e => setField("id_number", e.target.value)} />
                      </Field>
                      {form.id_type && (
                        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                          <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                          <p className="text-amber-700 text-xs leading-relaxed">
                            Ensure the number matches exactly what is printed on your {idTypeLabel.toLowerCase()}.
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 3 — Documents + Liveness */}
                  {step === 3 && (
                    <motion.div key="s3" {...stepAnim} className="space-y-6">
                      <StepHeader icon={<Camera size={16} />} title="Upload Documents" />

                      <FileDropZone label="ID Front" required sublabel="Clear photo of the front of your document"
                        name="id_front" value={form.id_front} onChange={setFile} />
                      {errors.id_front && (
                        <p className="text-red-500 text-xs -mt-3 flex items-center gap-1">
                          <AlertCircle size={11} />{errors.id_front}
                        </p>
                      )}

                      <FileDropZone label="ID Back" sublabel="Back of your document (if applicable)"
                        name="id_back" value={form.id_back} onChange={setFile} />

                      <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">
                          Liveness Check <span className="text-red-400">*</span>
                        </label>
                        <p className="text-stone-400 text-xs mb-3">
                          You'll be asked to perform 2 short actions to confirm you're a real person.
                          Only a single photo frame is captured — no video is stored.
                        </p>
                        <LivenessCheck
                          captured={form.selfie}
                          onCapture={file => setFile("selfie", file)}
                          onRetake={() => setFile("selfie", null)}
                        />
                        {errors.selfie && (
                          <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                            <AlertCircle size={11} />{errors.selfie}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4 — Review */}
                  {step === 4 && (
                    <motion.div key="s4" {...stepAnim} className="space-y-5">
                      <StepHeader icon={<CheckCircle size={16} />} title="Review & Submit" />

                      {[
                        { heading: "Personal",  rows: [["Full Name", form.full_name], ["Date of Birth", form.date_of_birth], ["Phone", form.phone_number]] },
                        { heading: "Address",   rows: [["Street", form.address], ["City", form.city], ["State", form.state], ["Country", form.country]] },
                        { heading: "Identity",  rows: [["Document Type", idTypeLabel], ["Document Number", form.id_number]] },
                        { heading: "Documents", rows: [["ID Front", form.id_front?.name], ["ID Back", form.id_back?.name || "Not provided"], ["Liveness Photo", form.selfie ? "✓ Captured" : "—"]] },
                      ].map(({ heading, rows }) => (
                        <div key={heading}>
                          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{heading}</p>
                          <div className="bg-stone-50 rounded-xl px-4 py-1 border border-stone-100">
                            {rows.map(([l, v]) => <ReviewRow key={l} label={l} value={v} />)}
                          </div>
                        </div>
                      ))}

                      {submitError && (
                        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                          <XCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                          <p className="text-red-600 text-sm">{submitError}</p>
                        </div>
                      )}

                      <p className="text-stone-400 text-xs leading-relaxed">
                        By submitting, you confirm all information is accurate and documents belong to you.
                        False submissions may result in account suspension.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-100">
                  {step > 0
                    ? <button type="button" onClick={prevStep} disabled={submitting}
                        className="flex items-center gap-2 text-stone-400 hover:text-stone-600 text-sm font-semibold transition-colors">
                        <ChevronLeft size={16} /> Back
                      </button>
                    : <div />
                  }
                  {step < STEPS.length - 1
                    ? <button type="button" onClick={nextStep}
                        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all active:scale-95 shadow-sm">
                        Continue <ChevronRight size={16} />
                      </button>
                    : <button type="button" onClick={handleSubmit} disabled={submitting}
                        className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all active:scale-95 shadow-sm">
                        {submitting
                          ? <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />Submitting…</>
                          : <><Shield size={14} /> Submit Verification</>
                        }
                      </button>
                  }
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Approved final state */}
          {kycStatus?.status === "approved" && !showForm && (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              className="mt-4 text-center py-10 bg-white rounded-3xl border border-stone-200 shadow-xl shadow-stone-200/60">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 mb-4">
                <CheckCircle size={28} className="text-emerald-500" />
              </div>
              <p style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl text-stone-800 mb-2">
                You're Verified
              </p>
              <p className="text-stone-400 text-sm">
                Verified on {kycStatus.verified_at
                  ? new Date(kycStatus.verified_at).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })
                  : "—"}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}