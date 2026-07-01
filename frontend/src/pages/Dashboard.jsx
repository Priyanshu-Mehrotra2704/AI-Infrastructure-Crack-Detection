import { useState } from "react";
import axios from "axios";

import Navbar from "../components/Navbar";
import UploadCard from "../components/UploadCard";
import ResultCard from "../components/ResultCard";
import Loader from "../components/Loader";

function Dashboard() {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const analyzeImage = async () => {

        if (!file) {
            alert("Please select an image.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setLoading(true);
        setResult(null);

        try {

            const response = await axios.post(
                "http://localhost:8000/predict/",
                formData
            );

            setResult(response.data);

        } catch (error) {

            console.error(error);
            alert("Prediction failed.");

        } finally {

            setLoading(false);

        }
    };

    return (

        <div className="min-h-screen bg-slate-100">

            <Navbar />

            <div className="max-w-7xl mx-auto px-6 py-10">

                <div className="text-center mb-10">

                    <h1 className="text-5xl font-bold text-slate-800">

                        AI Infrastructure Crack Detection

                    </h1>

                    <p className="text-gray-500 mt-4 text-lg">

                        Detect structural cracks using Deep Learning.

                    </p>

                </div>

                {/* Statistics */}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

                    <div className="bg-white rounded-xl shadow-md p-6">

                        <h3 className="text-gray-500">

                            Total Scans

                        </h3>

                        <h1 className="text-3xl font-bold mt-3">

                            124

                        </h1>

                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">

                        <h3 className="text-gray-500">

                            Cracks

                        </h3>

                        <h1 className="text-3xl font-bold text-red-500 mt-3">

                            37

                        </h1>

                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">

                        <h3 className="text-gray-500">

                            Safe

                        </h3>

                        <h1 className="text-3xl font-bold text-green-600 mt-3">

                            87

                        </h1>

                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">

                        <h3 className="text-gray-500">

                            Accuracy

                        </h3>

                        <h1 className="text-3xl font-bold text-blue-600 mt-3">

                            84%

                        </h1>

                    </div>

                </div>

                {/* Upload + Result */}

                <div className="grid md:grid-cols-2 gap-8">

                    <UploadCard
                        setFile={setFile}
                        preview={preview}
                        setPreview={setPreview}
                    />

                    {loading ? (
                        <Loader />
                    ) : (
                        <ResultCard
                            result={result}
                        />
                    )}

                </div>

                <div className="mt-8 flex justify-center">

                    <button

                        onClick={analyzeImage}

                        className="bg-blue-600 hover:bg-blue-700 transition text-white px-10 py-4 rounded-xl font-semibold shadow-lg"

                    >

                        Analyze Image

                    </button>

                </div>

            </div>

        </div>

    );
}

export default Dashboard;