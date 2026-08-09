import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ---- Exact same logic as original BatchResultTable ----
function BatchResultTable({ results }) {

    const [selectedHeatmap, setSelectedHeatmap] = useState(null);

    // ---- Exact same empty-state condition from original ----
    if (!results || results.length === 0) {
        return (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-line bg-panel p-8 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-line text-steel/40">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M9 17H7A5 5 0 0 1 7 7h2M15 7h2a5 5 0 0 1 0 10h-2M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
                <h2 className="font-display text-xl text-paper">No Results Yet</h2>
                <p className="mt-2 text-sm text-steel">
                    Upload one or more images to view predictions.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="rounded-2xl border border-line bg-panel p-6">

                <h2 className="mb-5 font-display text-xl text-paper">
                    Batch Prediction Results
                </h2>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-line">
                                {["Image", "Prediction", "Confidence", "Structure", "Heatmap"].map((h) => (
                                    <th
                                        key={h}
                                        className="px-3 py-3 text-left font-mono text-[10px] uppercase tracking-[0.16em] text-steel"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {/* ---- Exact same results.map logic from original ---- */}
                            {results.map((item, index) => (
                                <motion.tr
                                    key={index}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="border-b border-line/50 text-center last:border-0 hover:bg-ink/60"
                                >
                                    <td className="px-3 py-3 text-left font-mono text-xs text-paper">
                                        {item.filename}
                                    </td>

                                    <td className="px-3 py-3">
                                        {/* ---- Exact same prediction badge logic from original ---- */}
                                        <span
                                            className="inline-flex items-center gap-1 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.08em]"
                                            style={{
                                                backgroundColor: item.prediction === "Crack"
                                                    ? "rgba(239,68,68,0.12)"
                                                    : "rgba(34,197,94,0.12)",
                                                color: item.prediction === "Crack"
                                                    ? "#ef4444"
                                                    : "#22c55e",
                                                border: `1px solid ${item.prediction === "Crack" ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`,
                                            }}
                                        >
                                            <span
                                                className="h-1.5 w-1.5 rounded-full"
                                                style={{
                                                    backgroundColor: item.prediction === "Crack" ? "#ef4444" : "#22c55e"
                                                }}
                                            />
                                            {item.prediction}
                                        </span>
                                    </td>

                                    <td className="px-3 py-3">
                                        {/* ---- Exact same confidence bar logic from original ---- */}
                                        <div className="flex flex-col items-center gap-1.5">
                                            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-line">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${item.confidence}%` }}
                                                    transition={{ duration: 0.6, delay: index * 0.05 + 0.2 }}
                                                    className="h-full rounded-full"
                                                    style={{
                                                        backgroundColor: item.prediction === "Crack"
                                                            ? "#ef4444"
                                                            : "#22c55e"
                                                    }}
                                                />
                                            </div>
                                            <span className="font-mono text-xs text-accent">
                                                {item.confidence.toFixed(2)}%
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-3 py-3 font-mono text-xs text-steel">
                                        {item.structure}
                                    </td>

                                    <td className="px-3 py-3">
                                        {/* ---- Exact same heatmap logic from original ---- */}
                                        {item.heatmap ? (
                                            <img
                                                src={`${API_BASE_URL}${item.heatmap}`}
                                                alt="Heatmap"
                                                onClick={() =>
                                                    setSelectedHeatmap(
                                                        `${API_BASE_URL}${item.heatmap}`
                                                    )
                                                }
                                                className="h-20 w-28 cursor-pointer rounded-lg border border-line object-cover transition hover:opacity-80"
                                            />
                                        ) : (
                                            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-steel/50">
                                                Coming soon
                                            </span>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ---- Exact same heatmap lightbox from original ---- */}
            <AnimatePresence>
                {selectedHeatmap && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                        onClick={() => setSelectedHeatmap(null)}
                    >
                        <motion.img
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            src={selectedHeatmap}
                            alt="Heatmap"
                            className="max-h-[90vh] max-w-5xl rounded-xl shadow-2xl"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default BatchResultTable;