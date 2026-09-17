import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import RequestCard from "../components/RequestCard";
import API from "../utils/api";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const EmergencyRequest = () => {
  const { user } = useAuth();

  // Tab state
  const [activeTab, setActiveTab] = useState("create"); // "create" or "view"

  // Form state
  const [form, setForm] = useState({
    bloodGroup: "",
    hospital: "",
    city: user?.city || "",
    state: user?.state || "",
    message: "",
    urgency: "normal"
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // Requests list state
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [filterBloodGroup, setFilterBloodGroup] = useState("");

  // Load requests when view tab is active
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (activeTab === "view") {
      fetchRequests();
    }
  }, [activeTab, filterBloodGroup]);

  const fetchRequests = async () => {
    setRequestsLoading(true);
    try {
      const params = {};
      if (filterBloodGroup) params.bloodGroup = filterBloodGroup;

      const res = await API.get("/requests", { params });
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error("Fetch requests error:", err);
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError("");
  };

  // ── SUBMIT REQUEST ─────────────────────
  const handleSubmit = async () => {
    // Validate
    if (!form.bloodGroup || !form.hospital || !form.city || !form.state) {
      setFormError("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      const res = await API.post("/requests", form);

      // Show success state
      setSubmitSuccess({
        donorsNotified: res.data.donorsNotified,
        request: res.data.request
      });

      // Reset form
      setForm({
        bloodGroup: "",
        hospital: "",
        city: user?.city || "",
        state: user?.state || "",
        message: "",
        urgency: "normal"
      });

    } catch (err) {
      setFormError(err.response?.data?.msg || "Failed to send request");
    } finally {
      setSubmitting(false);
    }
  };

  // After donor responds — refresh list
  const handleRespond = (requestId) => {
    fetchRequests();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* ── HEADER ────────────────────────── */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Blood Requests 🚨
          </h1>
          <p className="text-gray-500 mt-1">
            Create a request or respond to existing ones
          </p>
        </div>

        {/* ── TABS ──────────────────────────── */}
        <div className="flex gap-1 bg-gray-200 p-1 rounded-xl mb-6">
          <button
            onClick={() => {
              setActiveTab("create");
              setSubmitSuccess(null);
            }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "create"
                ? "bg-white text-red-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            🚨 Create Request
          </button>
          <button
            onClick={() => setActiveTab("view")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "view"
                ? "bg-white text-red-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            📋 View Requests
          </button>
        </div>

        {/* ── TAB 1: CREATE REQUEST ─────────── */}
        {activeTab === "create" && (
          <div>

            {/* Success State */}
            {submitSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6 text-center">
                <div className="text-5xl mb-3">✅</div>
                <h2 className="text-xl font-bold text-green-700 mb-1">
                  Request Sent Successfully!
                </h2>
                <p className="text-green-600 text-sm mb-3">
                  Your emergency request has been sent
                </p>

                {/* Donors notified count */}
                <div className="bg-white rounded-xl p-4 inline-block mb-4">
                  <p className="text-3xl font-bold text-green-600">
                    {submitSuccess.donorsNotified}
                  </p>
                  <p className="text-sm text-gray-500">
                    donor{submitSuccess.donorsNotified !== 1 ? "s" : ""} notified via email
                  </p>
                </div>

                {submitSuccess.donorsNotified === 0 && (
                  <p className="text-orange-600 text-sm mb-4">
                    ⚠️ No matching donors found in your city.
                    Try requesting in a nearby city.
                  </p>
                )}

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setSubmitSuccess(null)}
                    className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700"
                  >
                    Create Another
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("view");
                      setSubmitSuccess(null);
                    }}
                    className="px-5 py-2.5 border border-green-600 text-green-600 rounded-xl text-sm font-medium hover:bg-green-50"
                  >
                    View Requests
                  </button>
                </div>
              </div>
            )}

            {/* Request Form */}
            {!submitSuccess && (
              <div className="bg-white rounded-2xl shadow-sm p-6">

                {/* Blood Group */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Blood Group Needed *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {BLOOD_GROUPS.map(bg => (
                      <button
                        key={bg}
                        onClick={() => setForm({ ...form, bloodGroup: bg })}
                        className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${form.bloodGroup === bg
                            ? "bg-red-600 text-white border-red-600"
                            : "bg-white text-gray-600 border-gray-200 hover:border-red-300"
                          }`}
                      >
                        {bg}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hospital */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hospital Name *
                  </label>
                  <input
                    type="text"
                    name="hospital"
                    value={form.hospital}
                    onChange={handleFormChange}
                    placeholder="e.g. Apollo Hospital"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                {/* City + State */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleFormChange}
                      placeholder="Chennai"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={form.state}
                      onChange={handleFormChange}
                      placeholder="Tamil Nadu"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Urgency */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Urgency Level *
                  </label>
                  <div className="grid grid-cols-3 gap-3">

                    {/* Normal */}
                    <button
                      onClick={() => setForm({ ...form, urgency: "normal" })}
                      className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all ${form.urgency === "normal"
                          ? "bg-green-500 text-white border-green-500"
                          : "border-gray-200 text-gray-500 hover:border-green-300"
                        }`}
                    >
                      🟢 Normal
                    </button>

                    {/* Urgent */}
                    <button
                      onClick={() => setForm({ ...form, urgency: "urgent" })}
                      className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all ${form.urgency === "urgent"
                          ? "bg-orange-500 text-white border-orange-500"
                          : "border-gray-200 text-gray-500 hover:border-orange-300"
                        }`}
                    >
                      🟠 Urgent
                    </button>

                    {/* Critical */}
                    <button
                      onClick={() => setForm({ ...form, urgency: "critical" })}
                      className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all ${form.urgency === "critical"
                          ? "bg-red-500 text-white border-red-500"
                          : "border-gray-200 text-gray-500 hover:border-red-300"
                        }`}
                    >
                      🔴 Critical
                    </button>
                  </div>
                </div>

                {/* Message */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Additional Message
                    <span className="text-gray-400 font-normal ml-1">(optional)</span>
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleFormChange}
                    placeholder="Any additional details for donors..."
                    rows={3}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Error */}
                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
                    ⚠️ {formError}
                  </div>
                )}

                {/* Warning */}
                <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-4">
                  <p className="text-orange-700 text-sm">
                    ⚠️ This will send email alerts to all matching donors in your city.
                    Only use for genuine emergencies.
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold py-4 rounded-xl text-base"
                >
                  {submitting
                    ? "Sending alerts to donors..."
                    : "🚨 Send Emergency Request"
                  }
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: VIEW REQUESTS ──────────── */}
        {activeTab === "view" && (
          <div>

            {/* Blood Group Filter */}
            <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterBloodGroup("")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${filterBloodGroup === ""
                      ? "bg-red-600 text-white border-red-600"
                      : "border-gray-200 text-gray-500 hover:border-red-300"
                    }`}
                >
                  All
                </button>
                {BLOOD_GROUPS.map(bg => (
                  <button
                    key={bg}
                    onClick={() => setFilterBloodGroup(bg)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${filterBloodGroup === bg
                        ? "bg-red-600 text-white border-red-600"
                        : "border-gray-200 text-gray-500 hover:border-red-300"
                      }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading */}
            {requestsLoading && (
              <div className="text-center py-12">
                <div className="text-4xl mb-3 animate-pulse">🩸</div>
                <p className="text-gray-500">Loading requests...</p>
              </div>
            )}

            {/* Results count */}
            {!requestsLoading && (
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500 font-medium">
                  {requests.length} open request{requests.length !== 1 ? "s" : ""}
                </p>
                <button
                  onClick={fetchRequests}
                  className="text-sm text-red-600 font-medium hover:underline"
                >
                  🔄 Refresh
                </button>
              </div>
            )}

            {/* Request Cards */}
            {!requestsLoading && requests.length > 0 && (
              <div className="space-y-4">
                {requests.map(request => (
                  <RequestCard
                    key={request._id}
                    request={request}
                    onRespond={handleRespond}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!requestsLoading && requests.length === 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="font-semibold text-gray-700 text-lg mb-2">
                  No open requests
                </h3>
                <p className="text-gray-400 text-sm">
                  {filterBloodGroup
                    ? `No open requests for ${filterBloodGroup} blood group`
                    : "No blood requests at the moment"
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyRequest;