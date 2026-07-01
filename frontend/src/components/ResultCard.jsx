function ResultCard({ result }) {

    if (!result) {

        return (

            <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col justify-center items-center min-h-[420px]">

                <div className="text-7xl mb-6">
                    🤖
                </div>

                <h2 className="text-2xl font-bold text-gray-700">

                    No Analysis Yet

                </h2>

                <p className="text-gray-500 mt-3 text-center">

                    Upload an infrastructure image and click
                    <br />
                    <span className="font-semibold">
                        Analyze Image
                    </span>

                </p>

            </div>

        );

    }

    const isCrack =
        result.result.toLowerCase().includes("crack");

    return (

        <div className="bg-white rounded-2xl shadow-lg p-8">

            <h2 className="text-3xl font-bold text-gray-800 mb-8">

                Analysis Result

            </h2>

            <div className="space-y-6">

                <div className="flex justify-between items-center">

                    <span className="text-gray-500">

                        Prediction

                    </span>

                    <span
                        className={`font-bold text-xl ${
                            isCrack
                                ? "text-red-500"
                                : "text-green-600"
                        }`}
                    >

                        {result.result}

                    </span>

                </div>

                <hr />

                <div className="flex justify-between items-center">

                    <span className="text-gray-500">

                        Confidence

                    </span>

                    <span className="font-bold text-blue-600">

                        {result.confidence}%

                    </span>

                </div>

                <hr />

                <div className="flex justify-between items-center">

                    <span className="text-gray-500">

                        Model

                    </span>

                    <span className="font-semibold">

                        CNN

                    </span>

                </div>

                <hr />

                <div className="flex justify-between items-center">

                    <span className="text-gray-500">

                        Status

                    </span>

                    <span className="text-green-600 font-semibold">

                        Completed

                    </span>

                </div>

                <hr />

                <div className="flex justify-between items-center">

                    <span className="text-gray-500">

                        Inference Time

                    </span>

                    <span className="font-semibold">

                        ~0.18 sec

                    </span>

                </div>

            </div>

        </div>

    );

}

export default ResultCard;