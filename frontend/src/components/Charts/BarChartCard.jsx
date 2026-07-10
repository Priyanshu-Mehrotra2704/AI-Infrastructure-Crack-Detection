import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from "recharts";

function BarChartCard({ stats }) {

    const data = [

        {
            name: "Crack",
            count: stats.crack
        },

        {
            name: "No Crack",
            count: stats.no_crack
        }

    ];
    if (stats.total === 0) {

    return (

        <div className="bg-white rounded-3xl shadow-xl p-6 h-[420px] flex items-center justify-center">

            <p className="text-gray-500 text-lg">

                No inspection data available.

            </p>

        </div>

    );

}

    return (

        <div className="bg-gradient-to-br from-white to-slate-100 rounded-3xl shadow-2xl p-6 h-[420px]">

            <h2 className="text-xl font-bold mb-5">

                Inspection Summary

            </h2>

            <ResponsiveContainer width="100%" height="90%">

                <BarChart data={data}>

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="name" />

                    <YAxis />

                    <Tooltip />

                    <Bar
                        dataKey="count"
                        fill="#3B82F6"
                        radius={[10,10,0,0]}
                    />

                </BarChart>

            </ResponsiveContainer>

        </div>

    );

}

export default BarChartCard;