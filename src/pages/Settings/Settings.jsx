import { useState } from "react";
import TransactionPin from "./TransactionPin";
import ResetPin from "./ResetPin";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("pin");

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Account Settings
      </h1>

      {/* Tabs Navigation */}
      <div className="flex gap-6 border-b mb-6">
        <button
          onClick={() => setActiveTab("pin")}
          className={`pb-2 font-medium transition ${
            activeTab === "pin"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-blue-600"
          }`}
        >
          Transaction PIN
        </button>

        <button
          onClick={() => setActiveTab("reset")}
          className={`pb-2 font-medium transition ${
            activeTab === "reset"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-blue-600"
          }`}
        >
          Reset PIN
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-2 font-medium transition ${
            activeTab === "profile"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-blue-600"
          }`}
        >
          Profile
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[200px]">
        {activeTab === "pin" && <TransactionPin />}
        {activeTab === "reset" && <ResetPin />}
        {activeTab === "profile" && (
          <div className="text-gray-600">
            <p>Profile settings coming soon (update name, email, or password here).</p>
          </div>
        )}
      </div>
    </div>
  );
}
