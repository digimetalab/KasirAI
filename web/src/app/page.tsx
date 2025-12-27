"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const DEMO_USERS = {
  "kasir@demo.com": { password: "kasir123", role: "CASHIER", name: "Demo Kasir" },
  "owner@demo.com": { password: "owner123", role: "OWNER", name: "Demo Owner" },
  "admin@demo.com": { password: "admin123", role: "ADMIN", name: "Demo Admin" },
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 600));
    const user = DEMO_USERS[email as keyof typeof DEMO_USERS];

    if (user && user.password === password) {
      localStorage.setItem("user", JSON.stringify({ email, role: user.role, name: user.name }));
      switch (user.role) {
        case "CASHIER": router.push("/pos"); break;
        case "OWNER": router.push("/dashboard"); break;
        case "ADMIN": router.push("/admin"); break;
      }
    } else {
      setError("Email atau kata sandi salah");
      setLoading(false);
    }
  };

  const quickLogin = (role: "CASHIER" | "OWNER" | "ADMIN") => {
    const users = {
      CASHIER: { email: "kasir@demo.com", name: "Demo Kasir" },
      OWNER: { email: "owner@demo.com", name: "Demo Owner" },
      ADMIN: { email: "admin@demo.com", name: "Demo Admin" },
    };
    const user = users[role];
    localStorage.setItem("user", JSON.stringify({ email: user.email, role, name: user.name }));
    router.push(role === "CASHIER" ? "/pos" : role === "OWNER" ? "/dashboard" : "/admin");
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-900 text-sm selection:bg-primary/30">
      {/* Background - Minimalist, no harsh blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 flex w-full h-full">
        {/* LEFT - Info Panel - Futuristic & Data Focused */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-16 bg-slate-900/50 backdrop-blur-md relative h-full overflow-hidden">

          {/* Background Ambient Glow */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[10%] left-[20%] w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[10%] right-[20%] w-96 h-96 bg-purple-600/10 rounded-full blur-[100px]" />
          </div>

          <div className="relative z-10 flex flex-col gap-10">

            {/* 1. Branding - Massive Focal Point */}
            <div>
              <div className="flex items-center gap-6 mb-2">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-2xl shadow-primary/40">
                  <img src="/logo.png" alt="KasirAI" className="w-12 h-12 object-contain brightness-0 invert" />
                </div>
                <div>
                  <h1 className="text-6xl font-bold text-white tracking-tight leading-none mb-2 drop-shadow-lg">KasirAI</h1>
                  <p className="text-blue-200 text-xl font-medium tracking-wide">Future of Retail POS</p>
                </div>
              </div>
            </div>

            {/* 2. Main Hero: Sales Graph (The "Button-like" Graph) */}
            <div className="relative w-full rounded-[2.5rem] bg-gradient-to-r from-blue-600 to-indigo-600 p-8 shadow-[0_20px_50px_-12px_rgba(79,70,229,0.4)] group hover:scale-[1.01] transition-transform duration-500 cursor-default border-t border-white/20">
              {/* Decorative Shine */}
              <div className="absolute -top-[100%] -left-[100%] w-[300%] h-[300%] bg-white/5 rotate-45 pointer-events-none group-hover:top-[100%] transition-all duration-1000" />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                        <span className="material-symbols-outlined text-white">monitoring</span>
                      </div>
                      <span className="text-indigo-100 font-bold uppercase tracking-wider text-sm">Live Sales</span>
                    </div>
                    <h2 className="text-5xl font-bold text-white tracking-tight">Rp 2.850.000</h2>
                    <p className="text-indigo-200 font-medium mt-1">Total pendapatan hari ini</p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-2 text-white shadow-lg">
                      <span className="material-symbols-outlined text-emerald-300">trending_up</span>
                      <span className="font-bold text-lg">+16.4%</span>
                    </div>
                    <span className="text-indigo-200 text-xs font-medium bg-indigo-900/30 px-2 py-1 rounded-lg">7 Hari Terakhir</span>
                  </div>
                </div>

                {/* The Graph */}
                <div className="flex flex-col gap-4">

                  {/* Bars Container */}
                  <div className="h-32 flex items-end justify-between gap-3">
                    {[
                      { h: 45, d: "Sen" },
                      { h: 60, d: "Sel" },
                      { h: 35, d: "Rab" },
                      { h: 75, d: "Kam" },
                      { h: 55, d: "Jum" },
                      { h: 90, d: "Sab" },
                      { h: 70, d: "Min" }
                    ].map((item, i) => {
                      // Dynamic Color Logic
                      let barColor = "bg-white/70";
                      if (item.h >= 80) barColor = "bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.6)]"; // High
                      else if (item.h <= 40) barColor = "bg-amber-300/80"; // Low
                      else if (i === 6) barColor = "bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)]"; // Today (highlight)

                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar h-full justify-end">
                          <div className="w-full relative h-[85%] rounded-2xl bg-white/10 backdrop-blur-sm overflow-hidden flex items-end">
                            <div
                              className={`w-full rounded-2xl transition-all duration-1000 ease-out ${barColor}`}
                              style={{ height: `${item.h}%` }}
                            />
                          </div>
                          <span className="text-white/60 text-[10px] font-medium uppercase tracking-wider">{item.d}</span>

                          {/* Tooltip value */}
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity text-white text-xs font-bold bg-black/50 px-2 py-1 rounded-lg backdrop-blur-md z-20 pointer-events-none">
                            {item.h}%
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-6 pt-2 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      <span className="text-indigo-100 text-[10px] font-medium">Ramai ({'>'}80%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                      <span className="text-indigo-100 text-[10px] font-medium">Stabil</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-300/80" />
                      <span className="text-indigo-100 text-[10px] font-medium">Sepi ({'<'}40%)</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* 3. Info Grid: Insights & News */}
            <div className="grid grid-cols-2 gap-8 h-full min-h-0">
              {/* AI Insight */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 text-white">
                  <span className="material-symbols-outlined text-amber-400 text-2xl">auto_awesome</span>
                  <span className="font-bold text-lg tracking-wide">AI Highlights</span>
                </div>
                <div className="bg-slate-800/30 backdrop-blur-md rounded-3xl p-6 border border-white/5 hover:bg-slate-800/50 transition-colors flex-1 shadow-lg">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                      <span className="material-symbols-outlined">inventory_2</span>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg">Stok Kritis!</h4>
                      <p className="text-white/60 leading-relaxed text-sm">Kopi Susu Gula Aren tersisa 5 cup. Restock segera.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                      <span className="material-symbols-outlined">schedule</span>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg">Peak Hour</h4>
                      <p className="text-white/60 leading-relaxed text-sm">Prediksi ramai pukul 12:00. Siapkan staff tambahan.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Store News */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 text-white">
                  <span className="material-symbols-outlined text-emerald-400 text-2xl">campaign</span>
                  <span className="font-bold text-lg tracking-wide">Info Toko</span>
                </div>
                <div className="bg-slate-800/30 backdrop-blur-md rounded-3xl p-6 border border-white/5 hover:bg-slate-800/50 transition-colors flex-1 shadow-lg flex flex-col justify-center">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider bg-emerald-400/10 px-2 py-1 rounded-lg">Active Promo</span>
                      <span className="text-white/30 text-xs">Valid Today</span>
                    </div>
                    <h4 className="text-white font-bold text-xl leading-tight">Diskon 50% All Item</h4>
                    <p className="text-white/50 text-sm mt-1">Khusus member baru.</p>
                  </div>
                  <div className="w-full h-px bg-white/10 my-2"></div>
                  <div>
                    <p className="text-white/80 text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-white/40 text-sm">calendar_month</span>
                      Libur Idul Fitri: 10-12 April
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT - Login Form - Clean & Dark */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center bg-slate-900 p-8 md:p-16 lg:p-24 relative">

          {/* Top Right: Date & Time */}
          <div className="absolute top-8 right-8 text-right z-20">
            <h2 className="text-2xl font-bold text-white tracking-widest font-mono">
              {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </h2>
            <p className="text-white/40 text-xs font-medium capitalize mt-1">
              {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Bottom Left: Store Info (New Request) */}
          <div className="absolute bottom-8 left-8 z-20 hidden lg:block text-left">
            <h3 className="text-lg font-bold text-white mb-1">KasirAI Coffee Spot</h3>
            <div className="space-y-0.5 text-white/40 text-xs font-medium">
              <p>Jl. Digital No. 88, Renon</p>
              <p>0812-3456-7890</p>
            </div>
          </div>

          <div className="w-full max-w-sm mx-auto relative z-10">
            {/* Mobile Logo */}
            <div className="flex lg:hidden items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <img src="/logo.png" alt="KasirAI" className="w-5 h-5 object-contain brightness-0 invert" />
              </div>
              <span className="text-lg font-bold text-white">KasirAI</span>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Selamat Datang Kembali</h2>
              <p className="text-white/40">Masuk ke akun Anda untuk melanjutkan</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg">error</span>
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-white/60 text-xs font-medium ml-1">Email Address</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[20px]">mail</span>
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:bg-slate-800 focus:border-primary/50 transition-all font-medium"
                      placeholder="nama@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-white/60 text-xs font-medium ml-1">Password</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[20px]">lock</span>
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 pl-11 pr-12 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:bg-slate-800 focus:border-primary/50 transition-all font-medium"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 p-1 rounded hover:bg-white/5 transition-all"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? "visibility" : "visibility_off"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${rememberMe ? "bg-primary border-primary" : "bg-transparent border-white/20 group-hover:border-white/40"}`}>
                    {rememberMe && <span className="material-symbols-outlined text-[10px] text-white">check</span>}
                  </div>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="hidden"
                  />
                  <span className="text-white/50 text-xs group-hover:text-white/70 transition-colors">Ingat saya</span>
                </label>
                <button type="button" className="text-primary text-xs font-medium hover:text-primary-light transition-colors">Lupa Password?</button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl disabled:opacity-50 transition-all shadow-lg shadow-primary/25 active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  "Masuk"
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/5">
              <p className="text-white/30 text-xs text-center mb-4 font-medium uppercase tracking-wider">Demo Access</p>
              <div className="grid grid-cols-3 gap-3">
                <button onClick={() => quickLogin("ADMIN")} className="h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-white/60 hover:text-white text-xs font-semibold border border-white/5 transition-all">
                  Admin
                </button>
                <button onClick={() => quickLogin("OWNER")} className="h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-white/60 hover:text-white text-xs font-semibold border border-white/5 transition-all">
                  Owner
                </button>
                <button onClick={() => quickLogin("CASHIER")} className="h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-white/60 hover:text-white text-xs font-semibold border border-white/5 transition-all">
                  Cashier
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
