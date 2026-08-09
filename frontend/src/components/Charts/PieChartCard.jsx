import {
    PieChart, Pie, Cell, Tooltip,
    ResponsiveContainer, Legend
} from "recharts";

// ---- Exact same colors + data shape from original ----
const COLORS = ["#EF4444", "#22C55E"];

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-md border border-line bg-panel px-3 py-2 font-mono text-xs text-paper shadow-xl">
            <span style={{ color: payload[0].payload.fill }}>{payload[0].name}</span>
            {" · "}
            <span>{payload[0].value}</span>
        </div>
    );
};

function PieChartCard({ stats }) {

    // ---- Exact same data array from original ----
    const data = [
        { name: "Crack",    value: stats.crack,    fill: COLORS[0] },
        { name: "No Crack", value: stats.no_crack, fill: COLORS[1] },
    ];

    // ---- Exact same empty check from original ----
    if (stats.total === 0) {
        return (
            <div className="flex h-[420px] items-center justify-center rounded-2xl border border-line bg-panel p-6">
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-steel/60">
                    No inspection data available.
                </p>
            </div>
        );
    }

    return (
        <div className="h-[420px] rounded-2xl border border-line bg-panel p-6">
            <div className="mb-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-steel">Distribution</p>
                <h2 className="mt-0.5 font-display text-lg text-paper">Crack Distribution</h2>
            </div>

            {/* ---- Exact same ResponsiveContainer + PieChart from original ---- */}
            <ResponsiveContainer width="100%" height="88%">
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={120}
                        innerRadius={50}
                        paddingAngle={3}
                        label
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={index}
                                fill={entry.fill}
                                stroke="var(--color-panel)"
                                strokeWidth={2}
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        formatter={(value) => (
                            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-steel">
                                {value}
                            </span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

export default PieChartCard;