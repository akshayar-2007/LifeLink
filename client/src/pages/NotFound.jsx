import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NotFound = () => {
    const { isLoggedIn } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center px-4">
            <div className="text-center max-w-md">

                {/* Big 404 */}
                <div className="text-8xl font-bold text-red-200 mb-4">
                    404
                </div>

                <div className="text-5xl mb-6">🩸</div>

                <h1 className="text-2xl font-bold text-gray-800 mb-3">
                    Page Not Found
                </h1>

                <p className="text-gray-500 mb-8 leading-relaxed">
                    The page you are looking for doesn't exist
                    or has been moved.
                </p>

                <div className="flex gap-3 justify-center">
                    <Link
                        to={isLoggedIn ? "/dashboard" : "/"}
                        className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 text-sm"
                    >
                        Go Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-3 border border-gray-300 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 text-sm"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;