import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";
import { StatsSkeleton } from "../components/Skeleton";

const Dashboard = () => {
  const { user, updateUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [stats, setStats] = useState({
    totalRequests: 0,
    openRequests: 0
  });

  // Fetch data when page loads
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch recent requests in user's city
      // Run both API calls at the same time
      const [requestsRes, profileRes] = await Promise.all([
        API.get(`/requests?city=${user?.city}`),
        API.get("/donors/profile/me")
      ]);

      setRequests(requestsRes.data.requests || []);

      // Update user in context with fresh data
      updateUser(profileRes.data);

      // Calculate stats
      setStats({
        totalRequests: requestsRes.data.count,
        openRequests: requestsRes.data.requests?.filter(
          r => r.status === "open"
        ).length
      });

    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle availability ON/OFF
  const handleToggleAvailability = async () => {
    setToggling(true);
    try {
      const res = await API.put("/donors/availability");

      // Update user in context
      updateUser({
        ...user,
        isAvailable: res.data.isAvailable
      });

    } catch (err) {
      console.error("Toggle error:", err);
    } finally {
      setToggling(false);
    }
  };

  // Color for urgency badge
  const urgencyColor = {
    normal: "bg-green-100 text-green-700",
    urgent: "bg-orange-100 text-orange-700",
    critical: "bg-red-100 text-red-700"
  };

  // Color for blood group badge
  const bloodGroupColor = {
    "A+": "bg-red-500", "A-": "bg-red-600",
    "B+": "bg-blue-500", "B-": "bg-blue-600",
    "AB+": "bg-purple-500", "AB-": "bg-purple-600",
    "O+": "bg-green-500", "O-": "bg-green-600"
  };

  /*if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🩸</div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }*/
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="w-48 h-8 bg-gray-200 rounded-lg animate-pulse mb-2" />
            <div className="w-32 h-4 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <StatsSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* ── WELCOME HEADER ────────────────── */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome back, {user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1">
            {user?.city}, {user?.state} •{" "}
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long"
            })}
          </p>
        </div>

        {/* ── STATS CARDS ───────────────────── */}
        <div className="grid grid-cols-3 gap-4 mb-6">

          {/* Blood Group Card */}
          <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
            <div className={`inline-block ${bloodGroupColor[user?.bloodGroup] || "bg-red-500"} text-white text-2xl font-bold px-4 py-2 rounded-xl mb-2`}>
              {user?.bloodGroup}
            </div>
            <p className="text-xs text-gray-500 font-medium">Blood Group</p>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
            <div className={`text-2xl font-bold mb-2 ${user?.isAvailable ? "text-green-500" : "text-red-400"}`}>
              {user?.isAvailable ? "✅" : "❌"}
            </div>
            <p className="text-xs text-gray-500 font-medium">
              {user?.isAvailable ? "Available" : "Unavailable"}
            </p>
          </div>

          {/* Donations Card */}
          <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
            <div className="text-2xl font-bold text-red-600 mb-2">
              {user?.totalDonations || 0}
            </div>
            <p className="text-xs text-gray-500 font-medium">Donations</p>
          </div>

        </div>

        {/* ── AVAILABILITY TOGGLE ───────────── */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-800 text-lg">
                Donation Availability
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {user?.isAvailable
                  ? "You are visible to people searching for donors"
                  : "You are hidden from donor search results"
                }
              </p>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={handleToggleAvailability}
              disabled={toggling}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none ${user?.isAvailable ? "bg-green-500" : "bg-gray-300"
                } ${toggling ? "opacity-50" : ""}`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${user?.isAvailable ? "translate-x-9" : "translate-x-1"
                  }`}
              />
            </button>
          </div>

          {/* Last donated info */}
          {user?.lastDonated && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Last donated:{" "}
                <span className="font-medium text-gray-700">
                  {new Date(user.lastDonated).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* ── QUICK ACTIONS ─────────────────── */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link
            to="/search"
            className="bg-red-600 hover:bg-red-700 text-white rounded-2xl p-5 text-center shadow-sm"
          >
            <div className="text-3xl mb-2">🔍</div>
            <p className="font-semibold">Find Donors</p>
            <p className="text-xs text-red-200 mt-1">
              Search by blood group
            </p>
          </Link>

          <Link
            to="/request"
            className="bg-white hover:bg-gray-50 text-gray-800 rounded-2xl p-5 text-center shadow-sm border border-gray-100"
          >
            <div className="text-3xl mb-2">🚨</div>
            <p className="font-semibold">Request Blood</p>
            <p className="text-xs text-gray-400 mt-1">
              Send emergency alert
            </p>
          </Link>
        </div>

        {/* ── RECENT REQUESTS ───────────────── */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-800 text-lg">
              Recent Requests in {user?.city}
            </h2>
            <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
              {stats.openRequests} open
            </span>
          </div>

          {/* Requests List */}
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-gray-500 font-medium">
                No active requests in {user?.city}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Your city is well covered!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.slice(0, 5).map(request => (
                <div
                  key={request._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors"
                >
                  {/* Left side */}
                  <div className="flex items-center gap-3">
                    {/* Blood Group Badge */}
                    <div className={`${bloodGroupColor[request.bloodGroup] || "bg-red-500"} text-white text-sm font-bold px-3 py-1.5 rounded-lg min-w-[44px] text-center`}>
                      {request.bloodGroup}
                    </div>

                    {/* Request Info */}
                    <div>
                      <p className="font-medium text-gray-800 text-sm">
                        {request.hospital}
                      </p>
                      <p className="text-xs text-gray-500">
                        {request.city} •{" "}
                        {new Date(request.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>

                  {/* Right side — urgency badge */}
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${urgencyColor[request.urgency]}`}>
                    {request.urgency}
                  </span>
                </div>
              ))}

              {/* View all link if more than 5 */}
              {requests.length > 5 && (
                <Link
                  to="/request"
                  className="block text-center text-sm text-red-600 font-medium pt-2 hover:underline"
                >
                  View all {requests.length} requests →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* ── DONOR TIP ─────────────────────── */}
        <div className="mt-6 bg-red-50 border border-red-100 rounded-2xl p-5">
          <div className="flex gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="font-medium text-red-800 text-sm">
                Did you know?
              </p>
              <p className="text-red-600 text-sm mt-0.5">
                One blood donation can save up to 3 lives.
                You can donate every 3 months safely.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;