import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiTrash2, FiDownload, FiSearch, FiFilter, FiInbox } from "react-icons/fi";
import { getHistory, deleteHistory, downloadReport } from "../services/api";

const FILTERS = ["All", "Crack", "No Crack"];

function History({ refresh }) {
    const [history, setHistory] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    const fetchHistory = async () => {
        try {
            const r = await getHistory();
            setHistory(r.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchHistory(); }, [refresh]);

    const handleDelete = async (id) => {
        setDeletingId(id);
        try {
            await deleteHistory(id);
            setHistory((h) => h.filter((item) => item.id !== id));
        } catch (e) {
            console.error(e);
        } finally {
            setDeletingId(null);
        }
    };

    const handleDownload = async (id, imageName) => {
        try {
            const response = await downloadReport(id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.download = `report_${id}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
        }
    };

    const filtered = history.filter((item) => {
        const matchSearch = item.image_name.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === "All" || item.prediction === filter;
        return matchSearch && matchFilter;
    });

    return (
        <div className="mt-8">
            {/* header row */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-steel">
                        Inspection log
                    </p>
                    <h2 className="mt-0.5 font-display text-xl text-paper">
                        History
                    </h2>
                </div>

                <div className="flex gap-2">
                    {/* search */}
                    <div className="flex items-center gap-2 rounded-md border border-line bg-panel px-3 py-2 transition-colors focus-within:border-accent">
                        <FiSearch className="h-3.5 w-3.5 shrink-0 text-steel" />
                        <input
                            type="text"
                            placeholder="Search files…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-40 bg-transparent font-mono text-xs text-paper placeholder:text-steel/60 focus:outline-none"
                        />
                    </div>

                    {/* filter pills */}
                    <div className="flex items-center gap-1 rounded-md border border-line bg-panel p-1">
                        <FiFilter className="ml-1.5 h-3 w-3 shrink-0 text-steel" />
                        {FILTERS.map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className="rounded px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors"
                                style={{
                                    backgroundColor: filter === f ? "var(--color-accent)" : "transparent",
                                    color: filter === f ? "var(--color-ink)" : "var(--color-steel)",
                                }}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* table */}
            <div className="overflow-hidden rounded-lg border border-line bg-panel">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="h-5 w-5 rounded-full border-2 border-line border-t-accent"
                        />
                    </div>
                ) : filtered.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center gap-3 py-16 text-center"
                    >
                        <FiInbox className="h-8 w-8 text-steel/40" />
                        <p className="font-mono text-xs uppercase tracking-[0.14em] text-steel">
                            {search || filter !== "All" ? "No results match" : "No inspections yet"}
                        </p>
                        <p className="text-sm text-steel/60">
                            {search || filter !== "All"
                                ? "Try adjusting your filters."
                                : "Upload an image to begin scanning."}
                        </p>
                    </motion.div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px]">
                            <thead>
                                <tr className="border-b border-line">
                                    {["Image", "Result", "Confidence", "Structure", "Date", "Report", ""].map((h) => (
                                        <th
                                            key={h}
                                            className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.16em] text-steel"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence initial={false}>
                                    {filtered.map((item, i) => (
                                        <motion.tr
                                            key={item.id}
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -16 }}
                                            transition={{ duration: 0.25, delay: i * 0.03 }}
                                            className="border-b border-line/50 transition-colors last:border-0 hover:bg-ink/60"
                                        >
                                            <td className="px-4 py-3 font-mono text-xs text-paper">
                                                {item.image_name}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em]"
                                                    style={{
                                                        backgroundColor:
                                                            item.prediction === "Crack"
                                                                ? "rgba(255,97,82,0.12)"
                                                                : "rgba(62,214,196,0.1)",
                                                        color:
                                                            item.prediction === "Crack"
                                                                ? "var(--color-crack)"
                                                                : "var(--color-accent-2)",
                                                        border: `1px solid ${item.prediction === "Crack" ? "rgba(255,97,82,0.3)" : "rgba(62,214,196,0.25)"}`,
                                                    }}
                                                >
                                                    <span
                                                        className="h-1.5 w-1.5 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                item.prediction === "Crack"
                                                                    ? "var(--color-crack)"
                                                                    : "var(--color-accent-2)",
                                                        }}
                                                    />
                                                    {item.prediction}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs text-accent">
                                                {item.confidence.toFixed(1)}%
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs text-steel">
                                                {item.structure_type}
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs text-steel">
                                                {new Date(item.created_at).toLocaleDateString("en-GB", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => handleDownload(item.id, item.image_name)}
                                                    className="flex items-center gap-1 rounded border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-steel transition-colors hover:border-accent hover:text-accent"
                                                >
                                                    <FiDownload className="h-3 w-3" />
                                                    PDF
                                                </button>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    disabled={deletingId === item.id}
                                                    className="flex h-7 w-7 items-center justify-center rounded border border-line text-steel transition-colors hover:border-crack/50 hover:text-crack disabled:opacity-40"
                                                >
                                                    {deletingId === item.id ? (
                                                        <motion.div
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                                            className="h-3 w-3 rounded-full border border-line border-t-crack"
                                                        />
                                                    ) : (
                                                        <FiTrash2 className="h-3.5 w-3.5" />
                                                    )}
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* footer count */}
            {filtered.length > 0 && (
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-steel/60">
                    {filtered.length} record{filtered.length !== 1 ? "s" : ""}
                    {filter !== "All" || search ? " (filtered)" : ""}
                </p>
            )}
        </div>
    );
}

export default History;