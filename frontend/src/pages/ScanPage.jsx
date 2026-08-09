import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import { predictImage } from "../services/api";
import { FiUploadCloud, FiX, FiZap, FiLoader, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";

const STRUCTURES = ["Pavement", "Wall", "Bridge Deck"];
const STRUCTURE_KEYS = { "Pavement": "Pavement", "Wall": "Wall", "Bridge Deck": "Deck" };
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ---- DropZone ----
function DropZone({ files, setFiles }) {
    const [dragging, setDragging] = useState(false);

    const addFiles = (incoming) => {
        const imgs = Array.from(incoming).filter((f) => f.type.startsWith("image/"));
        setFiles((prev) => {
            const existing = new Set(prev.map((f) => f.name));
            return [...prev, ...imgs.filter((f) => !existing.has(f.name))];
        });
    };

    const onDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        addFiles(e.dataTransfer.files);
    };

    return (
        <div className="space-y-4">
            <label
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className="relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed py-10 transition-colors"
                style={{
                    borderColor: dragging ? "var(--color-accent)" : "var(--color-line)",
                    backgroundColor: dragging ? "rgba(242,169,59,0.05)" : "var(--color-ink)",
                }}
            >
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => addFiles(e.target.files)}
                />
                <motion.div
                    animate={{ y: dragging ? -4 : 0 }}
                    className="flex h-10 w-10 items-center justify-center rounded-md border border-line text-steel"
                >
                    <FiUploadCloud className="h-5 w-5" />
                </motion.div>
                <div className="text-center">
                    <p className="text-sm text-paper">
                        Drop images here or{" "}
                        <span className="font-medium text-accent">browse</span>
                    </p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-steel">
                        JPG · PNG · JPEG
                    </p>
                </div>
            </label>

            {/* preview grid */}
            <AnimatePresence>
                {files.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-3 gap-2 sm:grid-cols-4"
                    >
                        {files.map((f, i) => (
                            <motion.div
                                key={f.name}
                                initial={{ opacity: 0, scale: 0.88 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.88 }}
                                transition={{ delay: i * 0.04 }}
                                className="group relative"
                            >
                                <img
                                    src={URL.createObjectURL(f)}
                                    alt={f.name}
                                    className="h-20 w-full rounded-md border border-line object-cover"
                                />
                                <button
                                    onClick={() =>
                                        setFiles((prev) => prev.filter((_, j) => j !== i))
                                    }
                                    className="absolute -right-1 -top-1 hidden h-5 w-5 items-center justify-center rounded-full border border-line bg-panel text-steel hover:text-crack group-hover:flex"
                                >
                                    <FiX className="h-3 w-3" />
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ---- ResultCard ----
function ResultCard({ item, index }) {
    const isCrack = item.prediction === "Crack";
    return (
        <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.07 }}
            className="flex items-center gap-4 rounded-lg border border-line bg-ink p-4"
        >
            <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                style={{
                    backgroundColor: isCrack ? "rgba(255,97,82,0.12)" : "rgba(62,214,196,0.1)",
                    color: isCrack ? "var(--color-crack)" : "#3ed6c4",
                }}
            >
                {isCrack
                    ? <FiAlertTriangle className="h-4 w-4" />
                    : <FiCheckCircle className="h-4 w-4" />
                }
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-xs text-paper">{item.filename}</p>
                <div className="mt-1.5 flex items-center gap-2">
                    {/* confidence bar */}
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-line">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.confidence}%` }}
                            transition={{ duration: 0.6, delay: index * 0.07 + 0.2, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{
                                backgroundColor: isCrack ? "var(--color-crack)" : "#3ed6c4",
                            }}
                        />
                    </div>
                    <span className="w-12 shrink-0 font-mono text-[10px] text-steel">
                        {item.confidence.toFixed(1)}%
                    </span>
                </div>
            </div>
            <span
                className="shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em]"
                style={{
                    borderColor: isCrack ? "rgba(255,97,82,0.35)" : "rgba(62,214,196,0.25)",
                    color: isCrack ? "var(--color-crack)" : "#3ed6c4",
                }}
            >
                {item.prediction}
            </span>
        </motion.div>
    );
}

// ---- Main Scan page ----
function Scan() {
    const [files, setFiles] = useState([]);
    const [structure, setStructure] = useState("Pavement");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleScan = async () => {
        if (files.length === 0) { setError("Select at least one image first."); return; }
        setError("");
        setLoading(true);
        setResults([]);
        try {
            const fd = new FormData();
            files.forEach((f) => fd.append("files", f));
            fd.append("model", STRUCTURE_KEYS[structure]);
            const r = await predictImage(fd);
            setResults(r.data.results);
        } catch (e) {
            setError(e.response?.data?.detail || "Prediction failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-ink font-body">
            <Navbar />

            <div className="mx-auto max-w-5xl px-6 py-10">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
                        AI analysis
                    </p>
                    <h1 className="mt-1 font-display text-3xl text-paper">New Scan</h1>
                </motion.div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* LEFT — upload + controls */}
                    <motion.div
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-6"
                    >
                        {/* structure selector */}
                        <div className="rounded-lg border border-line bg-panel p-5">
                            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-steel">
                                Structure type
                            </p>
                            <div className="flex gap-2">
                                {STRUCTURES.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setStructure(s)}
                                        className="flex-1 rounded-md border py-2 font-mono text-xs uppercase tracking-[0.1em] transition-colors"
                                        style={{
                                            borderColor: structure === s ? "var(--color-accent)" : "var(--color-line)",
                                            backgroundColor: structure === s ? "rgba(242,169,59,0.1)" : "var(--color-ink)",
                                            color: structure === s ? "var(--color-accent)" : "var(--color-steel)",
                                        }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* upload zone */}
                        <div className="rounded-lg border border-line bg-panel p-5">
                            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-steel">
                                Images{files.length > 0 && ` · ${files.length} selected`}
                            </p>
                            <DropZone files={files} setFiles={setFiles} />
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    className="rounded-md border border-crack/40 bg-crack/10 px-4 py-2.5 font-mono text-xs text-crack"
                                >
                                    {error}
                                </motion.p>
                            )}
                        </AnimatePresence>

                        <motion.button
                            onClick={handleScan}
                            disabled={loading || files.length === 0}
                            whileHover={{ y: files.length > 0 && !loading ? -1 : 0 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex w-full items-center justify-center gap-2 rounded-md bg-accent py-3.5 font-mono text-sm uppercase tracking-[0.12em] text-ink transition-shadow hover:shadow-[0_0_24px_-4px_var(--color-accent)] disabled:opacity-50"
                        >
                            {loading
                                ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><FiLoader className="h-4 w-4" /></motion.div> Analyzing…</>
                                : <><FiZap className="h-4 w-4" /> Run Scan</>
                            }
                        </motion.button>
                    </motion.div>

                    {/* RIGHT — results */}
                    <motion.div
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                        className="rounded-lg border border-line bg-panel p-5"
                    >
                        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-steel">
                            Results{results.length > 0 && ` · ${results.length} images`}
                        </p>

                        {loading ? (
                            <div className="flex h-64 flex-col items-center justify-center gap-4">
                                <div className="relative h-14 w-14">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 rounded-full border-2 border-line border-t-accent"
                                    />
                                    <div className="absolute inset-2 flex items-center justify-center">
                                        <FiZap className="h-4 w-4 text-accent" />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
                                        AI analyzing
                                    </p>
                                    <p className="mt-1 text-sm text-steel">Processing {files.length} image{files.length !== 1 ? "s" : ""}…</p>
                                </div>
                            </div>
                        ) : results.length === 0 ? (
                            <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-line text-steel/40">
                                    <FiZap className="h-5 w-5" />
                                </div>
                                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-steel">
                                    Awaiting scan
                                </p>
                                <p className="text-sm text-steel/60">
                                    Upload images and run a scan to see predictions.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                                {results.map((item, i) => (
                                    <ResultCard key={i} item={item} index={i} />
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default Scan;