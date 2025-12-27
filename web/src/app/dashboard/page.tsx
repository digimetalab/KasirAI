"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
    email: string;
    role: string;
    name: string;
}

const STATS = [
    { label: "Penjualan Hari Ini", value: "Rp 2.4M", icon: "payments", color: "text-emerald-400" },
    { label: "Transaksi", value: "47", icon: "receipt_long", color: "text-blue-400" },
    { label: "Pelanggan Baru", value: "12", icon: "person_add", color: "text-purple-400" },
    { label: "Produk Terjual", value: "156", icon: "inventory", color: "text-amber-400" },
];

const TRANSACTIONS = [
    { id: "TRX-001", customer: "Budi Santoso", amount: 125000, time: "14:32" },
    { id: "TRX-002", customer: "Sari Dewi", amount: 85000, time: "14:15" },
    { id: "TRX-003", customer: "Andi Pratama", amount: 210000, time: "13:58" },
    { id: "TRX-004", customer: "Guest", amount: 45000, time: "13:42" },
];

const INSIGHTS = [
    { icon: "trending_up", text: "Penjualan naik 15% dari minggu lalu", color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { icon: "inventory_2", text: "Stok Kopi Susu tinggal 10 unit", color: "text-amber-400", bg: "bg-amber-500/10" },
    { icon: "schedule", text: "Jam ramai: 11:00 - 14:00", color: "text-blue-400", bg: "bg-blue-500/10" },
];

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (!savedUser) { router.push("/"); return; }
        const parsed = JSON.parse(savedUser);
        if (parsed.role !== "OWNER") { router.push("/"); return; }
        setUser(parsed);

        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, [router]);

    const handleLogout = () => { localStorage.removeItem("user"); router.push("/"); };
    const formatRp = (num: number) => `Rp ${num.toLocaleString("id-ID")}`;
    const formatDate = (d: Date) => d.toLocaleDateString("id-ID", { weekday: "short", day: "2-digit", month: "short" });
    const formatTime = (d: Date) => d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    if (!user) return null;

    return (
        <div className="flex flex-col h-screen w-full bg-slate-900 overflow-hidden text-sm selection:bg-primary/30">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px]" />
            </div>

            {/* HEADER - LARGER & FULL WIDTH */}
            <header className="relative z-20 flex items-center gap-6 h-20 px-4 bg-slate-800/60 border-b border-white/5 flex-shrink-0 backdrop-blur-md">
                {/* Logo */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
                    <img src="/logo.png" alt="KasirAI" className="w-7 h-7 object-contain brightness-0 invert" />
                </div>

                {/* Page Title */}
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
                    <p className="text-white/40 text-sm">Overview performa bisnis Anda</p>
                </div>

                {/* Right Side Elements */}
                <div className="ml-auto flex items-center gap-6">
                    {/* Store Status Info */}
                    <div className="hidden lg:flex flex-col items-end mr-4">
                        <span className="text-white font-semibold text-base mb-0.5">Status Toko</span>
                        <div className="flex items-center gap-2 text-white/50 text-xs font-medium bg-white/5 px-2 py-1 rounded-md">
                            <span className="material-symbols-outlined text-sm text-emerald-400">store</span>
                            <span className="text-emerald-400 uppercase font-bold tracking-wide">BUKA</span>
                            <span className="mx-1">•</span>
                            {formatDate(currentTime)}
                        </div>
                    </div>

                    {/* Notification */}
                    <button className="hidden lg:flex w-12 h-12 rounded-xl bg-white/5 text-white/60 items-center justify-center hover:bg-white/10 hover:text-white transition-colors relative border border-white/5">
                        <span className="material-symbols-outlined text-2xl">notifications</span>
                        <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900 shadow-sm shadow-red-500/50" />
                    </button>

                    {/* Separator */}
                    <div className="hidden lg:block w-px h-10 bg-white/10" />

                    {/* User */}
                    <div className="flex items-center gap-4 pl-2">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-blue-500/20 border-2 border-slate-800 ring-2 ring-blue-500/30">
                            {user.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="hidden lg:block">
                            <p className="text-white font-bold text-base leading-tight mb-0.5">{user.name}</p>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary uppercase tracking-wide border border-primary/20">
                                OWNER
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* MAIN LAYOUT */}
            <div className="relative z-10 flex flex-1 min-h-0">
                {/* Sidebar */}
                <aside className="hidden md:flex w-20 bg-slate-800/40 flex-col items-center py-6 gap-4 flex-shrink-0 border-r border-white/5 backdrop-blur-sm">
                    <button className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 transition-transform active:scale-95" title="Dashboard">
                        <span className="material-symbols-outlined text-2xl">dashboard</span>
                    </button>
                    <button className="w-12 h-12 rounded-xl text-white/40 hover:bg-white/5 hover:text-white flex items-center justify-center transition-all" title="Laporan">
                        <span className="material-symbols-outlined text-2xl">bar_chart</span>
                    </button>
                    <button className="w-12 h-12 rounded-xl text-white/40 hover:bg-white/5 hover:text-white flex items-center justify-center transition-all" title="Produk">
                        <span className="material-symbols-outlined text-2xl">inventory_2</span>
                    </button>

                    <div className="flex-1" />

                    <button className="w-12 h-12 rounded-xl text-white/40 hover:bg-white/5 hover:text-white flex items-center justify-center transition-all" title="Pengaturan">
                        <span className="material-symbols-outlined text-2xl">settings</span>
                    </button>
                    <button onClick={handleLogout} className="w-12 h-12 rounded-xl text-white/40 hover:bg-red-500/10 hover:text-red-400 flex items-center justify-center transition-all" title="Keluar">
                        <span className="material-symbols-outlined text-2xl">logout</span>
                    </button>
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0 p-6 bg-slate-900/50 overflow-y-auto">
                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {STATS.map((stat) => (
                            <div key={stat.label} className="p-6 bg-slate-800/40 rounded-2xl border border-white/5 hover:bg-slate-800/60 transition-all hover:border-white/10 group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-xl bg-white/5 ${stat.color} group-hover:scale-110 transition-transform`}>
                                        <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
                                    </div>
                                    <span className="material-symbols-outlined text-white/20">more_horiz</span>
                                </div>
                                <p className="text-3xl font-bold text-white mb-1 tracking-tight">{stat.value}</p>
                                <p className="text-white/40 text-sm font-medium">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Content Grid */}
                    <div className="flex-1 grid lg:grid-cols-3 gap-6 min-h-0">
                        {/* Transactions */}
                        <div className="lg:col-span-2 bg-slate-800/40 rounded-2xl flex flex-col overflow-hidden border border-white/5">
                            <div className="p-6 border-b border-white/5 flex justify-between items-center">
                                <h2 className="text-white font-bold text-lg">Transaksi Terbaru</h2>
                                <button className="text-primary text-sm font-medium hover:underline">Lihat Semua</button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2">
                                {TRANSACTIONS.map((tx) => (
                                    <div key={tx.id} className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-xl transition-colors cursor-pointer group">
                                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-primary/30 group-hover:bg-primary/10 transition-colors">
                                            <span className="material-symbols-outlined text-white/50 group-hover:text-primary text-xl">receipt</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-semibold text-base">{tx.customer}</p>
                                            <div className="flex items-center gap-2 text-white/40 text-xs mt-0.5">
                                                <span className="font-mono">{tx.id}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[10px]">schedule</span>
                                                    {tx.time}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-primary font-bold text-base">{formatRp(tx.amount)}</p>
                                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20">Success</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AI Insights */}
                        <div className="bg-slate-800/40 rounded-2xl flex flex-col overflow-hidden border border-white/5">
                            <div className="p-6 border-b border-white/5 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/20 text-primary">
                                    <span className="material-symbols-outlined text-xl">auto_awesome</span>
                                </div>
                                <div>
                                    <h2 className="text-white font-bold text-lg">AI Insights</h2>
                                    <p className="text-white/40 text-xs">Analisa cerdas harian</p>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                {INSIGHTS.map((insight, idx) => (
                                    <div key={idx} className={`p-4 ${insight.bg} rounded-xl border border-white/5 hover:opacity-90 transition-opacity`}>
                                        <div className="flex items-start gap-4">
                                            <span className={`material-symbols-outlined ${insight.color} text-2xl mt-0.5`}>{insight.icon}</span>
                                            <p className="text-white/90 text-sm font-medium leading-relaxed">{insight.text}</p>
                                        </div>
                                    </div>
                                ))}
                                <button className="w-full h-10 rounded-xl bg-white/5 text-white/50 text-sm font-medium hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center gap-2">
                                    Generate More
                                    <span className="material-symbols-outlined text-base">refresh</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - 1/3 Width */}
                <aside className="hidden xl:flex w-1/3 bg-slate-800/60 flex-col p-8 border-l border-white/5 backdrop-blur-md">
                    <h2 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">analytics</span>
                        Ringkasan
                    </h2>

                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 mb-6 border border-white/5 shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-white font-semibold flex items-center gap-2 text-sm">
                                <span className="w-2 h-2 rounded-full bg-primary" />
                                Penjualan 7 Hari
                            </p>
                            <button className="text-primary text-xs font-bold hover:underline">DETAIL</button>
                        </div>

                        <div className="h-40 flex items-end gap-3">
                            {[40, 65, 45, 80, 60, 90, 75].map((h, i) => (
                                <div key={i} className="flex-1 group relative">
                                    <div
                                        className="w-full bg-gradient-to-t from-primary/50 to-blue-500/50 rounded-t-lg transition-all group-hover:from-primary group-hover:to-blue-500"
                                        style={{ height: `${h}%` }}
                                    />
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none transform translate-y-2 group-hover:translate-y-0">
                                        {h}%
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-4 text-white/30 text-xs font-medium uppercase">
                            <span>Mon</span>
                            <span>Tue</span>
                            <span>Wed</span>
                            <span>Thu</span>
                            <span>Fri</span>
                            <span>Sat</span>
                            <span>Sun</span>
                        </div>
                    </div>

                    <div className="mb-6 flex-1">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-white font-semibold text-sm">Produk Terlaris</p>
                            <span className="text-white/30 text-xs">Top 3</span>
                        </div>
                        <div className="space-y-3">
                            {["Kopi Susu Gula Aren", "Ayam Goreng", "Es Teh Manis"].map((p, i) => (
                                <div key={p} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                                    <span className={`w-8 h-8 rounded-lg ${i === 0 ? 'bg-amber-500/20 text-amber-500' : 'bg-white/10 text-white/50'} text-sm font-bold flex items-center justify-center`}>
                                        {i + 1}
                                    </span>
                                    <div className="flex-1">
                                        <p className="text-white text-sm font-semibold">{p}</p>
                                        <p className="text-white/40 text-xs">{156 - (i * 24)} terjual</p>
                                    </div>
                                    <span className="material-symbols-outlined text-white/20">chevron_right</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto">
                        <button className="w-full h-14 bg-gradient-to-r from-primary to-blue-600 hover:scale-[1.02] active:scale-95 text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-primary/20 transition-all">
                            <span className="material-symbols-outlined text-2xl">download</span>
                            Export Laporan Lengkap
                        </button>
                    </div>
                </aside>
            </div>

            {/* FOOTER - FULL WIDTH */}
            <footer className="relative z-20 hidden md:flex h-10 bg-slate-800/80 border-t border-white/5 text-white/50 items-center px-6 text-xs font-medium gap-8 flex-shrink-0 backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="tracking-wide text-white/80">SYSTEM ONLINE</span>
                </div>
                <div className="w-px h-3 bg-white/10" />
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">cloud_sync</span>
                    <span>LAST SYNC: <span className="text-white/80">JUST NOW</span></span>
                </div>
                <div className="flex-1" />
                <span className="text-white/30 font-mono">v1.2.0-beta</span>
            </footer>

            {/* Mobile Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-800/90 backdrop-blur-sm flex items-center justify-around border-t border-white/5 z-50">
                <button className="flex flex-col items-center text-primary gap-1">
                    <span className="material-symbols-outlined text-2xl">dashboard</span>
                    <span className="text-[10px] font-medium">Dashboard</span>
                </button>
                <button className="flex flex-col items-center text-white/50 gap-1 hover:text-white">
                    <span className="material-symbols-outlined text-2xl">bar_chart</span>
                    <span className="text-[10px] font-medium">Laporan</span>
                </button>
                <button onClick={handleLogout} className="flex flex-col items-center text-white/50 gap-1 hover:text-white">
                    <span className="material-symbols-outlined text-2xl">logout</span>
                    <span className="text-[10px] font-medium">Keluar</span>
                </button>
            </nav>
        </div>
    );
}
