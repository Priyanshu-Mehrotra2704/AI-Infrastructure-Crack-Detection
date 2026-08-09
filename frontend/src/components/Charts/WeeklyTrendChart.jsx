import {
    ResponsiveContainer, LineChart, Line,
    XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-md border border-line bg-panel px-3 py-2 font-mono text-xs shadow-xl">
            <p className="text-steel">{label}</p>
            <p className="mt-0.5 text-accent">{payload[0].value} inspections</p>
        </div>
    );
};

function WeeklyTrendChart({ stats }) {

    // ---- Exact same empty check from original ----
    if (stats.total === 0) {
        return (
            <div className="flex h-[420px] items-center justify-center rounded-2xl border border-line bg-panel p-6">
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-steel/60">
                    No weekly data available.
                </p>
            </div>
        );
    }

    return (
        <div className="h-[420px] rounded-2xl border border-line bg-panel p-6">
            <div className="mb-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-steel">Activity</p>
                <h2 className="mt-0.5 font-display text-lg text-paper">Weekly Inspection Trend</h2>
            </div>

            {/* ---- Exact same LineChart + same dataKey="count" from original ---- */}
            <ResponsiveContainer width="100%" height="88%">
                <LineChart data={stats.weekly_inspections}>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--color-line)"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="day"
                        tick={{ fill: "var(--color-steel)", fontSize: 10, fontFamily: "monospace" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fill: "var(--color-steel)", fontSize: 10, fontFamily: "monospace" }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--color-line)" }} />
                    <Line
                        type="monotone"
                        dataKey="count"
                        stroke="var(--color-accent)"
                        strokeWidth={3}
                        dot={{ r: 5, fill: "var(--color-accent)", strokeWidth: 0 }}
                        activeDot={{ r: 7, fill: "var(--color-accent)", strokeWidth: 0 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default WeeklyTrendChart;