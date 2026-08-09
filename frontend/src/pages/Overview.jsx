import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import UploadCard from "../components/UploadCard";
import Loader from "../components/Loader";
import BatchResultTable from "../components/BatchResultTable";
import { predictImage } from "../services/api";
import { FiZap } from "react-icons/fi";

function ScanPage() {

    // ---- Exact same state from original Dashboard ----
    const [file, setFile] = useState([]);
    const [preview, setPreview] = useState([]);
    const [result, setResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState("Pavement");

    // ---- Exact same analyzeImage logic from original Dashboard ----
    const analyzeImage = async () => {

        if (!file || file.length === 0) {
            alert("Please select an image.");
            return;
        }

        const formData = new FormData();
        file.forEach((f) => {
            formData.append("files", f);
        });
        formData.append("model", selectedModel);

        setLoading(true);
        setResult(null);

        try {
            const response = await predictImage(formData);
            setResult(response.data.results);

            // Notify Overview to re-fetch stats
            window.dispatchEvent(new Event("stats-refresh"));

            // Notify HistoryPage to re-fetch (same pattern as original refreshHistory)
            window.dispatchEvent(new Event("history-refresh"));

        } catch (error) {
            console.error(error);
            alert("Prediction failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-ink font-body">
            <Navbar />

            <div className="mx-auto max-w-7xl px-6 py-10">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
                        AI analysis
                    </p>
                    <h1 className="mt-1 font-display text-3xl text-paper">
                        New Scan
                    </h1>
                    <p className="mt-1 text-sm text-steel">
                        Upload infrastructure images for crack detection.
                    </p>
                </motion.div>

                {/* Structure select — exact same options/values from original */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                    className="mb-6"
                >
                    <label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.16em] text-steel">
                        Select Structure
                    </label>
                    <div className="flex gap-2">
                        {[
                            { label: "Pavement", value: "Pavement" },
                            { label: "Wall",     value: "Wall"     },
                            { label: "Bridge Deck", value: "Deck"  },
                        ].map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setSelectedModel(opt.value)}
                                className="rounded-lg border px-5 py-2.5 font-mono text-xs uppercase tracking-[0.1em] transition-all"
                                style={{
                                    borderColor: selectedModel === opt.value
                                        ? "var(--color-accent)"
                                        : "var(--color-line)",
                                    backgroundColor: selectedModel === opt.value
                                        ? "rgba(242,169,59,0.1)"
                                        : "var(--color-ink)",
                                    color: selectedModel === opt.value
                                        ? "var(--color-accent)"
                                        : "var(--color-steel)",
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Upload + Result — exact same grid layout as original */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                    className="grid grid-cols-1 gap-8 md:grid-cols-2"
                >
                    {/* UploadCard — same props as original */}
                    <UploadCard
                        setFile={setFile}
                        preview={preview}
                        setPreview={setPreview}
                    />

                    {/* Loader / BatchResultTable — exact same conditional as original */}
                    {loading
                        ? <Loader />
                        : <BatchResultTable results={result} />
                    }
                </motion.div>

                {/* Analyze Button — exact same onClick as original */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.16 }}
                    className="mt-8 flex justify-center"
                >
                    <motion.button
                        onClick={analyzeImage}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-2 rounded-xl bg-accent px-10 py-4 font-semibold text-ink shadow-lg transition-shadow hover:shadow-[0_0_28px_-4px_var(--color-accent)]"
                    >
                        <FiZap className="h-4 w-4" />
                        Analyze Image
                    </motion.button>
                </motion.div>

            </div>
        </div>
    );
}

export default ScanPage;