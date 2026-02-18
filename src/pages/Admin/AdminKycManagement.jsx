import { useEffect, useState } from "react";
import api from "../../utils/api";
import { toast } from "react-toastify";

export default function AdminKycManagement() {
  const [kycs, setKycs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [selectedKyc, setSelectedKyc] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchKycs();
  }, [filter]);

  const fetchKycs = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/kyc?status=${filter}`);
      setKycs(res.data.data.data);
    } catch (err) {
      toast.error("Failed to load KYC submissions");
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (kycId) => {
    try {
      const res = await api.get(`/admin/kyc/${kycId}`);
      setSelectedKyc(res.data.data);
      setShowModal(true);
    } catch (err) {
      toast.error("Failed to load KYC details");
    }
  };

  const handleApprove = async (kycId) => {
    if (!window.confirm("Are you sure you want to approve this KYC?")) return;

    try {
      setActionLoading(true);
      await api.post(`/admin/kyc/${kycId}/approve`);
      toast.success("KYC approved successfully");
      setShowModal(false);
      fetchKycs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve KYC");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (kycId) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      setActionLoading(true);
      await api.post(`/admin/kyc/${kycId}/reject`, {
        reason: rejectionReason,
      });
      toast.success("KYC rejected");
      setShowModal(false);
      setRejectionReason("");
      fetchKycs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject KYC");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestResubmit = async (kycId) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for resubmission");
      return;
    }

    try {
      setActionLoading(true);
      await api.post(`/admin/kyc/${kycId}/resubmit`, {
        reason: rejectionReason,
      });
      toast.success("Resubmission requested");
      setShowModal(false);
      setRejectionReason("");
      fetchKycs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to request resubmission");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      resubmit: "bg-orange-100 text-orange-800",
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading KYC submissions...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">KYC Verification Management</h1>
        
        {/* Filter Tabs */}
        <div className="flex gap-2 border-b">
          {["pending", "approved", "rejected", "resubmit"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 font-medium transition-colors ${
                filter === status
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* KYC List */}
      {kycs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No {filter} KYC submissions found
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Full Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {kycs.map((kyc) => (
                <tr key={kyc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {kyc.user.name}
                      </div>
                      <div className="text-sm text-gray-500">{kyc.user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {kyc.full_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 uppercase">
                    {kyc.id_type.replace("_", " ")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(kyc.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(kyc.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => viewDetails(kyc.id)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      {showModal && selectedKyc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">KYC Verification Details</h2>
                  <p className="text-gray-600 mt-1">
                    User: {selectedKyc.user.name} ({selectedKyc.user.email})
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setRejectionReason("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              {/* Status Badge */}
              <div className="mb-6">{getStatusBadge(selectedKyc.status)}</div>

              {/* Personal Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-medium">{selectedKyc.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="font-medium">
                      {new Date(selectedKyc.date_of_birth).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <p className="font-medium">{selectedKyc.phone_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">City, State</p>
                    <p className="font-medium">
                      {selectedKyc.city}, {selectedKyc.state}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">{selectedKyc.address}</p>
                  </div>
                </div>
              </div>

              {/* ID Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">ID Information</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                  <div>
                    <p className="text-sm text-gray-600">ID Type</p>
                    <p className="font-medium uppercase">
                      {selectedKyc.id_type.replace("_", " ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ID Number</p>
                    <p className="font-medium">{selectedKyc.id_number}</p>
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Uploaded Documents</h3>
                <div className="grid grid-cols-3 gap-4">
                  {/* ID Front */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">ID Front</p>
                    <a
                      href={selectedKyc.id_front_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={selectedKyc.id_front_url}
                        alt="ID Front"
                        className="w-full h-48 object-cover rounded border hover:opacity-75"
                      />
                    </a>
                  </div>

                  {/* ID Back */}
                  {selectedKyc.id_back_url && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">ID Back</p>
                      <a
                        href={selectedKyc.id_back_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={selectedKyc.id_back_url}
                          alt="ID Back"
                          className="w-full h-48 object-cover rounded border hover:opacity-75"
                        />
                      </a>
                    </div>
                  )}

                  {/* Selfie */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Selfie</p>
                    <a
                      href={selectedKyc.selfie_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={selectedKyc.selfie_url}
                        alt="Selfie"
                        className="w-full h-48 object-cover rounded border hover:opacity-75"
                      />
                    </a>
                  </div>
                </div>
              </div>

              {/* Rejection Reason (if rejected) */}
              {selectedKyc.rejection_reason && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Rejection Reason</h3>
                  <div className="bg-red-50 border border-red-200 rounded p-4">
                    <p className="text-red-800">{selectedKyc.rejection_reason}</p>
                  </div>
                </div>
              )}

              {/* Actions for Pending */}
              {selectedKyc.status === "pending" && (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(selectedKyc.id)}
                      disabled={actionLoading}
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                    >
                      ✓ Approve KYC
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Reason for Rejection/Resubmission
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full border rounded p-3 mb-3"
                      rows="3"
                      placeholder="Explain why this KYC is being rejected or needs resubmission..."
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleReject(selectedKyc.id)}
                        disabled={actionLoading}
                        className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                      >
                        ✗ Reject
                      </button>
                      <button
                        onClick={() => handleRequestResubmit(selectedKyc.id)}
                        disabled={actionLoading}
                        className="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium"
                      >
                        ↻ Request Resubmission
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}