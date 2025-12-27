"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
    email: string;
    role: string;
    name: string;
}

const STATS = [
    { label: "Total Tenant", value: "24", icon: "store", color: "text-blue-400" },
    { label: "Tenant Aktif", value: "21", icon: "check_circle", color: "text-emerald-400" },
    { label: "User Terdaftar", value: "156", icon: "group", color: "text-purple-400" },
    { label: "Pendapatan", value: "Rp 12.5M", icon: "payments", color: "text-amber-400" },
];

const TENANTS = [
    { name: "Warung Kopi Pak Budi", owner: "Budi Santoso", plan: "Pro", status: "active" },
    { name: "Bakso Mas Joko", owner: "Joko Widodo", plan: "Basic", status: "active" },
    { name: "Toko Roti Manis", owner: "Sari Dewi", plan: "Pro", status: "active" },
    { name: "Ayam Geprek Bu Tini", owner: "Tini Sumarni", plan: "Basic", status: "expired" },
];

const LOGS = [
    { time: "14:32", event: "Tenant baru: Kedai Nasi Uduk", icon: "add_business", color: "text-blue-400" },
    { time: "14:15", event: "User login: admin@demo.com", icon: "person", color: "text-purple-400" },
    { time: "13:58", event: "Payment: Warung Kopi", icon: "payments", color: "text-emerald-400" },
    { time: "13:42", event: "System backup completed", icon: "backup", color: "text-white/50" },
];

export default function AdminPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [search, setSearch] = useState("");
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (!savedUser) { router.push("/"); return; }
        const parsed = JSON.parse(savedUser);
        if (parsed.role !== "ADMIN") { router.push("/"); return; }
        setUser(parsed);

        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, [router]);

    const handleLogout = () => { localStorage.removeItem("user"); router.push("/"); };
    const formatDate = (d: Date) => d.toLocaleDateString("id-ID", { weekday: "short", day: "2-digit", month: "short" });
    const formatTime = (d: Date) => d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    if (!user) return null;

    return (
        <div className="flex flex-col h-screen w-full bg-slate-900 overflow-hidden text-sm selection:bg-primary/30">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px]" />
            </div>

            {/* HEADER - LARGER & FULL WIDTH */}
            <header className="relative z-20 flex items-center gap-6 h-20 px-4 bg-slate-800/60 border-b border-white/5 flex-shrink-0 backdrop-blur-md">
                {/* Logo & Badge */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
                        <img src="/logo.png" alt="KasirAI" className="w-7 h-7 object-contain brightness-0 invert" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Panel</h1>
                            <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded border border-primary/20">SUPER ADMIN</span>
                        </div>
                        <p className="text-white/40 text-sm">Kelola semua tenant dan sistem</p>
                    </div>
                </div>

                {/* Search Bar - Centered/Right */}
                <div className="flex-1 max-w-lg ml-auto hidden lg:block">
                    <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors">
                            <span className="material-symbols-outlined">search</span>
                        </span>
                        <input
                            type="text"
                            placeholder="Cari tenant, user, atau log sistem..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:bg-slate-900 focus:border-primary/50 transition-all font-medium"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                            <span className="w-6 h-6 rounded flex items-center justify-center bg-white/5 border border-white/5 text-[10px] text-white/30 font-mono">⌘</span>
                            <span className="w-6 h-6 rounded flex items-center justify-center bg-white/5 border border-white/5 text-[10px] text-white/30 font-mono">K</span>
                        </div>
                    </div>
                </div>

                {/* Right Side Elements */}
                <div className="ml-auto flex items-center gap-6">
                    {/* System Status Info */}
                    <div className="hidden lg:flex flex-col items-end mr-4">
                        <span className="text-white font-semibold text-base mb-0.5">System Status</span>
                        <div className="flex items-center gap-2 text-white/50 text-xs font-medium bg-white/5 px-2 py-1 rounded-md">
                            <span className="material-symbols-outlined text-sm text-emerald-400">check_circle</span>
                            <span className="text-emerald-400 uppercase font-bold tracking-wide">NORMAL</span>
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
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-purple-500/20 border-2 border-slate-800 ring-2 ring-purple-500/30">
                            {user.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="hidden lg:block">
                            <p className="text-white font-bold text-base leading-tight mb-0.5">{user.name}</p>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 uppercase tracking-wide border border-purple-500/20">
                                ADMIN
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
                    <button className="w-12 h-12 rounded-xl text-white/40 hover:bg-white/5 hover:text-white flex items-center justify-center transition-all" title="Tenant">
                        <span className="material-symbols-outlined text-2xl">store</span>
                    </button>
                    <button className="w-12 h-12 rounded-xl text-white/40 hover:bg-white/5 hover:text-white flex items-center justify-center transition-all" title="Users">
                        <span className="material-symbols-outlined text-2xl">group</span>
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
                        {/* Tenant List */}
                        <div className="lg:col-span-2 bg-slate-800/40 rounded-2xl flex flex-col overflow-hidden border border-white/5">
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <h2 className="text-white font-bold text-lg">Daftar Tenant</h2>
                                <button className="h-10 px-4 bg-primary text-white text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                                    <span className="material-symbols-outlined text-xl">add</span>
                                    Tambah Tenant
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2">
                                {TENANTS.map((tenant) => (
                                    <div key={tenant.name} className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-xl transition-colors group cursor-pointer">
                                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-primary/30 group-hover:bg-primary/10 transition-colors">
                                            <span className="material-symbols-outlined text-white/50 group-hover:text-primary text-xl">store</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-semibold text-base">{tenant.name}</p>
                                            <p className="text-white/40 text-sm mt-0.5">{tenant.owner}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${tenant.plan === 'Pro' ? 'bg-primary/20 text-primary border-primary/20' : 'bg-white/10 text-white/50 border-white/10'}`}>
                                                {tenant.plan}
                                            </span>
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${tenant.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 'bg-red-500/20 text-red-400 border-red-500/20'}`}>
                                                {tenant.status === 'active' ? 'Aktif' : 'Expired'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* System Logs */}
                        <div className="bg-slate-800/40 rounded-2xl flex flex-col overflow-hidden border border-white/5">
                            <div className="p-6 border-b border-white/5 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-white/5 text-white/70">
                                    <span className="material-symbols-outlined text-xl">terminal</span>
                                </div>
                                <div>
                                    <h2 className="text-white font-bold text-lg">System Logs</h2>
                                    <p className="text-white/40 text-xs">Aktivitas sistem real-time</p>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                {LOGS.map((log, idx) => (
                                    <div key={idx} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                                        <span className={`material-symbols-outlined ${log.color} text-xl mt-0.5`}>{log.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white/90 text-sm font-medium truncate">{log.event}</p>
                                            <p className="text-white/30 text-xs mt-1 font-mono">{log.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - 1/3 Width */}
                <aside className="hidden xl:flex w-1/3 bg-slate-800/60 flex-col p-8 border-l border-white/5 backdrop-blur-md">
                    <h2 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">bolt</span>
                        Quick Actions
                    </h2>

                    <div className="space-y-4 mb-8">
                        <button className="w-full h-16 bg-gradient-to-r from-primary to-blue-600 rounded-2xl flex items-center px-6 gap-4 hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-all group active:scale-95 text-left">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                <span className="material-symbols-outlined text-white">add_business</span>
                            </div>
                            <div>
                                <p className="text-white font-bold">Tambah Tenant Baru</p>
                                <p className="text-white/60 text-xs font-normal">Setup store & database otomatis</p>
                            </div>
                        </button>

                        <button className="w-full h-16 bg-slate-700/50 hover:bg-slate-700 rounded-2xl flex items-center px-6 gap-4 border border-white/5 hover:border-white/10 transition-all text-left">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                <span className="material-symbols-outlined text-white/70">person_add</span>
                            </div>
                            <div>
                                <p className="text-white font-bold">Tambah User</p>
                                <p className="text-white/40 text-xs font-normal">Buat akun untuk staff/admin</p>
                            </div>
                        </button>

                        <button className="w-full h-16 bg-slate-700/50 hover:bg-slate-700 rounded-2xl flex items-center px-6 gap-4 border border-white/5 hover:border-white/10 transition-all text-left">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                <span className="material-symbols-outlined text-white/70">backup</span>
                            </div>
                            <div>
                                <p className="text-white font-bold">Backup Database</p>
                                <p className="text-white/40 text-xs font-normal">Snapshot manual database</p>
                            </div>
                        </button>
                    </div>

                    <div className="mt-auto p-6 bg-gradient-to-br from-indigo-900/50 to-blue-900/50 rounded-3xl border border-white/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-32 bg-blue-500/20 rounded-full blur-[80px] group-hover:bg-blue-500/30 transition-colors" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                                    <span className="material-symbols-outlined">dns</span>
                                </span>
                                <span className="text-emerald-400 font-bold text-sm tracking-widest">SYSTEM HEALTHY</span>
                            </div>

                            <p className="text-white/60 text-sm mb-1">Server Uptime</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-4xl font-bold text-white">99.99%</p>
                                <span className="text-xs text-emerald-400 font-medium">+0.01%</span>
                            </div>
                            <p className="text-white/40 text-xs mt-4">Last 30 days monitoring</p>
                        </div>
                    </div>
                </aside>
            </div>

            {/* FOOTER - FULL WIDTH */}
            <footer className="relative z-20 hidden md:flex h-10 bg-slate-800/80 border-t border-white/5 text-white/50 items-center px-6 text-xs font-medium gap-8 flex-shrink-0 backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                    </span>
                    <span className="tracking-wide text-white/80">ADMIN CONSOLE ACTIVE</span>
                </div>
                <div className="w-px h-3 bg-white/10" />
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">security</span>
                    <span>SECURE CONNECTION: <span className="text-emerald-400">ENCRYPTED</span></span>
                </div>
                <div className="flex-1" />
                <span className="text-white/30 font-mono">Build v2.1.4 (Stable)</span>
            </footer>

            {/* Mobile Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-800/90 backdrop-blur-sm flex items-center justify-around border-t border-white/5 z-50">
                <button className="flex flex-col items-center text-primary gap-1">
                    <span className="material-symbols-outlined text-2xl">dashboard</span>
                    <span className="text-[10px] font-medium">Dashboard</span>
                </button>
                <button className="flex flex-col items-center text-white/50 gap-1 hover:text-white">
                    <span className="material-symbols-outlined text-2xl">store</span>
                    <span className="text-[10px] font-medium">Tenant</span>
                </button>
                <button onClick={handleLogout} className="flex flex-col items-center text-white/50 gap-1 hover:text-white">
                    <span className="material-symbols-outlined text-2xl">logout</span>
                    <span className="text-[10px] font-medium">Keluar</span>
                </button>
            </nav>
        </div>
    );
}
