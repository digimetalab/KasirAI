"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Theme configuration - CENTRALIZED
export const THEME = {
    // Colors
    colors: {
        primary: "var(--color-primary)",
        primaryLight: "var(--color-primary)/10",
        primaryHover: "var(--color-primary)/90",

        // Background colors for dark theme (sidebar, status bar)
        bgDark: "bg-slate-900",
        bgDarkSecondary: "bg-slate-800",
        bgDarkGlass: "bg-slate-800/50",

        // Background colors for light theme (main content)
        bgLight: "bg-slate-100",
        bgWhite: "bg-white",

        // Text colors
        textDark: "text-slate-900",
        textMuted: "text-slate-500",
        textLight: "text-white",
        textLightMuted: "text-white/60",

        // Status colors
        success: "text-emerald-500",
        warning: "text-amber-500",
        error: "text-red-500",
        info: "text-blue-500",

        successBg: "bg-emerald-50",
        warningBg: "bg-amber-50",
        errorBg: "bg-red-50",
        infoBg: "bg-blue-50",
    },

    // Border radius - fully rounded
    radius: {
        sm: "rounded-xl",
        md: "rounded-2xl",
        lg: "rounded-3xl",
        full: "rounded-full",
        panel: "rounded-l-[32px]",
    },

    // Layout
    layout: {
        sidebarWidth: "w-16 lg:w-20",
        rightPanelWidth: "w-80 2xl:w-96",
        headerHeight: "h-16 lg:h-20",
        statusBarHeight: "h-10",
        mobileNavHeight: "h-16",
    },

    // Components
    components: {
        // Sidebar nav button
        navButton: (active: boolean) => `
      w-11 h-11 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center transition-all duration-200
      ${active
                ? "bg-primary text-white shadow-lg shadow-primary/30"
                : "text-white/50 hover:bg-white/10 hover:text-white"
            }
    `,

        // Card
        card: "bg-white rounded-3xl",

        // Button primary
        buttonPrimary: "bg-gradient-to-r from-primary to-blue-500 text-white font-semibold rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl disabled:opacity-50 transition-all",

        // Button secondary
        buttonSecondary: "border border-slate-200 text-slate-700 font-medium rounded-2xl hover:bg-slate-50 transition-colors",

        // Input
        input: "w-full rounded-xl border border-white/20 bg-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",

        inputLight: "w-full rounded-2xl border-0 bg-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30",

        // Status bar
        statusBar: "hidden md:flex h-10 bg-slate-800 text-white/70 items-center px-6 text-xs gap-6 flex-shrink-0",

        // Mobile nav
        mobileNav: "md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-100 flex items-center justify-around px-4 z-40",
    },
};

// Theme context for dark/light mode
interface ThemeContextType {
    isDark: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    isDark: false,
    toggleTheme: () => { },
});

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Check localStorage for saved preference
        const saved = localStorage.getItem("theme");
        if (saved === "dark") {
            setIsDark(true);
            document.documentElement.classList.add("dark");
        }
    }, []);

    const toggleTheme = () => {
        setIsDark(!isDark);
        if (!isDark) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    };

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}

// Common UI Components
export function StatusBar() {
    return (
        <footer className={THEME.components.statusBar}>
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-medium text-white/90">ONLINE</span>
            </div>
            <div className="text-white/40">SYNC: OK</div>
            <div className="flex-1" />
            <div className="text-white/40">v1.0.0</div>
        </footer>
    );
}

export function Sidebar({
    items,
    onLogout,
    logoSrc = "/logo.png"
}: {
    items: { icon: string; label: string; active: boolean }[];
    onLogout: () => void;
    logoSrc?: string;
}) {
    return (
        <aside className="hidden md:flex w-16 lg:w-20 bg-slate-800/50 backdrop-blur-sm flex-col items-center py-4 gap-2 flex-shrink-0">
            <div className="w-10 h-10 lg:w-12 lg:h-12 mb-4 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/30">
                <img src={logoSrc} alt="KasirAI" className="w-6 h-6 lg:w-7 lg:h-7 object-contain brightness-0 invert" />
            </div>

            {items.map((item) => (
                <button
                    key={item.icon}
                    className={THEME.components.navButton(item.active)}
                    title={item.label}
                >
                    <span className="material-symbols-outlined text-xl lg:text-2xl">{item.icon}</span>
                </button>
            ))}

            <div className="flex-1" />

            <button className="w-11 h-11 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all">
                <span className="material-symbols-outlined text-xl lg:text-2xl">help_outline</span>
            </button>
            <button
                onClick={onLogout}
                className="w-11 h-11 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center text-white/40 hover:bg-red-500/20 hover:text-red-400 transition-all"
            >
                <span className="material-symbols-outlined text-xl lg:text-2xl">logout</span>
            </button>
        </aside>
    );
}

export function MobileNav({
    items,
    onLogout
}: {
    items: { icon: string; label: string; active: boolean; onClick?: () => void }[];
    onLogout: () => void;
}) {
    return (
        <nav className={THEME.components.mobileNav}>
            {items.map((item) => (
                <button
                    key={item.icon}
                    onClick={item.onClick}
                    className={`flex flex-col items-center gap-1 ${item.active ? 'text-primary' : 'text-slate-400'}`}
                >
                    <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                    <span className="text-[10px]">{item.label}</span>
                </button>
            ))}
            <button onClick={onLogout} className="flex flex-col items-center gap-1 text-slate-400">
                <span className="material-symbols-outlined text-2xl">logout</span>
                <span className="text-[10px]">Keluar</span>
            </button>
        </nav>
    );
}

export function PageHeader({
    title,
    user,
    badge,
    children
}: {
    title: string;
    user: { name: string };
    badge?: string;
    children?: ReactNode;
}) {
    return (
        <header className="h-16 lg:h-20 bg-white flex items-center px-4 lg:px-6 gap-4 shadow-sm flex-shrink-0">
            <button className="md:hidden w-10 h-10 rounded-2xl flex items-center justify-center text-slate-600 bg-slate-100">
                <span className="material-symbols-outlined">menu</span>
            </button>

            <h1 className="font-bold text-xl text-slate-800">{title}</h1>
            {badge && (
                <span className="px-2.5 py-1 bg-primary text-white text-[10px] font-bold rounded-lg">{badge}</span>
            )}

            {children}

            <div className="flex-1" />

            <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-2xl">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-medium text-emerald-700 text-sm">Online</span>
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block">
                    <p className="font-semibold text-slate-800">{user.name}</p>
                </div>
            </div>
        </header>
    );
}
