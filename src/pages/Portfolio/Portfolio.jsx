import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import handleApiError from "../../utils/handleApiError";
import { toast } from "react-toastify";

export default function Portfolio() {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasPin, setHasPin] = useState(false);

  // Portfolio analytics
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [allocationData, setAllocationData] = useState([]);

  const [modal, setModal] = useState({
    type: null,
    land: null,
    units: "",
    pin: "",
    processing: false,
  });

  const navigate = useNavigate();
  const modalRef = useRef(null);

  /* ================================
     FETCH DATA
  ================================= */

  const fetchPortfolioAndUser = async () => {
    try {
      const [portfolioRes, userRes] = await Promise.all([
        api.get("/user/lands"),
        api.get("/me"),
      ]);

      const owned = (portfolioRes.data.owned_lands || []).filter(
        (l) => l.units_owned > 0
      );

      setLands(owned);
      setHasPin(!!userRes.data.user?.transaction_pin);
    } catch (err) {
      handleApiError(err);
    }
  };

  const fetchPortfolioAnalytics = async () => {
    try {
      const [
        summaryRes,
        chartRes,
        performanceRes,
        allocationRes,
      ] = await Promise.all([
        api.get("/portfolio/summary"),
        api.get("/portfolio/chart"),
        api.get("/portfolio/performance"),
        api.get("/portfolio/allocation"),
      ]);

      setSummary(summaryRes.data);
      setChartData(chartRes.data || []);
      setPerformanceData(performanceRes.data || []);
      setAllocationData(allocationRes.data || []);
    } catch (err) {
      handleApiError(err);
    }
  };

  useEffect(() => {
    Promise.all([
      fetchPortfolioAndUser(),
      fetchPortfolioAnalytics(),
    ]).finally(() => setLoading(false));
  }, []);

  /* ================================
     MODAL CONTROLS
  ================================= */

  const openModal = (type, land) => {
    if (!hasPin) {
      toast.warn("⚠️ Please create a transaction PIN before making transactions.");
      setTimeout(() => navigate("/settings"), 1500);
      return;
    }
    setModal({ type, land, units: "", pin: "", processing: false });
  };

  const closeModal = () => {
    setModal({ type: null, land: null, units: "", pin: "", processing: false });
  };

  /* ================================
     TRANSACTION HANDLER
  ================================= */

  const handleTransaction = async (e) => {
    e.preventDefault();

    const units = Number(modal.units);
    const pin = modal.pin.trim();

    if (!units || units <= 0) {
      toast.error("Enter a valid number of units.");
      return;
    }

    if (modal.type === "sell" && units > modal.land.units_owned) {
      toast.error("❌ You cannot sell more than you own.");
      return;
    }

    if (!pin || pin.length !== 4) {
      toast.error("Enter your 4-digit PIN.");
      return;
    }

    setModal((prev) => ({ ...prev, processing: true }));

    const endpoint =
      modal.type === "buy"
        ? `/lands/${modal.land.land_id}/purchase`
        : `/lands/${modal.land.land_id}/sell`;

    try {
      const res = await api.post(endpoint, {
        units,
        transaction_pin: pin,
      });

      toast.success(res.data.message || "Transaction successful");
      await fetchPortfolioAndUser();
      await fetchPortfolioAnalytics();
      closeModal();
    } catch (err) {
      if (err.response?.status === 429) {
        toast.error("Too many failed PIN attempts.");
      } else if (err.response?.status === 401) {
        toast.error(err.response.data.message || "Invalid PIN.");
      } else {
        handleApiError(err, (msg) => toast.error(msg));
      }
    } finally {
      setModal((prev) => ({ ...prev, processing: false }));
    }
  };

  /* ================================
     COMPUTED VALUES
  ================================= */

  const totalAmount = useMemo(() => {
    if (!modal.units || !modal.land) return 0;
    return Number(modal.units) * Number(modal.land.price_per_unit_kobo)/100;
  }, [modal.units, modal.land]);

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && modal.type && closeModal();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [modal.type]);

  if (loading)
    return <p className="text-center text-gray-500">Loading portfolio...</p>;

  /* ================================
     RENDER
  ================================= */

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Your Portfolio</h1>

      {/* SUMMARY CARDS */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            title="Portfolio Value"
            value={summary.total_portfolio_value_kobo}
          />
          <SummaryCard
            title="Current Investment"
            value={summary.total_invested_kobo}
          />
          <SummaryCard
            title="Profit / Loss"
            value={summary.profit_loss_kobo}
            highlight
          />
          <div className="p-4 bg-white rounded-xl shadow">
            <p className="text-sm text-gray-500">ROI</p>
            <p className="text-xl font-bold">
              {summary.profit_loss_percent}%
            </p>
          </div>
        </div>
      )}

      {/* LANDS */}
      {!lands.length ? (
        <p className="text-center text-gray-600">
          You haven’t purchased any lands yet.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {lands.map((land) => (
            <div
              key={land.land_id}
              className="p-5 border rounded-xl shadow bg-white"
            >
              <h2 className="font-semibold text-lg">{land.land_name}</h2>

              <Info label="Units Owned" value={land.units_owned} />
              <Info
                label="Price per Unit"
                value={`₦${Number((land.price_per_unit_kobo)/100).toLocaleString()}`}
              />
              <Info
                label="Current Value"
                value={`₦${Number(land.current_value).toLocaleString()}`}
                strong
                
              />

              <div className="flex gap-3 mt-4">
                <ActionBtn
                  text="Buy More"
                  color="green"
                  onClick={() => openModal("buy", land)}
                />
                <ActionBtn
                  text="Sell Units"
                  color="red"
                  onClick={() => openModal("sell", land)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {modal.type && modal.land && (
        <Modal
          modal={modal}
          closeModal={closeModal}
          handleTransaction={handleTransaction}
          totalAmount={totalAmount}
          setModal={setModal}
        />
      )}
    </div>
  );
}

/* ================================
   SMALL COMPONENTS
================================= */

const SummaryCard = ({ title, value, highlight }) => (
  <div className="p-4 bg-white rounded-xl shadow">
    <p className="text-sm text-gray-500">{title}</p>
    <p
      className={`text-xl font-bold ${
        highlight && value >= 0 ? "text-green-600" : highlight ? "text-red-600" : ""
      }`}
    >
      ₦{Number(value / 100).toLocaleString()}
    </p>
  </div>
);

const Info = ({ label, value, strong }) => (
  <p className="text-gray-600 mt-1">
    {label}:{" "}
    <span className={strong ? "font-semibold text-green-700" : "font-medium"}>
      {value}
    </span>
  </p>
);

const ActionBtn = ({ text, color, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-white bg-${color}-600 hover:bg-${color}-700`}
  >
    {text}
  </button>
);

/* Modal kept compact for clarity */
const Modal = ({ modal, closeModal, handleTransaction, totalAmount, setModal }) => (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl shadow w-full max-w-md">
      <h2 className="font-bold mb-4 capitalize">
        {modal.type} Units - {modal.land.land_name}
      </h2>

      <form onSubmit={handleTransaction} className="space-y-4">
        <input
          type="number"
          min={1}
          value={modal.units}
          onChange={(e) =>
            setModal((p) => ({ ...p, units: e.target.value }))
          }
          className="w-full border rounded p-2"
          placeholder="Units"
        />

        {totalAmount > 0 && (
          <p className="text-sm">
            {modal.type === "buy" ? "You’ll pay" : "You’ll receive"}: ₦
            {totalAmount.toLocaleString()}
          </p>
        )}

        <input
          type="password"
          maxLength={4}
          value={modal.pin}
          onChange={(e) =>
            setModal((p) => ({ ...p, pin: e.target.value.replace(/\D/g, "") }))
          }
          className="w-full border rounded p-2"
          placeholder="4-digit PIN"
        />

        <div className="flex justify-end gap-3">
          <button type="button" onClick={closeModal}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={modal.processing}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {modal.processing ? "Processing..." : "Confirm"}
          </button>
        </div>
      </form>
    </div>
  </div>
);
