import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";

const COLORS = ["#EF4444", "#22C55E"];

function PieChartCard({ stats }) {

    const data = [
        {
            name: "Crack",
            value: stats.crack
        },
        {
            name: "No Crack",
            value: stats.no_crack
        }
    ];

    return (

        <div className="bg-white rounded-2xl shadow-xl p-6 h-[420px]">

            <h2 className="text-xl font-bold mb-5">

                Crack Distribution

            </h2>

            <ResponsiveContainer width="100%" height="90%">

                <PieChart>

                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={120}
                        label
                    >

                        {
                            data.map((entry, index) => (

                                <Cell
                                    key={index}
                                    fill={COLORS[index]}
                                />

                            ))
                        }

                    </Pie>

                    <Tooltip />

                    <Legend />

                </PieChart>

            </ResponsiveContainer>

        </div>

    );

}

export default PieChartCard;