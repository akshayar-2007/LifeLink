import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import DonorCard from "../components/DonorCard";
import API from "../utils/api";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const RADIUS_OPTIONS = [10, 25, 50, 100];

const SearchDonors = () => {
  const { user } = useAuth();

  // Search filters
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("");
  const [city, setCity] = useState(user?.city || "");
  const [radius, setRadius] = useState(25);
  const [useLocation, setUseLocation] = useState(false);
  const [coordinates, setCoordinates] = useState(null);

  // Results
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);

  // Auto search when page loads with user's city
  useEffect(() => {
    if (user?.city) {
      handleSearch();
    }
  }, []);

  // ── GET USER LOCATION ──────────────────
  const handleGetLocation = () => {
    // Check if browser supports geolocation
    if (!navigator.geolocation) {
      setError("Your browser does not support geolocation");
      return;
    }

    setLocationLoading(true);
    setError("");

    // Ask browser for coordinates
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Success — save coordinates
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setUseLocation(true);
        setLocationLoading(false);
        setCity(""); // clear city when using location
      },
      (err) => {
        // User denied location or error
        setError("Could not get your location. Please allow location access or search by city.");
        setLocationLoading(false);
        setUseLocation(false);
      }
    );
  };

  // ── SEARCH DONORS ──────────────────────
  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setSearched(true);

    try {
      // Build query params based on filters
      const params = {};

      if (selectedBloodGroup) {
        params.bloodGroup = selectedBloodGroup;
      }

      // If using location → send coordinates + radius
      if (useLocation && coordinates) {
        params.latitude = coordinates.lat;
        params.longitude = coordinates.lng;
        params.radius = radius;
      } else if (city) {
        // Otherwise search by city name
        params.city = city;
      }

      const res = await API.get("/donors/search", { params });
      setDonors(res.data.donors || []);

    } catch (err) {
      setError("Search failed. Please try again.");
      setDonors([]);
    } finally {
      setLoading(false);
    }
  };

  // ── CLEAR FILTERS ──────────────────────
  const handleClear = () => {
    setSelectedBloodGroup("");
    setCity(user?.city || "");
    setUseLocation(false);
    setCoordinates(null);
    setDonors([]);
    setSearched(false);
    setError("");
  };

  // Handle Enter key in city input
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* ── HEADER ────────────────────────── */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Find Blood Donors 🔍
          </h1>
          <p className="text-gray-500 mt-1">
            Search donors by blood group and location
          </p>
        </div>

        {/* ── SEARCH FILTERS CARD ───────────── */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">

          {/* Blood Group Filter */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Blood Group
            </label>
            <div className="flex flex-wrap gap-2">
              {/* "All" button */}
              <button
                onClick={() => setSelectedBloodGroup("")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                  selectedBloodGroup === ""
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-red-300"
                }`}
              >
                All
              </button>

              {/* Blood group buttons */}
              {BLOOD_GROUPS.map(bg => (
                <button
                  key={bg}
                  onClick={() => setSelectedBloodGroup(bg)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                    selectedBloodGroup === bg
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-red-300"
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* Location Search */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Location
            </label>

            {/* City Input */}
            {!useLocation && (
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter city name (e.g. Chennai)"
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Location buttons row */}
            <div className="flex flex-wrap gap-2 items-center">

              {/* Use My Location Button */}
              <button
                onClick={handleGetLocation}
                disabled={locationLoading}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                  useLocation
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-blue-600 border-blue-300 hover:bg-blue-50"
                } ${locationLoading ? "opacity-50" : ""}`}
              >
                {locationLoading ? (
                  <>⏳ Getting location...</>
                ) : useLocation ? (
                  <>📍 Location active</>
                ) : (
                  <>📍 Use my location</>
                )}
              </button>

              {/* Clear location button */}
              {useLocation && (
                <button
                  onClick={() => {
                    setUseLocation(false);
                    setCoordinates(null);
                    setCity(user?.city || "");
                  }}
                  className="px-3 py-2.5 rounded-xl text-sm text-gray-500 border border-gray-200 hover:bg-gray-50"
                >
                  ✕ Clear
                </button>
              )}

              {/* Radius selector — only show when using location */}
              {useLocation && (
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-sm text-gray-500">Radius:</span>
                  <select
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  >
                    {RADIUS_OPTIONS.map(r => (
                      <option key={r} value={r}>{r} km</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Location active message */}
            {useLocation && coordinates && (
              <p className="text-xs text-blue-600 mt-2">
                ✅ Searching within {radius}km of your location
              </p>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
              ⚠️ {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold py-3 rounded-xl text-sm"
            >
              {loading ? "Searching..." : "🔍 Search Donors"}
            </button>

            <button
              onClick={handleClear}
              className="px-5 py-3 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 font-medium"
            >
              Clear
            </button>
          </div>
        </div>

        {/* ── RESULTS ───────────────────────── */}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3 animate-pulse">🩸</div>
            <p className="text-gray-500">Searching for donors...</p>
          </div>
        )}

        {/* Results Header */}
        {!loading && searched && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">
              {donors.length > 0
                ? `Found ${donors.length} donor${donors.length !== 1 ? "s" : ""}`
                : "No donors found"
              }
            </h2>

            {selectedBloodGroup && (
              <span className="bg-red-100 text-red-600 text-xs font-medium px-3 py-1 rounded-full">
                {selectedBloodGroup}
              </span>
            )}
          </div>
        )}

        {/* Donor Cards */}
        {!loading && donors.length > 0 && (
          <div className="space-y-4">
            {donors.map(donor => (
              <DonorCard key={donor._id} donor={donor} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && searched && donors.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
            <div className="text-5xl mb-4">😔</div>
            <h3 className="font-semibold text-gray-700 text-lg mb-2">
              No donors found
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              {selectedBloodGroup
                ? `No available ${selectedBloodGroup} donors found in this area`
                : "No available donors found in this area"
              }
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <p>Try:</p>
              <p>→ Searching a different city</p>
              <p>→ Increasing the radius</p>
              <p>→ Removing the blood group filter</p>
            </div>
          </div>
        )}

        {/* Initial State — before any search */}
        {!loading && !searched && (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-semibold text-gray-700 text-lg mb-2">
              Search for Donors
            </h3>
            <p className="text-gray-400 text-sm">
              Select a blood group and enter your city
              <br />or use your location to find nearby donors
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default SearchDonors;