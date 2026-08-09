import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import {
    ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
    PieChart, Pie, Cell, Legend,
    AreaChart, Area,
} from "recharts";
import { getDashboardStats, getHistory } from "../services/api";
import { FiActivity, FiTarget, FiTrendingUp, FiAlertTriangle } from "react-icons/fi";

// ---- Tooltip styles ----
const TooltipBox = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-md border border-line bg-panel px-3 py-2 font-mono text-xs shadow-xl">
            <p className="text-steel">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }} className="mt-0.5">
                    {p.name}: {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
                </p>
            ))}
        </div>
    );
};

// ---- Chart card wrapper ----
function ChartCard({ title, subtitle, children, className = "" }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border border-line bg-panel p-6 ${className}`}
        >
            <div className="mb-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel">{subtitle}</p>
                <h3 className="mt-0.5 font-display text-lg text-paper">{title}</h3>
            </div>
            {children}
        </motion.div>
    );
}

function AnalyticsPage() {
    const [stats, setStats] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getDashboardStats(), getHistory()])
            .then(([statsRes, historyRes]) => {
                setStats(statsRes.data);
                setHistory(historyRes.data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));

        const onRefresh = () => {
            Promise.all([getDashboardStats(), getHistory()])
                .then(([s, h]) => { setStats(s.data); setHistory(h.data); })
                .catch(console.error);
        };
        window.addEventListener("stats-refresh", onRefresh);
        return () => window.removeEventListener("stats-refresh", onRefresh);
    }, []);

    // ---- Derived data from existing API responses ----

    // 1. Structure-wise breakdown (crack vs no-crack per structure)
    const structureData = ["Pavement", "Wall", "Deck"].map((s) => {
        const items = history.filter((h) => h.structure_type === s);
        return {
            name: s,
            Crack: items.filter((h) => h.prediction === "Crack").length,
            "No Crack": items.filter((h) => h.prediction !== "Crack").length,
            Total: items.length,
        };
    }).filter((s) => s.Total > 0);

    // 2. Confidence distribution buckets
    const buckets = [
        { range: "50–60%", min: 50, max: 60 },
        { range: "60–70%", min: 60, max: 70 },
        { range: "70–80%", min: 70, max: 80 },
        { range: "80–90%", min: 80, max: 90 },
        { range: "90–100%", min: 90, max: 101 },
    ];
    const confidenceData = buckets.map((b) => ({
        range: b.range,
        count: history.filter((h) => h.confidence >= b.min && h.confidence < b.max).length,
    }));

    // 3. Weekly trend — already in stats.weekly_inspections
    const weeklyData = stats?.weekly_inspections || [];

    // 4. Crack rate per structure (for pie)
    const crackRateData = ["Pavement", "Wall", "Deck"].map((s) => {
        const items = history.filter((h) => h.structure_type === s);
        return {
            name: s,
            value: items.filter((h) => h.prediction === "Crack").length,
        };
    }).filter((s) => s.value > 0);

    const PIE_COLORS = ["#f2a93b", "#3ed6c4", "#a78bfa"];

    // 5. Avg confidence per structure
    const avgConfidenceData = ["Pavement", "Wall", "Deck"].map((s) => {
        const items = history.filter((h) => h.structure_type === s);
        const avg = items.length
            ? items.reduce((sum, h) => sum + h.confidence, 0) / items.length
            : 0;
        return { name: s, "Avg Confidence": parseFloat(avg.toFixed(2)) };
    }).filter((s) => s["Avg Confidence"] > 0);

    // ---- Summary metrics ----
    const crackRate = stats?.total
        ? ((stats.crack / stats.total) * 100).toFixed(1)
        : 0;

    const highRiskCount = history.filter(
        (h) => h.prediction === "Crack" && h.confidence >= 90
    ).length;

    if (loading) {
        return (
            <div className="min-h-screen bg-ink font-body">
                <Navbar />
                <div className="flex h-[60vh] items-center justify-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                        className="h-8 w-8 rounded-full border-2 border-line border-t-accent"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-ink font-body">
            <Navbar />

            <div className="mx-auto max-w-7xl px-6 py-10">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
                        Deep dive
                    </p>
                    <h1 className="mt-1 font-display text-3xl text-paper">Analytics</h1>
                    <p className="mt-1 text-sm text-steel">
                        Breakdown of all your inspections across structures, confidence, and time.
                    </p>
                </motion.div>

                {/* Summary row */}
                <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                        { label: "Total inspections", value: stats?.total ?? 0,          icon: FiActivity,     accent: "#3b82f6" },
                        { label: "Overall crack rate", value: `${crackRate}%`,           icon: FiAlertTriangle, accent: "#ef4444" },
                        { label: "Avg confidence",     value: `${stats?.average_confidence ?? 0}%`, icon: FiTarget, accent: "#f2a93b" },
                        { label: "High-risk cracks",   value: highRiskCount,             icon: FiTrendingUp,   accent: "#a78bfa" },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="relative overflow-hidden rounded-xl border border-line bg-panel p-5"
                        >
                            <div
                                className="pointer-events-none absolute -right-4 -top-4 h-14 w-14 rounded-full opacity-20 blur-xl"
                                style={{ backgroundColor: item.accent }}
                            />
                            <div
                                className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg"
                                style={{ backgroundColor: `${item.accent}18`, color: item.accent, border: `1px solid ${item.accent}35` }}
                            >
                                <item.icon className="h-4 w-4" />
                            </div>
                            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-steel">{item.label}</p>
                            <p className="mt-1 font-display text-2xl text-paper">{item.value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Row 1: Structure breakdown + Crack rate per structure */}
                <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

                    <ChartCard title="Structure Breakdown" subtitle="Inspections">
                        {structureData.length === 0 ? (
                            <div className="flex h-56 items-center justify-center">
                                <p className="font-mono text-xs uppercase tracking-[0.14em] text-steel/50">No data yet</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={structureData} barCategoryGap="30%">
                                    <CartesianGrid strokeDasharray="4 4" stroke="var(--color-line)" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: "var(--color-steel)", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: "var(--color-steel)", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<TooltipBox />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                                    <Legend formatter={(v) => <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-steel">{v}</span>} />
                                    <Bar dataKey="Crack"    fill="#ef4444" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="No Crack" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </ChartCard>

                    <ChartCard title="Crack Rate by Structure" subtitle="Distribution">
                        {crackRateData.length === 0 ? (
                            <div className="flex h-56 items-center justify-center">
                                <p className="font-mono text-xs uppercase tracking-[0.14em] text-steel/50">No crack data yet</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie data={crackRateData} dataKey="value" nameKey="name" outerRadius={80} innerRadius={40} paddingAngle={4}>
                                        {crackRateData.map((_, i) => (
                                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="var(--color-panel)" strokeWidth={2} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<TooltipBox />} />
                                    <Legend formatter={(v) => <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-steel">{v}</span>} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </ChartCard>
                </div>

                {/* Row 2: Confidence distribution + Avg confidence per structure */}
                <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

                    <ChartCard title="Confidence Distribution" subtitle="Spread">
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={confidenceData} barCategoryGap="30%">
                                <CartesianGrid strokeDasharray="4 4" stroke="var(--color-line)" vertical={false} />
                                <XAxis dataKey="range" tick={{ fill: "var(--color-steel)", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "var(--color-steel)", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip content={<TooltipBox />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                                <Bar dataKey="count" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Avg Confidence per Structure" subtitle="Performance">
                        {avgConfidenceData.length === 0 ? (
                            <div className="flex h-56 items-center justify-center">
                                <p className="font-mono text-xs uppercase tracking-[0.14em] text-steel/50">No data yet</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={avgConfidenceData} barCategoryGap="40%">
                                    <CartesianGrid strokeDasharray="4 4" stroke="var(--color-line)" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: "var(--color-steel)", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 100]} tick={{ fill: "var(--color-steel)", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<TooltipBox />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                                    <Bar dataKey="Avg Confidence" fill="#3ed6c4" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </ChartCard>
                </div>

                {/* Row 3: Full-width weekly area chart */}
                <ChartCard title="Weekly Activity Trend" subtitle="7-day">
                    {weeklyData.every((d) => d.count === 0) ? (
                        <div className="flex h-56 items-center justify-center">
                            <p className="font-mono text-xs uppercase tracking-[0.14em] text-steel/50">No weekly data yet</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={weeklyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="4 4" stroke="var(--color-line)" vertical={false} />
                                <XAxis dataKey="day" tick={{ fill: "var(--color-steel)", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "var(--color-steel)", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip content={<TooltipBox />} cursor={{ stroke: "var(--color-line)", strokeWidth: 1 }} />
                                <Area type="monotone" dataKey="count" stroke="var(--color-accent)" strokeWidth={2} fill="url(#areaG)" dot={{ r: 4, fill: "var(--color-accent)", strokeWidth: 0 }} activeDot={{ r: 6, fill: "var(--color-accent)", strokeWidth: 0 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>

            </div>
        </div>
    );
}

export default AnalyticsPage;