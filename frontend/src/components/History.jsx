import { useEffect, useState } from "react";
import {
    getHistory,
    deleteHistory,
    downloadReport
} from "../services/api";

import {
    FaTrash,
    FaDownload
} from "react-icons/fa";

function History({ refresh }) {

    const [history, setHistory] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");

    const fetchHistory = async () => {

        try {

            const response = await getHistory();

            setHistory(response.data);

        } catch (error) {

            console.error(error);

        }

    };

    useEffect(() => {

        fetchHistory();

    }, [refresh]);

    const handleDelete = async (id) => {

        try {

            await deleteHistory(id);

            fetchHistory();

        } catch (error) {

            console.error(error);

        }

    };

    const handleDownload = async (id, imageName) => {

        try {

            const response = await downloadReport(id);

            const url = window.URL.createObjectURL(
                new Blob([response.data])
            );

            const link = document.createElement("a");

            link.href = url;

            link.download = `${imageName}.pdf`;

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

        } catch (error) {

            console.error(error);

        }

    };

    const filteredHistory = history.filter((item) => {

        const matchSearch = item.image_name
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchFilter =
            filter === "All" ||
            item.prediction === filter;

        return matchSearch && matchFilter;

    });

    return (

        <div className="mt-10 bg-white rounded-xl shadow-lg p-6">

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">

                <h2 className="text-2xl font-bold">

                    Inspection History

                </h2>

                <div className="flex gap-3">

                    <input
                        type="text"
                        placeholder="Search image..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2"
                    >

                        <option>All</option>
                        <option>Crack</option>
                        <option>No Crack</option>

                    </select>

                </div>

            </div>

            {

                filteredHistory.length === 0 ?

                (

                    <div className="text-center py-10">

                        <h3 className="text-xl font-semibold mb-2">

                            No Inspection History

                        </h3>

                        <p className="text-gray-500">

                            Upload an image to see previous inspections.

                        </p>

                    </div>

                )

                :

                (

                    <div className="overflow-x-auto">

                        <table className="w-full bg-white rounded-xl overflow-hidden shadow-lg">

                            <thead>

                                <tr className="bg-blue-600 text-white">

                                    <th className="p-3">Image</th>

                                    <th className="p-3">Prediction</th>

                                    <th className="p-3">Confidence</th>

                                    <th className="p-3">Model</th>

                                    <th className="p-3">Structure</th>

                                    <th className="p-3">Date</th>

                                    <th className="p-3">Report</th>

                                    <th className="p-3">Action</th>

                                </tr>

                            </thead>

                            <tbody>

                                {

                                    filteredHistory.map((item) => (

                                        <tr
                                            key={item.id}
                                            className="text-center border-b hover:bg-gray-100 transition"
                                        >

                                            <td className="p-3 font-medium">

                                                {item.image_name}

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

                                            <td className="p-3 font-semibold text-blue-600">

                                                {item.confidence.toFixed(2)}%

                                            </td>

                                            <td className="p-3">

                                                {item.model_name}

                                            </td>

                                            <td className="p-3">

                                                {item.structure_type}

                                            </td>

                                            <td className="p-3">

                                                {new Date(item.created_at).toLocaleString()}

                                            </td>

                                            <td className="p-3">

                                                <button

                                                    onClick={() =>
                                                        handleDownload(
                                                            item.id,
                                                            item.image_name
                                                        )
                                                    }

                                                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition"

                                                >

                                                    <FaDownload />

                                                </button>

                                            </td>

                                            <td className="p-3">

                                                <button

                                                    onClick={() =>
                                                        handleDelete(item.id)
                                                    }

                                                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition"

                                                >

                                                    <FaTrash />

                                                </button>

                                            </td>

                                        </tr>

                                    ))

                                }

                            </tbody>

                        </table>

                    </div>

                )

            }

        </div>

    );

}

export default History;