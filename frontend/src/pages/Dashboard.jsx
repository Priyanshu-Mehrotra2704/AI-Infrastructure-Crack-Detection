import { useState, useEffect } from "react";

import Navbar from "../components/Navbar";
import UploadCard from "../components/UploadCard";
import ResultCard from "../components/ResultCard";
import Loader from "../components/Loader";
import History from "../components/History";
import StatsCard from "../components/StatsCard";
import PieChartCard from "../components/Charts/PieChartCard";
import BarChartCard from "../components/Charts/BarChartCard";

import {
    predictImage,
    getDashboardStats
} from "../services/api";

import {
    FaChartBar,
    FaBug,
    FaCheckCircle,
    FaRobot
} from "react-icons/fa";

function Dashboard() {

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const [refreshHistory, setRefreshHistory] = useState(false);

    const [stats, setStats] = useState({
        total: 0,
        crack: 0,
        no_crack: 0,
        accuracy: 0
    });

    const fetchDashboardStats = async () => {

        try {

            const response = await getDashboardStats();
            setStats(response.data);

        } catch (error) {

            console.error(error);

        }

    };

    useEffect(() => {

        fetchDashboardStats();

    }, []);

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

            const response = await predictImage(formData);

            setResult(response.data);

            fetchDashboardStats();

            setRefreshHistory(!refreshHistory);

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

                {/* Heading */}

                <div className="text-center mb-10">

                    <h1 className="text-5xl font-bold text-slate-800">

                        AI Infrastructure Crack Detection

                    </h1>

                    <p className="text-gray-500 mt-4 text-lg">

                        Detect structural cracks using Deep Learning.

                    </p>

                </div>

                {/* Statistics */}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

                    <StatsCard
                        title="Total Inspections"
                        value={stats.total}
                        icon={<FaChartBar />}
                        color="bg-blue-600"
                    />

                    <StatsCard
                        title="Crack"
                        value={stats.crack}
                        icon={<FaBug />}
                        color="bg-red-500"
                    />

                    <StatsCard
                        title="No Crack"
                        value={stats.no_crack}
                        icon={<FaCheckCircle />}
                        color="bg-green-500"
                    />

                    <StatsCard
                        title="Accuracy"
                        value={`${stats.accuracy}%`}
                        icon={<FaRobot />}
                        color="bg-purple-600"
                    />

                </div>

                {/* Upload + Result */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

                    <PieChartCard stats={stats} />

                    <BarChartCard stats={stats} />

                </div>

                <div className="grid md:grid-cols-2 gap-8">

                    <UploadCard
                        setFile={setFile}
                        preview={preview}
                        setPreview={setPreview}
                    />

                    {
                        loading
                            ? <Loader />
                            : <ResultCard result={result} />
                    }

                </div>

                {/* Analyze Button */}

                <div className="mt-8 flex justify-center">

                    <button

                        onClick={analyzeImage}

                        className="bg-blue-600 hover:bg-blue-700 transition text-white px-10 py-4 rounded-xl font-semibold shadow-lg"

                    >

                        Analyze Image

                    </button>

                </div>

                {/* History */}

                <div className="mt-12">

                    <History refresh={refreshHistory} />

                </div>

            </div>

        </div>

    );

}

export default Dashboard;