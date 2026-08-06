import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiLogOut, FiUser, FiZap } from "react-icons/fi";
import API from "../services/api";

const NAV_LINKS = [
    { label: "Dashboard", href: "/" },
    { label: "History", href: "/history" },
    { label: "Analytics", href: "/analytics" },
];

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        API.get("/auth/me")
            .then((r) => setUser(r.data))
            .catch(() => {});
    }, []);

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await API.post("/auth/logout");
            navigate("/login");
        } catch {
            setLoggingOut(false);
        }
    };

    return (
        <motion.nav
            initial={{ y: -64, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="sticky top-0 z-40 border-b border-line bg-ink/90 backdrop-blur-md"
        >
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">

                {/* Brand */}
                <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-sm border border-accent/50 text-accent">
                        <FiZap className="h-3.5 w-3.5" />
                    </span>
                    <span className="font-display text-base tracking-[0.1em] text-paper">
                        CRACKWATCH
                    </span>
                </div>

                {/* Nav links */}
                <ul className="hidden items-center gap-1 md:flex">
                    {NAV_LINKS.map((link) => {
                        const active = location.pathname === link.href;
                        return (
                            <li key={link.href}>
                                <button
                                    onClick={() => navigate(link.href)}
                                    className="relative px-3 py-1.5 font-mono text-xs uppercase tracking-[0.14em] transition-colors"
                                    style={{ color: active ? "var(--color-accent)" : "var(--color-steel)" }}
                                >
                                    {link.label}
                                    {active && (
                                        <motion.span
                                            layoutId="nav-pill"
                                            className="absolute inset-0 rounded bg-accent/10"
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>

                {/* User + Logout */}
                <div className="flex items-center gap-3">
                    <AnimatePresence>
                        {user && (
                            <motion.div
                                initial={{ opacity: 0, x: 8 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="hidden items-center gap-2 sm:flex"
                            >
                                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-line bg-panel text-steel">
                                    <FiUser className="h-3 w-3" />
                                </span>
                                <span className="font-mono text-xs text-steel">
                                    {user.username}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="flex items-center gap-1.5 rounded-md border border-line bg-panel px-3 py-1.5 font-mono text-xs uppercase tracking-[0.12em] text-steel transition-colors hover:border-crack/50 hover:text-crack disabled:opacity-50"
                    >
                        <FiLogOut className="h-3.5 w-3.5" />
                        {loggingOut ? "…" : "Logout"}
                    </button>
                </div>
            </div>
        </motion.nav>
    );
}

export default Navbar;