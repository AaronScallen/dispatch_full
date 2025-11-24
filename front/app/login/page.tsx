"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function Login() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Check PIN against server
      await axios.post(`${BACKEND_URL}/api/verify-pin`, { pin });

      // 2. If successful, set a simple cookie (valid for 1 day)
      // Note: In a real banking app we'd use HttpOnly cookies,
      // but for a kiosk display, this is perfect.
      const expires = new Date();
      expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000); // 1 day
      document.cookie = `dispatch_session=true; expires=${expires.toUTCString()}; path=/`;

      // 3. Redirect
      router.push("/admin");
    } catch (err) {
      setError("Incorrect PIN code");
      setPin(""); // Clear input on fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="bg-slate-900 p-8 rounded-xl shadow-2xl border border-slate-800 w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Dispatcher Access
        </h2>
        <p className="text-slate-400 mb-6 text-sm">Enter Authorized PIN Code</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="password"
            maxLength={4}
            className="w-full text-center text-4xl tracking-[1em] font-mono p-4 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-800 transition-all"
            placeholder="0000"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} // Only allow numbers
            autoFocus
          />

          {error && (
            <div className="text-red-500 text-sm font-bold bg-red-900/20 p-2 rounded animate-pulse">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={pin.length !== 4 || loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-lg transition-colors uppercase tracking-widest"
          >
            {loading ? "Verifying..." : "Unlock Panel"}
          </button>
        </form>
      </div>
    </div>
  );
}
