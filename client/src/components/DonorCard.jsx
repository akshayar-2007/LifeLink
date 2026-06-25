const bloodGroupColor = {
  "A+": "bg-red-500", "A-": "bg-red-700",
  "B+": "bg-blue-500", "B-": "bg-blue-700",
  "AB+": "bg-purple-500", "AB-": "bg-purple-700",
  "O+": "bg-green-500", "O-": "bg-green-700"
};

const DonorCard = ({ donor }) => {

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">

        {/* Left — Donor Info */}
        <div className="flex items-center gap-4">

          {/* Blood Group Badge */}
          <div className={`${bloodGroupColor[donor.bloodGroup] || "bg-red-500"} text-white font-bold text-lg px-4 py-3 rounded-xl text-center min-w-[60px]`}>
            {donor.bloodGroup}
          </div>

          {/* Details */}
          <div>
            <h3 className="font-semibold text-gray-800 text-base">
              {donor.name}
            </h3>

            <p className="text-sm text-gray-500 mt-0.5">
              📍 {donor.city}, {donor.state}
            </p>

            {/* Distance if available */}
            {donor.distance !== undefined && (
              <p className="text-sm text-blue-600 font-medium mt-0.5">
                🗺️ {donor.distance} km away
              </p>
            )}

            {/* Last donated */}
            {donor.lastDonated && (
              <p className="text-xs text-gray-400 mt-0.5">
                Last donated:{" "}
                {new Date(donor.lastDonated).toLocaleDateString("en-IN", {
                  month: "short",
                  year: "numeric"
                })}
              </p>
            )}
          </div>
        </div>

        {/* Right — Status */}
        <div className="flex flex-col items-end gap-2">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
            donor.isAvailable
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-500"
          }`}>
            {donor.isAvailable ? "✅ Available" : "❌ Unavailable"}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 mt-4 pt-4">
        <div className="flex items-center justify-between">

          {/* Total donations */}
          <p className="text-xs text-gray-400">
            🩸 {donor.totalDonations || 0} donation{donor.totalDonations !== 1 ? "s" : ""}
          </p>

          {/* Contact Button */}
          {donor.isAvailable && (
            <a
              href={`tel:${donor.phone}`}
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-1"
            >
              📞 Contact
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorCard;