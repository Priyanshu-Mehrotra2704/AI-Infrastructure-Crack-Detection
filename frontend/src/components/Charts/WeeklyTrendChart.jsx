import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from "recharts";

function WeeklyTrendChart({ stats }) {

    if (stats.total === 0) {

        return (

            <div className="bg-white rounded-3xl shadow-xl p-6 h-[420px] flex items-center justify-center">

                <p className="text-gray-500">

                    No weekly data available.

                </p>

            </div>

        );

    }

    return (

        <div className="bg-white rounded-3xl shadow-xl p-6 h-[420px]">

            <h2 className="text-xl font-bold mb-5">

                Weekly Inspection Trend

            </h2>

            <ResponsiveContainer width="100%" height="90%">

                <LineChart data={stats.weekly_inspections}>

                    <CartesianGrid strokeDasharray="3 3"/>

                    <XAxis dataKey="day"/>

                    <YAxis/>

                    <Tooltip/>

                    <Line

                        type="monotone"

                        dataKey="count"

                        stroke="#2563EB"

                        strokeWidth={3}

                        dot={{ r:6 }}

                    />

                </LineChart>

            </ResponsiveContainer>

        </div>

    );

}

export default WeeklyTrendChart;