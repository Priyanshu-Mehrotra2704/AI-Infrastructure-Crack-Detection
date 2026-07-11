function BatchResultTable({ results }) {

    if (results.length === 0) {

        return (

            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">

                <h2 className="text-2xl font-bold">

                    No Results Yet

                </h2>

            </div>

        );

    }

    return (

        <div className="bg-white rounded-2xl shadow-lg p-8">

            <h2 className="text-2xl font-bold mb-6">

                Batch Prediction Results

            </h2>

            <table className="w-full border">

                <thead>

                    <tr className="bg-gray-100">

                        <th className="p-3">Image</th>

                        <th className="p-3">Prediction</th>

                        <th className="p-3">Confidence</th>

                        <th className="p-3">Structure</th>

                    </tr>

                </thead>

                <tbody>

                    {

                        results.map((item, index) => (

                            <tr
                                key={index}
                                className="border-t text-center"
                            >

                                <td className="p-3">

                                    {item.filename}

                                </td>

                                <td className="p-3">

                                    {item.prediction}

                                </td>

                                <td className="p-3">

                                    {item.confidence}%

                                </td>

                                <td className="p-3">

                                    {item.structure}

                                </td>

                            </tr>

                        ))

                    }

                </tbody>

            </table>

        </div>

    );

}

export default BatchResultTable;