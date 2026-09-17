import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const stats = [
  { number: "8", label: "Blood Types" },
  { number: "24/7", label: "Available" },
  { number: "100%", label: "Free" }
];

const steps = [
  {
    icon: "📝",
    title: "Register",
    desc: "Create your profile with your blood group and location"
  },
  {
    icon: "🔍",
    title: "Search",
    desc: "Find donors near you instantly by blood group and city"
  },
  {
    icon: "🚨",
    title: "Request",
    desc: "Send emergency alerts to matching donors via email"
  },
  {
    icon: "🩸",
    title: "Save Lives",
    desc: "Donors respond and coordinate directly with patient"
  }
];

const Home = () => {
  const { isLoggedIn } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">

      {/* ── HERO SECTION ──────────────────── */}
      <div className="max-w-4xl mx-auto px-4 pt-16 pb-12 text-center">
        <div className="text-6xl mb-6">🩸</div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 leading-tight">
          Find Blood Donors
          <span className="text-red-600"> Instantly</span>
        </h1>

        <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto leading-relaxed">
          Connect with blood donors near you in seconds.
          Every second counts in an emergency.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          {isLoggedIn ? (
            <>
              <Link
                to="/search"
                className="px-8 py-4 bg-red-600 text-white rounded-2xl font-semibold hover:bg-red-700 text-base shadow-lg shadow-red-200"
              >
                🔍 Find Donors Now
              </Link>
              <Link
                to="/request"
                className="px-8 py-4 border-2 border-red-600 text-red-600 rounded-2xl font-semibold hover:bg-red-50 text-base"
              >
                🚨 Request Blood
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="px-8 py-4 bg-red-600 text-white rounded-2xl font-semibold hover:bg-red-700 text-base shadow-lg shadow-red-200"
              >
                🩸 Become a Donor
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 border-2 border-red-600 text-red-600 rounded-2xl font-semibold hover:bg-red-50 text-base"
              >
                Find Donors →
              </Link>
            </>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex justify-center gap-8 mb-16">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl font-bold text-red-600">{stat.number}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ──────────────────── */}
      <div className="bg-white py-14">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">
            How It Works
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">
                  {step.icon}
                </div>
                <h3 className="font-semibold text-gray-800 mb-1 text-sm">
                  {step.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BLOOD GROUPS ──────────────────── */}
      <div className="max-w-4xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          All Blood Groups Covered
        </h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
            <div
              key={bg}
              className="bg-red-600 text-white font-bold text-center py-4 rounded-2xl shadow-sm hover:bg-red-700 text-sm"
            >
              {bg}
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA BOTTOM ────────────────────── */}
      {!isLoggedIn && (
        <div className="bg-red-600 py-14">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">
              Ready to save lives?
            </h2>
            <p className="text-red-200 mb-6 text-sm">
              Join our community of blood donors today
            </p>
            <Link
              to="/register"
              className="inline-block px-8 py-4 bg-white text-red-600 rounded-2xl font-bold hover:bg-red-50"
            >
              Register as Donor →
            </Link>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center py-6">
        <p className="text-xs text-gray-400">
          🩸 LifeLink — Built with MERN Stack
        </p>
      </div>
    </div>
  );
};

export default Home;