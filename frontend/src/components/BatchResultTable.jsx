import { useState } from "react";

function BatchResultTable({ results }) {

    const [selectedHeatmap, setSelectedHeatmap] = useState(null);

    if (!results || results.length === 0) {

        return (

            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">

                <h2 className="text-2xl font-bold">
                    No Results Yet
                </h2>

                <p className="text-gray-500 mt-3">
                    Upload one or more images to view predictions.
                </p>

            </div>

        );

    }

    return (

        <>

            <div className="bg-white rounded-2xl shadow-lg p-8">

                <h2 className="text-2xl font-bold mb-6">

                    Batch Prediction Results

                </h2>

                <div className="overflow-x-auto">

                    <table className="min-w-full">

                        <thead>

                            <tr className="bg-gray-100">

                                <th className="p-3">Image</th>

                                <th className="p-3">Prediction</th>

                                <th className="p-3">Confidence</th>

                                <th className="p-3">Structure</th>

                                <th className="p-3">Heatmap</th>

                            </tr>

                        </thead>

                        <tbody>

                            {results.map((item, index) => (

                                <tr
                                    key={index}
                                    className="border-t text-center hover:bg-gray-50"
                                >

                                    <td className="p-3 font-medium">

                                        {item.filename}

                                    </td>

                                    <td className="p-3">

                                        <span
                                            className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${
                                                item.prediction === "Crack"
                                                    ? "bg-red-500"
                                                    : "bg-green-500"
                                            }`}
                                        >

                                            {item.prediction}

                                        </span>

                                    </td>

                                    <td className="p-3">

                                        <div className="flex flex-col items-center">

                                            <div className="w-28 bg-gray-200 rounded-full h-2">

                                                <div
                                                    className={`h-2 rounded-full ${
                                                        item.prediction === "Crack"
                                                            ? "bg-red-500"
                                                            : "bg-green-500"
                                                    }`}
                                                    style={{
                                                        width: `${item.confidence}%`
                                                    }}
                                                ></div>

                                            </div>

                                            <span className="mt-1 font-semibold">

                                                {item.confidence.toFixed(2)}%

                                            </span>

                                        </div>

                                    </td>

                                    <td className="p-3">

                                        {item.structure}

                                    </td>

                                    <td className="p-3">

                                        {
                                            item.heatmap ? (

                                                <img
                                                    src={item.heatmap}
                                                    alt="Heatmap"
                                                    className="w-28 h-20 rounded-lg border"
                                                />

                                            ) : (

                                                <span className="text-gray-400">

                                                    Coming Soon

                                                </span>

                                            )
                                        }

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            </div>

            {selectedHeatmap && (

                <div
                    className="fixed inset-0 bg-black/70 flex justify-center items-center z-50"
                    onClick={() => setSelectedHeatmap(null)}
                >

                    <img
                        src={selectedHeatmap}
                        alt="Heatmap"
                        className="max-w-5xl max-h-[90vh] rounded-xl shadow-2xl"
                    />

                </div>

            )}

        </>

    );

}

export default BatchResultTable;