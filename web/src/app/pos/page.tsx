"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
    email: string;
    role: string;
    name: string;
}

interface Product {
    id: string;
    sku: string;
    name: string;
    price: number;
    stock: number;
    category: string;
    image: string;
}

interface CartItem extends Product {
    qty: number;
}

const PRODUCTS: Product[] = [
    { id: "1", sku: "DRK-001", name: "Kopi Susu Gula Aren", price: 18000, stock: 100, category: "Beverage", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=200&h=200&fit=crop" },
    { id: "2", sku: "FOD-001", name: "Ayam Goreng Sambal Matah", price: 25000, stock: 50, category: "Food", image: "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=200&h=200&fit=crop" },
    { id: "3", sku: "FOD-002", name: "Nasi Putih Pulen", price: 5000, stock: 200, category: "Food", image: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=200&h=200&fit=crop" },
    { id: "4", sku: "DRK-002", name: "Es Teh Manis Jumbo", price: 6000, stock: 150, category: "Beverage", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&h=200&fit=crop" },
    { id: "5", sku: "SNK-001", name: "Pisang Goreng Keju", price: 15000, stock: 40, category: "Snack", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=200&h=200&fit=crop" },
    { id: "6", sku: "FOD-003", name: "Mie Goreng Spesial", price: 22000, stock: 80, category: "Food", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200&h=200&fit=crop" },
    { id: "7", sku: "SNK-002", name: "Dimsum Ayam (4 pcs)", price: 16000, stock: 60, category: "Snack", image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=200&h=200&fit=crop" },
    { id: "8", sku: "DRK-003", name: "Jus Alpukat", price: 15000, stock: 30, category: "Beverage", image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=200&h=200&fit=crop" },
];

const CATEGORIES = [
    { key: "Semua", icon: "apps", label: "Semua" },
    { key: "Food", icon: "restaurant", label: "Food" },
    { key: "Beverage", icon: "local_cafe", label: "Beverage" },
    { key: "Snack", icon: "cookie", label: "Snack" },
    { key: "Promo", icon: "sell", label: "Promo" },
];

export default function POSPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("Semua");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [memberTab, setMemberTab] = useState<"member" | "guest">("member");
    const [memberSearch, setMemberSearch] = useState("");
    const [showCart, setShowCart] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [processingPayment, setProcessingPayment] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [orderNumber, setOrderNumber] = useState(6089);

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (!savedUser) { router.push("/"); return; }
        const parsed = JSON.parse(savedUser);
        if (parsed.role !== "CASHIER") { router.push("/"); return; }
        setUser(parsed);

        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        setOrderNumber(Math.floor(Math.random() * 9000) + 1000);
        return () => clearInterval(timer);
    }, [router]);

    const addToCart = (product: Product) => {
        setCart((prev) => {
            const exists = prev.find((item) => item.id === product.id);
            if (exists) return prev.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
            return [...prev, { ...product, qty: 1 }];
        });
    };

    const updateQty = (id: string, delta: number) => {
        setCart((prev) => prev.map((item) => {
            if (item.id === id) {
                const newQty = item.qty + delta;
                return newQty > 0 ? { ...item, qty: newQty } : null;
            }
            return item;
        }).filter(Boolean) as CartItem[]);
    };

    const removeFromCart = (id: string) => setCart((prev) => prev.filter((item) => item.id !== id));

    const handlePayment = () => {
        setProcessingPayment(true);
        setTimeout(() => {
            setProcessingPayment(false);
            setPaymentSuccess(true);
            setTimeout(() => {
                setPaymentSuccess(false);
                setCart([]);
                setOrderNumber(prev => prev + 1);
            }, 2000);
        }, 1500);
    };

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const tax = Math.round(subtotal * 0.11);
    const total = subtotal + tax;
    const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

    const filteredProducts = PRODUCTS.filter((p) => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchCategory = category === "Semua" || p.category === category;
        return matchSearch && matchCategory;
    });

    const handleLogout = () => { localStorage.removeItem("user"); router.push("/"); };
    const formatRp = (num: number) => `Rp ${num.toLocaleString("id-ID")}`;
    const formatDate = (d: Date) => d.toLocaleDateString("id-ID", { weekday: "short", day: "2-digit", month: "short" });
    const formatTime = (d: Date) => d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    if (!user) return null;

    return (
        <div className="flex flex-col h-screen w-full bg-slate-900 overflow-hidden text-sm selection:bg-primary/30">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
            </div>

            {/* HEADER - LARGER & CLEANER */}
            {/* Height increased to h-20 (80px) */}
            <header className="relative z-20 flex items-center gap-6 h-20 px-4 bg-slate-800/60 border-b border-white/5 flex-shrink-0 backdrop-blur-md">
                {/* Logo */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
                    <img src="/logo.png" alt="KasirAI" className="w-7 h-7 object-contain brightness-0 invert" />
                </div>

                {/* Search - Larger Input */}
                <div className="flex-1 max-w-2xl relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                        <span className="material-symbols-outlined text-2xl">search</span>
                    </span>
                    <input
                        type="text"
                        placeholder="Cari produk (Scan Barcode / ketik nama)..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-12 pl-12 pr-12 rounded-xl bg-slate-900/50 border border-white/5 text-white text-base placeholder:text-white/30 focus:outline-none focus:bg-slate-900/80 focus:border-primary/50 transition-all font-medium"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white/5 text-white/50 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-xl">qr_code_scanner</span>
                    </button>
                </div>

                {/* Right Side Elements grouped far right */}
                <div className="ml-auto flex items-center gap-6">
                    {/* Shift Info */}
                    <div className="hidden lg:flex flex-col items-end mr-4">
                        <span className="text-white font-semibold text-base mb-0.5">Shift Pagi</span>
                        <div className="flex items-center gap-2 text-white/50 text-xs font-medium bg-white/5 px-2 py-1 rounded-md">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            {formatDate(currentTime)} • {formatTime(currentTime)}
                        </div>
                    </div>

                    {/* Notification */}
                    <button className="hidden lg:flex w-12 h-12 rounded-xl bg-white/5 text-white/60 items-center justify-center hover:bg-white/10 hover:text-white transition-colors relative border border-white/5">
                        <span className="material-symbols-outlined text-2xl">notifications</span>
                        <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900 shadow-sm shadow-red-500/50 animate-pulse" />
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
                                CASHIER
                            </span>
                        </div>
                    </div>
                </div>

                {/* Mobile cart button */}
                <button onClick={() => setShowCart(true)} className="xl:hidden relative w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
                    <span className="material-symbols-outlined text-2xl">shopping_cart</span>
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-slate-900">{cartCount}</span>
                    )}
                </button>
            </header>

            {/* MAIN AREA */}
            <div className="relative z-10 flex flex-1 min-h-0">
                {/* Left Sidebar - Icons */}
                <aside className="hidden md:flex w-20 bg-slate-800/40 flex-col items-center py-6 gap-4 flex-shrink-0 border-r border-white/5 backdrop-blur-sm">
                    <button className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 transition-transform active:scale-95" title="Menu">
                        <span className="material-symbols-outlined text-2xl">grid_view</span>
                    </button>
                    <button className="w-12 h-12 rounded-xl text-white/40 hover:bg-white/5 hover:text-white flex items-center justify-center transition-all" title="Riwayat">
                        <span className="material-symbols-outlined text-2xl">receipt_long</span>
                    </button>
                    <button className="w-12 h-12 rounded-xl text-white/40 hover:bg-white/5 hover:text-white flex items-center justify-center transition-all" title="Laporan">
                        <span className="material-symbols-outlined text-2xl">history</span>
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
                <div className="flex-1 flex flex-col min-w-0 bg-slate-900/50">
                    {/* Categories - Larger Tabs */}
                    <div className="flex items-center gap-3 px-6 py-4 flex-shrink-0 overflow-x-auto pb-4 scrollbar-hide">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.key}
                                onClick={() => setCategory(cat.key)}
                                className={`h-11 px-5 rounded-xl text-sm font-semibold flex items-center gap-2.5 transition-all shadow-sm ${category === cat.key
                                    ? "bg-primary text-white shadow-primary/20 scale-105"
                                    : "bg-slate-800/80 text-white/60 hover:bg-slate-700 hover:text-white border border-white/5"
                                    }`}
                            >
                                <span className={`material-symbols-outlined ${category === cat.key ? "text-[22px]" : "text-xl"}`}>{cat.icon}</span>
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                            {filteredProducts.map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className="bg-slate-800/40 rounded-2xl overflow-hidden hover:bg-slate-700/60 transition-all text-left group border border-white/5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98]"
                                >
                                    <div className="aspect-[4/3] bg-slate-700/30 relative overflow-hidden">
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        <span className="absolute top-3 left-3 px-2 py-1 bg-slate-900/90 text-white text-[10px] font-bold tracking-wider rounded-md backdrop-blur-md border border-white/10 shadow-sm">
                                            {product.sku}
                                        </span>
                                        {product.stock < 20 && (
                                            <span className="absolute bottom-3 right-3 px-2 py-1 bg-red-500/90 text-white text-[10px] font-bold rounded-md backdrop-blur-md shadow-sm">
                                                Sisa {product.stock}
                                            </span>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-white font-semibold text-sm truncate mb-1.5 leading-snug" title={product.name}>{product.name}</h3>
                                        <div className="flex items-end justify-between">
                                            <p className="text-primary font-bold text-base">{formatRp(product.price)}</p>
                                            <p className="text-white/40 text-xs font-medium">{product.category}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel - Cart - 1/3 Width */}
                <aside className="hidden xl:flex w-1/3 bg-slate-800/80 flex-col flex-shrink-0 border-l border-white/5 backdrop-blur-xl shadow-2xl shadow-black/50 relative z-30">
                    {/* Cart Header */}
                    <div className="p-6 border-b border-white/5 bg-slate-800/50">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <span className="material-symbols-outlined text-2xl">shopping_bag</span>
                                </div>
                                <div>
                                    <h2 className="text-white font-bold text-lg leading-tight">Keranjang</h2>
                                    <span className="text-xs text-white/40 font-medium">{cartCount} Item(s)</span>
                                </div>
                            </div>
                            <div className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                                <span className="text-xs text-primary font-bold tracking-wider">#{orderNumber}</span>
                            </div>
                        </div>

                        {/* Member / Guest Tabs - Larger */}
                        <div className="flex gap-2 p-1 bg-slate-900/50 rounded-xl border border-white/5">
                            <button
                                onClick={() => setMemberTab("member")}
                                className={`flex-1 h-10 rounded-lg text-sm font-semibold transition-all ${memberTab === "member" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-white/50 hover:text-white"
                                    }`}
                            >
                                Transaksi Member
                            </button>
                            <button
                                onClick={() => setMemberTab("guest")}
                                className={`flex-1 h-10 rounded-lg text-sm font-semibold transition-all ${memberTab === "guest" ? "bg-white/10 text-white shadow-md" : "text-white/50 hover:text-white"
                                    }`}
                            >
                                Tamu / Guest
                            </button>
                        </div>
                    </div>

                    {/* Member Search - Larger */}
                    {memberTab === "member" && (
                        <div className="px-6 py-4 border-b border-white/5 bg-slate-800/30">
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-xl">person_search</span>
                                </span>
                                <input
                                    type="text"
                                    placeholder="Cari member (Nama / HP)..."
                                    value={memberSearch}
                                    onChange={(e) => setMemberSearch(e.target.value)}
                                    className="w-full h-12 pl-12 pr-12 rounded-xl bg-slate-900/50 border border-white/5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:bg-slate-900/80 focus:border-primary/50 transition-all"
                                />
                                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1 rounded-md hover:bg-white/5 transition-all">
                                    <span className="material-symbols-outlined text-xl">qr_code</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Cart Items - Improved Spacing & Sizing */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-white/20 select-none">
                                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-5xl">remove_shopping_cart</span>
                                </div>
                                <p className="text-base font-medium">Keranjang Belanja Kosong</p>
                                <p className="text-xs mt-1">Silakan pilih produk untuk memulai transaksi</p>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div key={item.id} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/[0.07] transition-all group">
                                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover shadow-sm bg-slate-800" />
                                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                        <div>
                                            <div className="flex justify-between items-start gap-2">
                                                <p className="text-white text-sm font-semibold truncate leading-tight">{item.name}</p>
                                                <p className="text-white font-bold text-sm">{formatRp(item.price * item.qty)}</p>
                                            </div>
                                            <p className="text-white/40 text-xs mt-0.5">@{formatRp(item.price)}</p>
                                        </div>

                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-1 bg-slate-900/50 rounded-lg p-1 border border-white/5">
                                                <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-md bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors">
                                                    <span className="material-symbols-outlined text-sm">remove</span>
                                                </button>
                                                <span className="text-white font-bold text-sm w-8 text-center tabular-nums">{item.qty}</span>
                                                <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-md bg-primary text-white hover:bg-primary-600 flex items-center justify-center transition-colors">
                                                    <span className="material-symbols-outlined text-sm">add</span>
                                                </button>
                                            </div>
                                            <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        {/* Spacer for bottom scrolling */}
                        <div className="h-4"></div>
                    </div>

                    {/* Cart Footer - Larger Buttons */}
                    <div className="p-6 border-t border-white/5 bg-slate-800/90 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-white/60 font-medium">Subtotal</span>
                                <span className="text-white font-semibold">{formatRp(subtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-white/60 font-medium">Pajak (PPN 11%)</span>
                                <span className="text-white font-semibold">{formatRp(tax)}</span>
                            </div>
                            <div className="h-px bg-white/10 my-2" />
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">Total Tagihan</p>
                                    <p className="text-white text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">{formatRp(total)}</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={cart.length === 0 || processingPayment}
                            className="w-full h-16 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-bold text-lg rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-primary/25 transition-all active:scale-[0.98] relative overflow-hidden group"
                        >
                            {processingPayment ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-2xl group-hover:animate-bounce">payments</span>
                                    <span>Bayar Sekarang</span>
                                    <span className="material-symbols-outlined text-xl opacity-50 absolute right-6">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Success Modal Overlay */}
                    {paymentSuccess && (
                        <div className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
                            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                                <span className="material-symbols-outlined text-6xl text-green-500">check_circle</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Pembayaran Berhasil!</h3>
                            <p className="text-white/60 mb-8">Transaksi #{orderNumber} telah selesai.</p>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden max-w-[200px]">
                                <div className="h-full bg-green-500 animate-[progress_2s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
                            </div>
                        </div>
                    )}
                </aside>
            </div>

            {/* FOOTER/STATUS BAR - Clean & Consistent */}
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
                    <span>CORETAS SYNC: <span className="text-emerald-400">TERKONEKSI</span></span>
                </div>
                <div className="w-px h-3 bg-white/10" />
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">barcode_reader</span>
                    <span>SCANNER: <span className="text-blue-400">READY</span></span>
                </div>
                <div className="flex-1" />
                <span className="text-white/30 font-mono">v1.2.0-beta</span>
            </footer>

            {/* Mobile Cart Modal */}
            {showCart && (
                <div className="xl:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setShowCart(false)}>
                    {/* Simplified for brevity - Mobile view matches logic above */}
                    <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-slate-900 flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        {/* Reuse logic for mobile cart content */}
                        {/* ... (Implement similar to desktop cart but for mobile) ... */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h2 className="text-white font-bold">Keranjang</h2>
                            <button onClick={() => setShowCart(false)} className="p-2 text-white/50 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        {/* Mobile Cart Items */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {cart.map(item => (
                                <div key={item.id} className="flex gap-3 mb-4">
                                    {/* Simplified Mobile Item */}
                                    <img src={item.image} className="w-16 h-16 rounded-lg bg-slate-800" />
                                    <div>
                                        <p className="text-white text-sm font-medium">{item.name}</p>
                                        <p className="text-primary font-bold">{formatRp(item.price)}</p>
                                        <span className="text-white/50 text-xs">x{item.qty}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900/95 backdrop-blur-xl flex items-center justify-around border-t border-white/5 z-50 pb-safe">
                <button className="flex flex-col items-center text-primary gap-1">
                    <span className="material-symbols-outlined text-2xl">grid_view</span>
                    <span className="text-[10px] font-medium">Menu</span>
                </button>
                <button onClick={() => setShowCart(true)} className="relative flex flex-col items-center text-white/50 gap-1 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-2xl">shopping_cart</span>
                    <span className="text-[10px] font-medium">Keranjang</span>
                    {cartCount > 0 && <span className="absolute top-0 right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">{cartCount}</span>}
                </button>
                <button className="flex flex-col items-center text-white/50 gap-1 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-2xl">receipt_long</span>
                    <span className="text-[10px] font-medium">Riwayat</span>
                </button>
                <button onClick={handleLogout} className="flex flex-col items-center text-white/50 gap-1 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-2xl">logout</span>
                    <span className="text-[10px] font-medium">Keluar</span>
                </button>
            </nav>
        </div>
    );
}
