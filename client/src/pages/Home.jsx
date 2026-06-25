import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="text-7xl mb-6">🩸</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Blood Donor Finder
        </h1>
        <p className="text-xl text-gray-500 mb-8">
          Connect with blood donors near you. Save lives instantly.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/register"
            className="px-8 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 text-lg"
          >
            Become a Donor
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 border-2 border-red-600 text-red-600 rounded-xl font-semibold hover:bg-red-50 text-lg"
          >
            Find Donors
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Home;