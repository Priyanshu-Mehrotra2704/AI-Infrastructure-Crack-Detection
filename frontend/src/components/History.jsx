import { useEffect, useState } from "react";
import { getHistory, deleteHistory } from "../services/api";
import { FaTrash } from "react-icons/fa";

function History({ refresh }) {

    const [history, setHistory] = useState([]);
    
    const fetchHistory = async () => {

        try {

            const response = await getHistory();

            setHistory(response.data);

        } catch (error) {

            console.log(error);

        }

    };
    const handleDelete = async (id) => {

        try {

            await deleteHistory(id);
            fetchHistory();

        } catch (error) {

            console.error(error);
        }
    }

    useEffect(() => {

        fetchHistory();

    }, [refresh]);


    return (

        <div className="mt-10">

            <h2 className="text-2xl font-bold mb-5">

                Inspection History

            </h2>

            {
                history.length === 0 ?

                (

                    <p>No inspections yet.</p>

                )

                :

                (

                    <table className="w-full border">

                        <thead>

                            <tr className="bg-gray-200">

                                <th className="p-2">Image</th>

                                <th className="p-2">Prediction</th>

                                <th className="p-2">Confidence</th>

                                <th className="p-2">Model</th>

                                <th className="p-2">Structure</th>
                                <th className="p-2">Action</th>

                            </tr>

                        </thead>

                        <tbody>

                            {
                                history.map((item) => (

                                    <tr
                                        key={item.id}
                                        className="text-center border-t"
                                    >

                                        <td className="p-2">
                                            {item.image_name}
                                        </td>

                                        <td className="p-2">
                                            {item.prediction}
                                        </td>

                                        <td className="p-2">
                                            {item.confidence}%
                                        </td>

                                        <td className="p-2">
                                            {item.model_name}
                                        </td>

                                        <td className="p-2">
                                            {item.structure_type}
                                        </td>
                                        <td className="p-2">
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>

                                    </tr>

                                ))
                            }

                        </tbody>

                    </table>

                )

            }

        </div>

    );

}

export default History;