import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";

const bloodGroupColor = {
  "A+": "bg-red-500", "A-": "bg-red-700",
  "B+": "bg-blue-500", "B-": "bg-blue-700",
  "AB+": "bg-purple-500", "AB-": "bg-purple-700",
  "O+": "bg-green-500", "O-": "bg-green-700"
};

const urgencyConfig = {
  normal: { color: "bg-green-100 text-green-700", icon: "🟢" },
  urgent: { color: "bg-orange-100 text-orange-700", icon: "🟠" },
  critical: { color: "bg-red-100 text-red-700", icon: "🔴" }
};

const statusConfig = {
  open: { color: "bg-blue-100 text-blue-700", label: "Open" },
  fulfilled: { color: "bg-green-100 text-green-700", label: "Fulfilled" },
  cancelled: { color: "bg-gray-100 text-gray-600", label: "Cancelled" }
};

const Profile = () => {
  const { user, updateUser } = useAuth();

  // Tab state
  const [activeTab, setActiveTab] = useState("profile");

  // Profile form state
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    city: user?.city || "",
    state: user?.state || "",
    lastDonated: user?.lastDonated
      ? new Date(user.lastDonated).toISOString().split("T")[0]
      : ""
  });

  // UI states
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationSaved, setLocationSaved] = useState(false);
  const [coordinates, setCoordinates] = useState(null);

  // My requests state
  const [myRequests, setMyRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  // Load requests when tab switches
  useEffect(() => {
    if (activeTab === "requests") {
      fetchMyRequests();
    }
  }, [activeTab]);

  const fetchMyRequests = async () => {
    setRequestsLoading(true);
    try {
      const res = await API.get("/requests/mine");
      setMyRequests(res.data.requests || []);
    } catch (err) {
      console.error("Fetch requests error:", err);
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaveSuccess(false);
    setSaveError("");
  };

  // ── GET LOCATION ───────────────────────
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setSaveError("Your browser does not support geolocation");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          // Save location immediately to DB
          await API.put("/donors/profile", {
            latitude: lat,
            longitude: lng
          });

          setCoordinates({ lat, lng });
          setLocationSaved(true);
          setLocationLoading(false);

        } catch (err) {
          setSaveError("Failed to save location");
          setLocationLoading(false);
        }
      },
      (err) => {
        setSaveError("Could not get location. Please allow location access.");
        setLocationLoading(false);
      }
    );
  };

  // ── SAVE PROFILE ───────────────────────
  const handleSave = async () => {
    if (!form.name || !form.phone || !form.city || !form.state) {
      setSaveError("Please fill in all required fields");
      return;
    }

    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      const updateData = {
        name: form.name,
        phone: form.phone,
        city: form.city,
        state: form.state
      };

      // Only send lastDonated if user picked a date
      if (form.lastDonated) {
        updateData.lastDonated = form.lastDonated;
      }

      // Include coordinates if updated
      if (coordinates) {
        updateData.latitude = coordinates.lat;
        updateData.longitude = coordinates.lng;
      }

      const res = await API.put("/donors/profile", updateData);

      // Update context with new data
      updateUser(res.data.user);
      setSaveSuccess(true);

      // Hide success after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);

    } catch (err) {
      setSaveError(err.response?.data?.msg || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // ── MARK REQUEST STATUS ────────────────
  const handleUpdateRequestStatus = async (requestId, status) => {
    try {
      await API.put(`/requests/${requestId}/status`, { status });
      // Refresh list
      fetchMyRequests();
    } catch (err) {
      console.error("Update status error:", err);
    }
  };

  // Time ago helper
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* ── HEADER ────────────────────────── */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            My Profile 👤
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your donor profile and requests
          </p>
        </div>

        {/* ── PROFILE SUMMARY CARD ──────────── */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">

            {/* Avatar Circle */}
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-2xl font-bold text-red-600 flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">
                {user?.name}
              </h2>
              <p className="text-gray-500 text-sm mt-0.5">
                {user?.email}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">

                {/* Blood Group */}
                <span className={`${bloodGroupColor[user?.bloodGroup] || "bg-red-500"} text-white text-xs font-bold px-3 py-1 rounded-lg`}>
                  {user?.bloodGroup}
                </span>

                {/* Location */}
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
                  📍 {user?.city}, {user?.state}
                </span>

                {/* Status */}
                <span className={`text-xs font-medium px-3 py-1 rounded-lg ${
                  user?.isAvailable
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-500"
                }`}>
                  {user?.isAvailable ? "✅ Available" : "❌ Unavailable"}
                </span>
              </div>
            </div>

            {/* Donations count */}
            <div className="text-center flex-shrink-0">
              <p className="text-3xl font-bold text-red-600">
                {user?.totalDonations || 0}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Donations</p>
            </div>
          </div>
        </div>

        {/* ── TABS ──────────────────────────── */}
        <div className="flex gap-1 bg-gray-200 p-1 rounded-xl mb-6">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "profile"
                ? "bg-white text-red-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            ✏️ Edit Profile
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "requests"
                ? "bg-white text-red-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            📋 My Requests
          </button>
        </div>

        {/* ── TAB 1: EDIT PROFILE ───────────── */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl shadow-sm p-6">

            {/* Success Banner */}
            {saveSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm mb-5 flex items-center gap-2">
                ✅ Profile updated successfully!
              </div>
            )}

            {/* Error Banner */}
            {saveError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-5">
                ⚠️ {saveError}
              </div>
            )}

            {/* Name */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Phone */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleFormChange}
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
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Last Donated */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Last Donation Date
                <span className="text-gray-400 font-normal ml-1">(optional)</span>
              </label>
              <input
                type="date"
                name="lastDonated"
                value={form.lastDonated}
                onChange={handleFormChange}
                max={new Date().toISOString().split("T")[0]}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
              />
              <p className="text-xs text-gray-400 mt-1">
                Donors should wait at least 3 months between donations
              </p>
            </div>

            {/* Location Update */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-800">
                    📍 Location for Radius Search
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Update your exact location so donors can find you by distance
                  </p>
                  {locationSaved && (
                    <p className="text-xs text-green-600 mt-1 font-medium">
                      ✅ Location updated successfully!
                    </p>
                  )}
                </div>
                <button
                  onClick={handleGetLocation}
                  disabled={locationLoading}
                  className={`flex-shrink-0 ml-3 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    locationSaved
                      ? "bg-green-500 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  } ${locationLoading ? "opacity-50" : ""}`}
                >
                  {locationLoading
                    ? "Getting..."
                    : locationSaved
                    ? "✅ Updated"
                    : "Update"
                  }
                </button>
              </div>
            </div>

            {/* Blood Group Note */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Blood Group:</span>{" "}
                <span className={`${bloodGroupColor[user?.bloodGroup] || "bg-red-500"} text-white text-xs font-bold px-2 py-0.5 rounded ml-1`}>
                  {user?.bloodGroup}
                </span>
                <span className="text-gray-400 text-xs ml-2">
                  (Cannot be changed after registration)
                </span>
              </p>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold py-3.5 rounded-xl text-sm"
            >
              {saving ? "Saving changes..." : "💾 Save Changes"}
            </button>
          </div>
        )}

        {/* ── TAB 2: MY REQUESTS ────────────── */}
        {activeTab === "requests" && (
          <div>

            {/* Loading */}
            {requestsLoading && (
              <div className="text-center py-12">
                <div className="text-4xl mb-3 animate-pulse">🩸</div>
                <p className="text-gray-500">Loading your requests...</p>
              </div>
            )}

            {/* Request Cards */}
            {!requestsLoading && myRequests.length > 0 && (
              <div className="space-y-4">
                {myRequests.map(request => (
                  <div
                    key={request._id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
                  >
                    {/* Top Row */}
                    <div className="flex items-start justify-between mb-3">

                      {/* Blood Group + Hospital */}
                      <div className="flex items-center gap-3">
                        <div className={`${bloodGroupColor[request.bloodGroup] || "bg-red-500"} text-white font-bold text-sm px-3 py-2 rounded-xl min-w-[48px] text-center`}>
                          {request.bloodGroup}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 text-sm">
                            {request.hospital}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {request.city} • {timeAgo(request.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-col items-end gap-1">
                        {/* Urgency */}
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${urgencyConfig[request.urgency]?.color}`}>
                          {urgencyConfig[request.urgency]?.icon} {request.urgency}
                        </span>
                        {/* Status */}
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusConfig[request.status]?.color}`}>
                          {statusConfig[request.status]?.label}
                        </span>
                      </div>
                    </div>

                    {/* Donors responded */}
                    {request.respondedBy?.length > 0 && (
                      <div className="bg-green-50 rounded-xl p-3 mb-3">
                        <p className="text-xs font-semibold text-green-700 mb-2">
                          🩸 {request.respondedBy.length} Donor{request.respondedBy.length !== 1 ? "s" : ""} Responded:
                        </p>
                        <div className="space-y-1">
                          {request.respondedBy.map(donor => (
                            <div key={donor._id} className="flex items-center justify-between">
                              <p className="text-xs text-green-700">
                                {donor.name} ({donor.bloodGroup})
                              </p>
                              {donor.phone && (
                                <a
                                  href={`tel:${donor.phone}`}
                                  className="text-xs text-green-600 underline font-medium"
                                >
                                  📞 {donor.phone}
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stats row */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-400">
                        📧 {request.donorsNotified || 0} donors notified
                      </p>

                      {/* Status actions */}
                      {request.status === "open" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateRequestStatus(request._id, "fulfilled")}
                            className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-medium hover:bg-green-200"
                          >
                            ✅ Mark Fulfilled
                          </button>
                          <button
                            onClick={() => handleUpdateRequestStatus(request._id, "cancelled")}
                            className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!requestsLoading && myRequests.length === 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
                <div className="text-5xl mb-4">📋</div>
                <h3 className="font-semibold text-gray-700 text-lg mb-2">
                  No requests yet
                </h3>
                <p className="text-gray-400 text-sm">
                  You haven't created any blood requests
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;