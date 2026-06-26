import { useState } from "react";
import API from "../utils/api";
import { useAuth } from "../context/AuthContext";

const bloodGroupColor = {
  "A+": "bg-red-500", "A-": "bg-red-700",
  "B+": "bg-blue-500", "B-": "bg-blue-700",
  "AB+": "bg-purple-500", "AB-": "bg-purple-700",
  "O+": "bg-green-500", "O-": "bg-green-700"
};

const urgencyConfig = {
  normal: {
    color: "bg-green-100 text-green-700 border-green-200",
    label: "Normal",
    icon: "🟢"
  },
  urgent: {
    color: "bg-orange-100 text-orange-700 border-orange-200",
    label: "Urgent",
    icon: "🟠"
  },
  critical: {
    color: "bg-red-100 text-red-700 border-red-200",
    label: "Critical",
    icon: "🔴"
  }
};

// How long ago was request made
const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
};

const RequestCard = ({ request, onRespond }) => {
  const { user } = useAuth();
  const [responding, setResponding] = useState(false);
  const [responded, setResponded] = useState(false);
  const [error, setError] = useState("");

  const urgency = urgencyConfig[request.urgency] || urgencyConfig.normal;

  // Check if already responded
  const alreadyResponded = request.respondedBy?.includes(user?._id);

  // Check if this is my own request
  const isMyRequest = request.requestedBy?._id === user?._id ||
    request.requestedBy === user?._id;

  const handleRespond = async () => {
    setResponding(true);
    setError("");
    try {
      await API.post(`/requests/${request._id}/respond`);
      setResponded(true);
      if (onRespond) onRespond(request._id);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to respond");
    } finally {
      setResponding(false);
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border-l-4 p-5 ${
      request.urgency === "critical"
        ? "border-red-500"
        : request.urgency === "urgent"
        ? "border-orange-400"
        : "border-green-400"
    }`}>

      {/* Top Row */}
      <div className="flex items-start justify-between mb-3">

        {/* Blood Group + Hospital */}
        <div className="flex items-center gap-3">
          <div className={`${bloodGroupColor[request.bloodGroup] || "bg-red-500"} text-white font-bold text-base px-3 py-2 rounded-xl min-w-[50px] text-center`}>
            {request.bloodGroup}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">
              {request.hospital}
            </h3>
            <p className="text-sm text-gray-500">
              📍 {request.city}, {request.state}
            </p>
          </div>
        </div>

        {/* Urgency Badge */}
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${urgency.color}`}>
          {urgency.icon} {urgency.label}
        </span>
      </div>

      {/* Message if any */}
      {request.message && (
        <div className="bg-gray-50 rounded-xl px-4 py-3 mb-3">
          <p className="text-sm text-gray-600 italic">
            "{request.message}"
          </p>
        </div>
      )}

      {/* Bottom Row */}
      <div className="flex items-center justify-between">

        {/* Meta info */}
        <div className="text-xs text-gray-400 space-y-0.5">
          {request.requestedBy?.name && (
            <p>👤 {request.requestedBy.name}</p>
          )}
          <p>🕐 {timeAgo(request.createdAt)}</p>
          {request.respondedBy?.length > 0 && (
            <p>✅ {request.respondedBy.length} donor{request.respondedBy.length !== 1 ? "s" : ""} responded</p>
          )}
        </div>

        {/* Action */}
        <div>
          {isMyRequest ? (
            <span className="text-xs bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg font-medium">
              Your Request
            </span>
          ) : responded || alreadyResponded ? (
            <span className="text-xs bg-green-100 text-green-600 px-3 py-2 rounded-lg font-medium">
              ✅ Responded
            </span>
          ) : (
            <button
              onClick={handleRespond}
              disabled={responding}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm font-medium px-4 py-2 rounded-xl"
            >
              {responding ? "Responding..." : "🩸 Respond"}
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-500 text-xs mt-2">⚠️ {error}</p>
      )}

      {/* Success message after responding */}
      {responded && (
        <div className="mt-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <p className="text-green-700 text-sm font-medium">
            🎉 You responded! The patient has been notified.
          </p>
          {request.requestedBy?.phone && (
            <a
              href={`tel:${request.requestedBy.phone}`}
              className="text-green-600 text-sm underline mt-1 block"
            >
              📞 Call patient: {request.requestedBy.phone}
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default RequestCard;