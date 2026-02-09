import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import handleApiError from "../../utils/handleApiError";
import { toast } from "react-toastify";

const ITEMS_PER_PAGE = 10;

export default function Portfolio() {
  const [lands, setLands] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasPin, setHasPin] = useState(false);
  const [summary, setSummary] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const [modal, setModal] = useState({
    type: null,
    land: null,
    units: "",
    pin: "",
    processing: false,
  });

  const navigate = useNavigate();
  const modalRef = useRef(null);

  /* ================= FETCH ================= */

  const fetchPortfolioAndUser = async () => {
    try {
      const [portfolioRes, userRes] = await Promise.all([
        api.get("/user/lands"),
        api.get("/me"),
      ]);

      setLands(
        (portfolioRes.data.owned_lands || []).filter(
          (l) => l.units_owned > 0
        )
      );

      setHasPin(!!userRes.data.user?.transaction_pin);
    } catch (err) {
      handleApiError(err);
    }
  };

  const fetchPortfolioAnalytics = async () => {
    try {
      const [summaryRes, txRes] = await Promise.all([
        api.get("/portfolio/summary"),
        api.get("/transactions/user"),
      ]);

      setSummary(summaryRes.data.data);
      setTransactions(txRes.data.data || []);
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

  /* ================= HELPERS ================= */

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return transactions.slice(start, start + ITEMS_PER_PAGE);
  }, [transactions, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [transactions]);

  /* ================= MODAL ================= */

  const openModal = (type, land) => {
    if (!hasPin) {
      toast.warn("Please create a transaction PIN first");
      setTimeout(() => navigate("/settings"), 1500);
      return;
    }
    setModal({ type, land, units: "", pin: "", processing: false });
  };

  const closeModal = () =>
    setModal({ type: null, land: null, units: "", pin: "", processing: false });

  /* ================= TRANSACTION ================= */

  const handleTransaction = async (e) => {
    e.preventDefault();

    const units = Number(modal.units);
    if (!units || units <= 0) return toast.error("Invalid units");

    if (modal.type === "sell" && units > modal.land.units_owned)
      return toast.error("Cannot sell more than owned");

    if (modal.pin.length !== 4)
      return toast.error("Enter 4-digit PIN");

    setModal((p) => ({ ...p, processing: true }));

    try {
      await api.post(
        modal.type === "buy"
          ? `/lands/${modal.land.land_id}/purchase`
          : `/lands/${modal.land.land_id}/sell`,
        { units, transaction_pin: modal.pin }
      );

      toast.success("Transaction successful");
      await fetchPortfolioAndUser();
      await fetchPortfolioAnalytics();
      closeModal();
    } catch (err) {
      handleApiError(err);
    } finally {
      setModal((p) => ({ ...p, processing: false }));
    }
  };

  const totalAmount = useMemo(() => {
    if (!modal.land || !modal.units) return 0;
    return (modal.units * modal.land.price_per_unit_kobo) / 100;
  }, [modal]);

  if (loading)
    return <p className="text-center text-gray-500">Loading portfolio…</p>;

  /* ================= RENDER ================= */

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      <h1 className="text-2xl font-bold">Your Portfolio</h1>

      {summary && (
        <div className="grid md:grid-cols-4 gap-4">
          <SummaryCard title="Portfolio Value" value={summary.current_portfolio_value_kobo} />
          <SummaryCard title="Total Invested" value={summary.total_invested_kobo} />
          <SummaryCard
            title="Profit / Loss"
            value={summary.total_profit_loss_kobo}
            highlight
          />
          <SummaryCard title="ROI" value={`${summary.profit_loss_percent}%`} raw />
        </div>
      )}

      {/* LANDS */}
      <div className="grid md:grid-cols-2 gap-6">
        {lands.map((land) => (
          <div key={land.land_id} className="bg-white p-5 rounded-xl shadow">
            <h2 className="font-semibold text-lg">{land.land_name}</h2>

            <Info label="Units Owned" value={land.units_owned} />
            <Info
              label="Price per Unit"
              value={`₦${(land.price_per_unit_kobo / 100).toLocaleString()}`}
            />
            <Info
              label="Current Value"
              value={`₦${Number(land.current_value).toLocaleString()}`}
              strong
            />

            <div className="flex gap-3 mt-4">
              <ActionBtn text="Buy More" color="green" onClick={() => openModal("buy", land)} />
              <ActionBtn text="Sell" color="red" onClick={() => openModal("sell", land)} />
            </div>
          </div>
        ))}
      </div>

      {/* TRANSACTIONS */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Transaction History</h2>

        {!transactions.length ? (
          <p className="text-center text-gray-500">No transactions yet</p>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedTransactions.map((t, i) => {
                const isPurchase = t.type === "Purchase";

                return (
                  <div
                    key={i}
                    className="flex justify-between items-center border p-4 rounded-lg"
                  >
                    <div>
                      <p
                        className={`font-semibold ${
                          isPurchase ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {t.type} • {t.land}
                      </p>

                      <p className="text-xs text-gray-500">
                        {isPurchase ? "+" : "-"}
                        {t.units} unit{t.units > 1 ? "s" : ""} •{" "}
                        {formatDate(t.date)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          isPurchase ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        {isPurchase ? "-" : "+"}₦{t.amount.toLocaleString()}
                      </p>
                      <span className="text-xs text-gray-500">{t.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6 flex-wrap">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg border text-sm ${
                        currentPage === page
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
            )}
          </>
        )}
      </div>

      {modal.type && (
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

/* ================= COMPONENTS ================= */

const SummaryCard = ({ title, value, highlight, raw }) => (
  <div className="bg-white p-4 rounded-xl shadow">
    <p className="text-sm text-gray-500">{title}</p>
    <p className={`text-xl font-bold ${highlight ? "text-green-600" : ""}`}>
      {raw ? value : `₦${Number(value / 100).toLocaleString()}`}
    </p>
  </div>
);

const Info = ({ label, value, strong }) => (
  <p className="text-gray-600 mt-1">
    {label}:{" "}
    <span className={strong ? "font-semibold text-green-700" : ""}>
      {value}
    </span>
  </p>
);

const ActionBtn = ({ text, color, onClick }) => {
  const colors = {
    green: "bg-green-600 hover:bg-green-700",
    red: "bg-red-600 hover:bg-red-700",
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-white ${colors[color]}`}
    >
      {text}
    </button>
  );
};

const Modal = ({ modal, closeModal, handleTransaction, totalAmount, setModal }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl w-full max-w-md">
      <h2 className="font-bold mb-4 capitalize">
        {modal.type} – {modal.land.land_name}
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
            Amount: ₦{totalAmount.toLocaleString()}
          </p>
        )}

        <input
          type="password"
          maxLength={4}
          value={modal.pin}
          onChange={(e) =>
            setModal((p) => ({
              ...p,
              pin: e.target.value.replace(/\D/g, ""),
            }))
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
            {modal.processing ? "Processing…" : "Confirm"}
          </button>
        </div>
      </form>
    </div>
  </div>
);
