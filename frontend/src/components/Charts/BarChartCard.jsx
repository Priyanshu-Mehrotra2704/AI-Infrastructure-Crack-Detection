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

    return (

        <div className="bg-white rounded-2xl shadow-xl p-6 h-[420px]">

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