import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError("");

    if (!name.trim()) { setError("Please enter your name"); return; }
    if (!email.trim()) { setError("Please enter your email"); return; }
    if (!phone.trim()) { setError("Please enter your phone number"); return; }
    if (phone.trim().length !== 10 || isNaN(phone.trim())) {
      setError("Phone must be exactly 10 digits"); return;
    }
    if (!bloodGroup) { setError("Please select your blood group"); return; }
    if (!city.trim()) { setError("Please enter your city"); return; }
    if (!state.trim()) { setError("Please enter your state"); return; }
    if (!password.trim()) { setError("Please enter a password"); return; }
    if (password.trim().length < 6) {
      setError("Password must be at least 6 characters"); return;
    }

    setLoading(true);
    try {
      const res = await API.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        phone: phone.trim(),
        bloodGroup,
        city: city.trim(),
        state: state.trim()
      });
      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.msg || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🩸</div>
          <h1 className="text-2xl font-bold text-gray-800">Become a Donor</h1>
          <p className="text-gray-500 mt-1 text-sm">Create your account to save lives</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Name */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            placeholder="Akshaya Kumar"
            autoComplete="off"
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Email */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            placeholder="akshaya@gmail.com"
            autoComplete="off"
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Phone */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              if (val.length <= 10) { setPhone(val); setError(""); }
            }}
            placeholder="9876543210"
            maxLength={10}
            autoComplete="off"
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Blood Group */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blood Group
          </label>
          <div className="grid grid-cols-4 gap-2">
            {BLOOD_GROUPS.map((bg) => (
              <button
                key={bg}
                type="button"
                onClick={() => { setBloodGroup(bg); setError(""); }}
                className={`py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                  bloodGroup === bg
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-red-300"
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        {/* City + State */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => { setCity(e.target.value); setError(""); }}
              placeholder="Chennai"
              autoComplete="off"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              value={state}
              onChange={(e) => { setState(e.target.value); setError(""); }}
              placeholder="Tamil Nadu"
              autoComplete="off"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="Min 6 characters"
              autoComplete="new-password"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
          {password.length > 0 && (
            <p className={`text-xs mt-1 ${password.length >= 6 ? "text-green-500" : "text-red-400"}`}>
              {password.length >= 6 ? "✅ Good password" : `⚠️ Need ${6 - password.length} more characters`}
            </p>
          )}
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
              Registering...
            </span>
          ) : "Register as Donor"}
        </button>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-red-600 font-semibold hover:underline">
            Login here
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;