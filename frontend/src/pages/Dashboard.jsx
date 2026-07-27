import { useState, useEffect } from "react";

import Navbar from "../components/Navbar";
import UploadCard from "../components/UploadCard";
import Loader from "../components/Loader";
import History from "../components/History";
import StatsCard from "../components/StatsCard";
import PieChartCard from "../components/Charts/PieChartCard";
import BatchResultTable from "../components/BatchResultTable";

import WeeklyTrendChart from "../components/Charts/WeeklyTrendChart";

import {
    predictImage,
    getDashboardStats
} from "../services/api";

import {

    FaChartBar,

    FaBug,

    FaCheckCircle,

    FaRobot,

    FaFire,

    FaBullseye,

    FaCalendarDay

} from "react-icons/fa";

function Dashboard() {

    const [file, setFile] = useState([]);
    const [preview, setPreview] = useState([]);
    const [result, setResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState("Pavement");

    const [refreshHistory, setRefreshHistory] = useState(false);

    const [stats, setStats] = useState({

        total: 0,

        crack: 0,

        no_crack: 0,

        accuracy: 0,

        average_confidence: 0,

        highest_confidence: 0,

        today_inspections: 0

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

        if (!file || file.length === 0) {

            alert("Please select an image.");

            return;

        }

        const formData = new FormData();

        file.forEach((file) => {

            formData.append("files", file);

        });
        formData.append("model", selectedModel);

        setLoading(true);

        setResult(null);

        try {

            const response = await predictImage(formData);

            setResult(response.data.results);

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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">

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
                        title="Class Distribution"
                        value={`${stats.accuracy}%`}
                        icon={<FaRobot />}
                        color="bg-purple-600"
                    />
                    <StatsCard
                        title="Avg Confidence"
                        value={`${stats.average_confidence}%`}
                        icon={<FaBullseye />}
                        color="bg-gradient-to-r from-cyan-500 to-cyan-700"
                    />

                    <StatsCard
                        title="Highest Confidence"
                        value={`${stats.highest_confidence}%`}
                        icon={<FaFire />}
                        color="bg-gradient-to-r from-orange-500 to-red-600"
                    />

                    <StatsCard
                        title="Today's Inspections"
                        value={stats.today_inspections}
                        icon={<FaCalendarDay />}
                        color="bg-gradient-to-r from-indigo-500 to-purple-700"
                    />

                </div>

                {/* Upload + Result */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

                    <PieChartCard stats={stats} />

                    <WeeklyTrendChart stats={stats} />

                </div>
                <div className="mb-8">

                    <label className="block text-lg font-semibold mb-2">

                        Select Structure

                    </label>

                    <select

                        value={selectedModel}

                        onChange={(e)=>setSelectedModel(e.target.value)}

                        className="w-full md:w-72 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"

                    >

                        <option value="Pavement">

                            Pavement

                        </option>

                        <option value="Wall">

                            Wall

                        </option>

                        <option value="Deck">

                            Bridge Deck

                        </option>

                    </select>

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
                            : <BatchResultTable
                                results={result}
                            />
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