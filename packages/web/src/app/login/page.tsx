"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Truck, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const ok = await login(email, password);
    setSubmitting(false);
    if (ok) {
      router.push("/");
    } else {
      setError("Invalid email or password");
    }
  };

  const fillDemo = (role: string) => {
    const accounts: Record<string, { email: string; password: string }> = {
      admin: { email: "admin@afrilogistics.com", password: "admin123" },
      driver: { email: "driver@afrilogistics.com", password: "driver123" },
      dispatcher: { email: "dispatcher@afrilogistics.com", password: "dispatch123" },
    };
    const acc = accounts[role];
    if (acc) { setEmail(acc.email); setPassword(acc.password); setError(""); }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-emerald-600 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 800 600" className="w-full h-full">
            <path d="M0,300 Q200,100 400,300 Q600,500 800,300" fill="none" stroke="white" strokeWidth="3" />
            <path d="M0,200 Q200,400 400,200 Q600,0 800,200" fill="none" stroke="white" strokeWidth="2" />
            <circle cx="200" cy="250" r="8" fill="white" opacity="0.4" />
            <circle cx="400" cy="300" r="10" fill="white" opacity="0.5" />
            <circle cx="600" cy="200" r="6" fill="white" opacity="0.3" />
            <circle cx="300" cy="150" r="5" fill="white" opacity="0.4" />
            <circle cx="550" cy="350" r="7" fill="white" opacity="0.3" />
          </svg>
        </div>
        <div className="relative z-10 text-center px-12">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Truck className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">AfriLogistics</h1>
          <p className="text-xl text-emerald-100 mb-8">Logistics Platform for Africa</p>
          <div className="grid grid-cols-2 gap-4 text-left text-emerald-100 text-sm">
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-white rounded-full" /> Route Optimization</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-white rounded-full" /> Fleet Tracking</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-white rounded-full" /> Warehouse Management</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-white rounded-full" /> Fuel Optimization</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-white rounded-full" /> Delivery Prediction</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-white rounded-full" /> Mobile Money</div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">AfriLogistics</span>
          </div>

          <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
          <p className="text-gray-500 mb-8">Sign in to your account</p>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-6 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" className="input pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password" className="input pl-10 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" className="rounded border-gray-300" />
                Remember me
              </label>
              <button type="button" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">Forgot password?</button>
            </div>

            <button type="submit" disabled={submitting}
              className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2">
              {submitting ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in...</>
              ) : "Sign In"}
            </button>
          </form>

          <div className="mt-8">
            <p className="text-xs text-gray-400 text-center mb-3">Quick login with demo accounts</p>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => fillDemo("admin")}
                className="p-3 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-center">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-1.5 text-sm font-bold text-emerald-700">AK</div>
                <p className="text-xs font-medium">Admin</p>
              </button>
              <button onClick={() => fillDemo("dispatcher")}
                className="p-3 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1.5 text-sm font-bold text-blue-700">FA</div>
                <p className="text-xs font-medium">Dispatcher</p>
              </button>
              <button onClick={() => fillDemo("driver")}
                className="p-3 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1.5 text-sm font-bold text-purple-700">JM</div>
                <p className="text-xs font-medium">Driver</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
