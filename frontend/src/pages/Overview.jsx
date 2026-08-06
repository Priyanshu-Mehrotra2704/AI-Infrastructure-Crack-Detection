import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import PieChartCard from "../components/Charts/PieChartCard";
import WeeklyTrendChart from "../components/Charts/WeeklyTrendChart";
import { getDashboardStats } from "../services/api";
import {
    FiActivity, FiAlertTriangle, FiCheckCircle,
    FiTarget, FiTrendingUp, FiZap, FiCalendar
} from "react-icons/fi";

const STAT_CONFIG = [
    { key: "total",               label: "Total Inspections",   icon: FiActivity,      accent: "var(--color-accent)"   },
    { key: "crack",               label: "Cracks Found",        icon: FiAlertTriangle, accent: "var(--color-crack)"    },
    { key: "no_crack",            label: "Clear",               icon: FiCheckCircle,   accent: "#3ed6c4"               },
    { key: "average_confidence",  label: "Avg Confidence",      icon: FiTarget,        accent: "var(--color-accent)"   , suffix: "%" },
    { key: "highest_confidence",  label: "Peak Confidence",     icon: FiTrendingUp,    accent: "var(--color-accent-2)" , suffix: "%" },
    { key: "today_inspections",   label: "Today",               icon: FiCalendar,      accent: "#a78bfa"               },
];

function StatCard({ label, value, icon: Icon, accent, suffix = "" }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            className="relative overflow-hidden rounded-lg border border-line bg-panel p-5"
        >
            {/* accent glow top-left */}
            <div
                className="pointer-events-none absolute -left-6 -top-6 h-20 w-20 rounded-full opacity-20 blur-xl"
                style={{ backgroundColor: accent }}
            />
            <div className="relative z-10">
                <div
                    className="mb-4 flex h-8 w-8 items-center justify-center rounded-md border"
                    style={{ borderColor: `${accent}40`, color: accent, backgroundColor: `${accent}12` }}
                >
                    <Icon className="h-4 w-4" />
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel">{label}</p>
                <p className="mt-1 font-display text-3xl text-paper">
                    {value}{suffix}
                </p>
            </div>
        </motion.div>
    );
}

function Overview() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total: 0, crack: 0, no_crack: 0,
        average_confidence: 0, highest_confidence: 0, today_inspections: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDashboardStats()
            .then((r) => setStats(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-ink font-body">
            <Navbar />

            <div className="mx-auto max-w-7xl px-6 py-10">
                {/* page header */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex items-end justify-between"
                >
                    <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
                            Mission control
                        </p>
                        <h1 className="mt-1 font-display text-3xl text-paper">Overview</h1>
                    </div>
                    <button
                        onClick={() => navigate("/scan")}
                        className="flex items-center gap-2 rounded-md bg-accent px-4 py-2.5 font-mono text-xs uppercase tracking-[0.12em] text-ink transition-shadow hover:shadow-[0_0_20px_-4px_var(--color-accent)]"
                    >
                        <FiZap className="h-3.5 w-3.5" />
                        New scan
                    </button>
                </motion.div>

                {/* stat cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 mb-8">
                    {STAT_CONFIG.map((s, i) => (
                        <motion.div
                            key={s.key}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                        >
                            <StatCard
                                label={s.label}
                                value={stats[s.key]}
                                icon={s.icon}
                                accent={s.accent}
                                suffix={s.suffix}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* charts */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-1 gap-6 lg:grid-cols-2"
                >
                    <PieChartCard stats={stats} />
                    <WeeklyTrendChart stats={stats} />
                </motion.div>
            </div>
        </div>
    );
}

export default Overview;