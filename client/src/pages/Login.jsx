import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError("");

    if (!email.trim()) { setError("Please enter your email"); return; }
    if (!password.trim()) { setError("Please enter your password"); return; }

    setLoading(true);
    try {
      const res = await API.post("/auth/login", {
        email: email.trim(),
        password: password.trim()
      });
      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🩸</div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-500 mt-1 text-sm">Login to save lives</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="akshaya@gmail.com"
            autoComplete="off"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Enter your password"
              autoComplete="new-password"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Logging in...
            </span>
          ) : "Login"}
        </button>

        {/* Register Link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-red-600 font-semibold hover:underline">
            Register here
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;