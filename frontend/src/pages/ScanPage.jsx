import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import { predictImage } from "../services/api";
import {
    FiUploadCloud,
    FiX,
    FiZap,
    FiLoader,
    FiAlertTriangle,
    FiCheckCircle,
    FiCpu,
} from "react-icons/fi";

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

const formatStructure = (structure) => {
    if (!structure) return "Unknown";

    const normalized = structure
        .toLowerCase()
        .replace(/_/g, " ");

    if (normalized === "bridge deck" || normalized === "deck") {
        return "Bridge Deck";
    }

    if (normalized === "pavement") {
        return "Pavement";
    }

    if (normalized === "wall") {
        return "Wall";
    }

    return structure;
};

const getStructureIcon = (structure) => {
    const normalized = structure?.toLowerCase() || "";

    if (normalized.includes("pavement")) {
        return "P";
    }

    if (normalized.includes("wall")) {
        return "W";
    }

    if (
        normalized.includes("bridge") ||
        normalized.includes("deck")
    ) {
        return "B";
    }

    return "?";
};


// ------------------------------------------------------------
// Drop Zone
// ------------------------------------------------------------

function DropZone({ files, setFiles }) {
    const [dragging, setDragging] = useState(false);

    const addFiles = (incoming) => {
        const imgs = Array.from(incoming).filter((file) =>
            file.type.startsWith("image/")
        );

        setFiles((prev) => {
            const existing = new Set(
                prev.map((file) => file.name)
            );

            return [
                ...prev,
                ...imgs.filter(
                    (file) => !existing.has(file.name)
                ),
            ];
        });
    };

    const onDrop = (event) => {
        event.preventDefault();

        setDragging(false);

        addFiles(event.dataTransfer.files);
    };

    return (
        <div className="space-y-4">

            <label
                onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className="relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed py-10 transition-colors"
                style={{
                    borderColor: dragging
                        ? "var(--color-accent)"
                        : "var(--color-line)",

                    backgroundColor: dragging
                        ? "rgba(242,169,59,0.05)"
                        : "var(--color-ink)",
                }}
            >

                <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) =>
                        addFiles(event.target.files)
                    }
                />

                <motion.div
                    animate={{
                        y: dragging ? -4 : 0,
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-md border border-line text-steel"
                >
                    <FiUploadCloud className="h-5 w-5" />
                </motion.div>

                <div className="text-center">

                    <p className="text-sm text-paper">
                        Drop images here or{" "}
                        <span className="font-medium text-accent">
                            browse
                        </span>
                    </p>

                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-steel">
                        JPG · PNG · JPEG
                    </p>

                </div>

            </label>


            {/* Preview grid */}

            <AnimatePresence>

                {files.length > 0 && (

                    <motion.div
                        initial={{
                            opacity: 0,
                            height: 0,
                        }}
                        animate={{
                            opacity: 1,
                            height: "auto",
                        }}
                        exit={{
                            opacity: 0,
                            height: 0,
                        }}
                        className="grid grid-cols-3 gap-2 sm:grid-cols-4"
                    >

                        {files.map((file, index) => (

                            <motion.div
                                key={`${file.name}-${index}`}
                                initial={{
                                    opacity: 0,
                                    scale: 0.88,
                                }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                }}
                                exit={{
                                    opacity: 0,
                                    scale: 0.88,
                                }}
                                transition={{
                                    delay: index * 0.04,
                                }}
                                className="group relative"
                            >

                                <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="h-20 w-full rounded-md border border-line object-cover"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setFiles((prev) =>
                                            prev.filter(
                                                (_, i) =>
                                                    i !== index
                                            )
                                        )
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


// ------------------------------------------------------------
// Result Card
// ------------------------------------------------------------

function ResultCard({ item, index }) {

    const isCrack =
        String(item.prediction).toLowerCase() === "crack";

    const structure =
        formatStructure(item.structure);

    const structureConfidence =
        Number(item.structure_confidence ?? 0);

    const crackConfidence =
        Number(item.confidence ?? 0);

    return (

        <motion.div
            initial={{
                opacity: 0,
                x: 12,
            }}
            animate={{
                opacity: 1,
                x: 0,
            }}
            transition={{
                delay: index * 0.07,
            }}
            className="rounded-lg border border-line bg-ink p-4"
        >

            {/* Header */}

            <div className="flex items-start gap-4">

                <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                    style={{
                        backgroundColor: isCrack
                            ? "rgba(255,97,82,0.12)"
                            : "rgba(62,214,196,0.1)",

                        color: isCrack
                            ? "var(--color-crack)"
                            : "#3ed6c4",
                    }}
                >

                    {isCrack ? (
                        <FiAlertTriangle className="h-4 w-4" />
                    ) : (
                        <FiCheckCircle className="h-4 w-4" />
                    )}

                </div>


                <div className="min-w-0 flex-1">

                    <p className="truncate font-mono text-xs text-paper">
                        {item.filename}
                    </p>

                    <p className="mt-1 text-xs text-steel">
                        AI-selected infrastructure model
                    </p>

                </div>


                <span
                    className="shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em]"
                    style={{
                        borderColor: isCrack
                            ? "rgba(255,97,82,0.35)"
                            : "rgba(62,214,196,0.25)",

                        color: isCrack
                            ? "var(--color-crack)"
                            : "#3ed6c4",
                    }}
                >
                    {item.prediction}
                </span>

            </div>


            {/* Detected structure */}

            <div className="mt-4 rounded-md border border-line bg-panel p-3">

                <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-md border border-accent/30 bg-accent/10 font-mono text-xs font-bold text-accent">
                        {getStructureIcon(item.structure)}
                    </div>

                    <div className="flex-1">

                        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-steel">
                            Detected structure
                        </p>

                        <p className="mt-1 text-sm font-medium text-paper">
                            {structure}
                        </p>

                    </div>

                    <div className="text-right">

                        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-steel">
                            Confidence
                        </p>

                        <p className="mt-1 font-mono text-xs text-accent">
                            {structureConfidence.toFixed(1)}%
                        </p>

                    </div>

                </div>


                {/* Structure confidence bar */}

                <div className="mt-3 h-1 overflow-hidden rounded-full bg-line">

                    <motion.div
                        initial={{
                            width: 0,
                        }}
                        animate={{
                            width: `${Math.min(
                                Math.max(
                                    structureConfidence,
                                    0
                                ),
                                100
                            )}%`,
                        }}
                        transition={{
                            duration: 0.7,
                            delay:
                                index * 0.07 +
                                0.15,
                        }}
                        className="h-full rounded-full bg-accent"
                    />

                </div>

            </div>


            {/* Crack prediction */}

            <div className="mt-3">

                <div className="flex items-center justify-between">

                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-steel">
                        Crack confidence
                    </span>

                    <span className="font-mono text-[10px] text-steel">
                        {crackConfidence.toFixed(1)}%
                    </span>

                </div>

                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-line">

                    <motion.div
                        initial={{
                            width: 0,
                        }}
                        animate={{
                            width: `${Math.min(
                                Math.max(
                                    crackConfidence,
                                    0
                                ),
                                100
                            )}%`,
                        }}
                        transition={{
                            duration: 0.6,
                            delay:
                                index * 0.07 +
                                0.25,
                            ease: "easeOut",
                        }}
                        className="h-full rounded-full"
                        style={{
                            backgroundColor:
                                isCrack
                                    ? "var(--color-crack)"
                                    : "#3ed6c4",
                        }}
                    />

                </div>

            </div>

        </motion.div>
    );
}


// ------------------------------------------------------------
// Main Scan Page
// ------------------------------------------------------------

function Scan() {

    const [files, setFiles] = useState([]);

    const [results, setResults] = useState([]);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    // --------------------------------------------------------
    // Run automatic AI scan
    // --------------------------------------------------------

    const handleScan = async () => {

        if (files.length === 0) {

            setError(
                "Select at least one image first."
            );

            return;
        }

        setError("");

        setLoading(true);

        setResults([]);


        try {

            const formData =
                new FormData();


            files.forEach((file) => {

                formData.append(
                    "files",
                    file
                );

            });


            /*
             * IMPORTANT:
             *
             * We intentionally DO NOT send:
             *
             * formData.append("model", ...)
             *
             * The backend will now:
             *
             * Image
             *   ↓
             * Structure classifier
             *   ↓
             * Pavement / Wall / Bridge Deck
             *   ↓
             * Correct crack model
             */


            const response =
                await predictImage(
                    formData
                );


            setResults(
                response.data.results || []
            );

        } catch (error) {

            console.error(
                "Prediction error:",
                error
            );

            setError(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Prediction failed. Please try again."
            );

        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="min-h-screen bg-ink font-body">

            <Navbar />


            <div className="mx-auto max-w-5xl px-6 py-10">

                {/* Page heading */}

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 10,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    className="mb-8"
                >

                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
                        AI analysis
                    </p>

                    <h1 className="mt-1 font-display text-3xl text-paper">
                        New Scan
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm text-steel">
                        Upload an infrastructure image.
                        The AI will automatically identify
                        whether it is pavement, wall, or
                        bridge deck and select the appropriate
                        crack detection model.
                    </p>

                </motion.div>


                <div className="grid gap-6 lg:grid-cols-2">

                    {/* ------------------------------------------------
                        LEFT — Upload
                    ------------------------------------------------ */}

                    <motion.div
                        initial={{
                            opacity: 0,
                            x: -12,
                        }}
                        animate={{
                            opacity: 1,
                            x: 0,
                        }}
                        transition={{
                            delay: 0.1,
                        }}
                        className="space-y-6"
                    >

                        {/* AI automatic detection information */}

                        <div className="rounded-lg border border-accent/30 bg-panel p-5">

                            <div className="flex items-start gap-3">

                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">

                                    <FiCpu className="h-4 w-4" />

                                </div>

                                <div>

                                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
                                        Automatic model selection
                                    </p>

                                    <p className="mt-1.5 text-sm leading-relaxed text-steel">
                                        No manual structure selection
                                        is required. The AI identifies
                                        the infrastructure type and
                                        automatically chooses the
                                        corresponding crack detection
                                        model.
                                    </p>

                                </div>

                            </div>


                            <div className="mt-4 grid grid-cols-3 gap-2">

                                {[
                                    "Pavement",
                                    "Wall",
                                    "Bridge Deck",
                                ].map((name) => (

                                    <div
                                        key={name}
                                        className="rounded-md border border-line bg-ink px-2 py-2 text-center"
                                    >

                                        <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-steel">
                                            {name}
                                        </p>

                                    </div>

                                ))}

                            </div>

                        </div>


                        {/* Upload */}

                        <div className="rounded-lg border border-line bg-panel p-5">

                            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-steel">

                                Images

                                {files.length > 0 &&
                                    ` · ${files.length} selected`}

                            </p>

                            <DropZone
                                files={files}
                                setFiles={setFiles}
                            />

                        </div>


                        {/* Error */}

                        <AnimatePresence>

                            {error && (

                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        y: -4,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    exit={{
                                        opacity: 0,
                                        y: -4,
                                    }}
                                    className="rounded-md border border-crack/40 bg-crack/10 px-4 py-3 font-mono text-xs text-crack"
                                >

                                    {error}

                                </motion.div>

                            )}

                        </AnimatePresence>


                        {/* Scan button */}

                        <motion.button
                            type="button"
                            onClick={handleScan}
                            disabled={
                                loading ||
                                files.length === 0
                            }
                            whileHover={{
                                y:
                                    files.length > 0 &&
                                    !loading
                                        ? -1
                                        : 0,
                            }}
                            whileTap={{
                                scale: 0.98,
                            }}
                            className="flex w-full items-center justify-center gap-2 rounded-md bg-accent py-3.5 font-mono text-sm uppercase tracking-[0.12em] text-ink transition-shadow hover:shadow-[0_0_24px_-4px_var(--color-accent)] disabled:opacity-50"
                        >

                            {loading ? (

                                <>
                                    <motion.div
                                        animate={{
                                            rotate: 360,
                                        }}
                                        transition={{
                                            duration: 1,
                                            repeat:
                                                Infinity,
                                            ease: "linear",
                                        }}
                                    >

                                        <FiLoader className="h-4 w-4" />

                                    </motion.div>

                                    Detecting & Analyzing…
                                </>

                            ) : (

                                <>
                                    <FiZap className="h-4 w-4" />

                                    Detect & Scan
                                </>

                            )}

                        </motion.button>

                    </motion.div>


                    {/* ------------------------------------------------
                        RIGHT — Results
                    ------------------------------------------------ */}

                    <motion.div
                        initial={{
                            opacity: 0,
                            x: 12,
                        }}
                        animate={{
                            opacity: 1,
                            x: 0,
                        }}
                        transition={{
                            delay: 0.15,
                        }}
                        className="rounded-lg border border-line bg-panel p-5"
                    >

                        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-steel">

                            AI Results

                            {results.length > 0 &&
                                ` · ${results.length} images`}

                        </p>


                        {/* Loading */}

                        {loading ? (

                            <div className="flex h-64 flex-col items-center justify-center gap-4">

                                <div className="relative h-14 w-14">

                                    <motion.div
                                        animate={{
                                            rotate: 360,
                                        }}
                                        transition={{
                                            duration: 1.4,
                                            repeat:
                                                Infinity,
                                            ease: "linear",
                                        }}
                                        className="absolute inset-0 rounded-full border-2 border-line border-t-accent"
                                    />

                                    <div className="absolute inset-2 flex items-center justify-center">

                                        <FiCpu className="h-4 w-4 text-accent" />

                                    </div>

                                </div>


                                <div className="text-center">

                                    <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
                                        AI detecting structure
                                    </p>

                                    <p className="mt-1 text-sm text-steel">
                                        Identifying infrastructure
                                        and running the appropriate
                                        crack model…
                                    </p>

                                </div>

                            </div>

                        ) : results.length === 0 ? (

                            <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">

                                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-line text-steel/40">

                                    <FiCpu className="h-5 w-5" />

                                </div>

                                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-steel">
                                    Awaiting image
                                </p>

                                <p className="max-w-sm text-sm text-steel/60">
                                    Upload an infrastructure image.
                                    AI will automatically detect
                                    the structure and run the
                                    appropriate crack detection
                                    model.
                                </p>

                            </div>

                        ) : (

                            <div className="max-h-[600px] space-y-3 overflow-y-auto pr-1">

                                {results.map(
                                    (item, index) => (

                                        <ResultCard
                                            key={`${item.filename}-${index}`}
                                            item={item}
                                            index={index}
                                        />

                                    )
                                )}

                            </div>

                        )}

                    </motion.div>

                </div>

            </div>

        </div>

    );
}

export default Scan;