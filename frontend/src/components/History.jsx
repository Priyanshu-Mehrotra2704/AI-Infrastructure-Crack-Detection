import { useEffect, useState } from "react";
import { getHistory } from "../services/api";

function History() {

    const [history, setHistory] = useState([]);
    const fetchHistory = async () => {

        try {

            const response = await getHistory();

            setHistory(response.data);

        } catch (error) {

            console.log(error);

        }

    };

    useEffect(() => {

        fetchHistory();

    }, []);


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