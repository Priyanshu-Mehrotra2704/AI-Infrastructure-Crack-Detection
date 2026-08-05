import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Hand-authored crack geometry — a main fracture with two branch fissures,
// loosely modeled on how shrinkage cracks propagate through concrete.
const MAIN_CRACK =
    "M250,26 L238,68 L263,94 L229,141 L249,176 L204,206 L223,251 L179,276 L199,321 L149,346 L166,396 L119,421 L141,471 L94,501 L112,566";
const BRANCH_A = "M229,141 L271,151 L297,177";
const BRANCH_B = "M199,321 L237,336 L258,362";

const MARKERS = [
    { x: 249, y: 176, width: "0.6mm", confidence: "96.4%", delay: 1.1 },
    { x: 297, y: 177, width: "0.3mm", confidence: "88.1%", delay: 1.9 },
    { x: 166, y: 396, width: "1.1mm", confidence: "99.2%", delay: 2.6 },
];

function ScanPanel({ brand = "CRACKWATCH" }) {
    const prefersReducedMotion = useReducedMotion();
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (prefersReducedMotion) {
            setCount(MARKERS.length);
            return;
        }
        const timers = MARKERS.map((m, i) =>
            setTimeout(() => setCount(i + 1), m.delay * 1000)
        );
        return () => timers.forEach(clearTimeout);
    }, [prefersReducedMotion]);

    return (
        <div className="relative hidden lg:flex w-[46%] min-h-screen flex-col justify-between overflow-hidden bg-ink px-12 py-10">
            {/* blueprint grid */}
            <div
                className="pointer-events-none absolute inset-0 opacity-60"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, var(--color-line) 1px, transparent 1px), linear-gradient(to bottom, var(--color-line) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                }}
            />
            {/* vignette */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        "radial-gradient(ellipse at 30% 20%, transparent 0%, var(--color-ink) 78%)",
                }}
            />

            {/* brand mark */}
            <div className="relative z-10 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-sm border border-accent/50 text-accent">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                        <path
                            d="M12 2 L10 9 L14 11 L9 22 L11 13 L7 12 Z"
                            fill="currentColor"
                        />
                    </svg>
                </span>
                <span className="font-display text-lg tracking-[0.14em] text-paper">
                    {brand}
                </span>
            </div>

            {/* the crack scan visual */}
            <div className="relative z-10 flex-1 flex items-center justify-center py-8">
                <svg
                    viewBox="0 0 400 600"
                    className="h-[62vh] max-h-[560px] w-auto"
                    aria-hidden="true"
                >
                    <defs>
                        <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0" />
                            <stop offset="50%" stopColor="var(--color-accent)" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
                        </linearGradient>
                        <filter id="noise">
                            <feTurbulence
                                type="fractalNoise"
                                baseFrequency="0.9"
                                numOctaves="2"
                                stitchTiles="stitch"
                                result="noise"
                            />
                            <feColorMatrix
                                in="noise"
                                type="matrix"
                                values="0 0 0 0 0.93  0 0 0 0 0.94  0 0 0 0 0.96  0 0 0 0.05 0"
                            />
                        </filter>
                    </defs>

                    {/* concrete slab */}
                    <rect
                        x="30"
                        y="10"
                        width="340"
                        height="580"
                        rx="4"
                        fill="var(--color-panel)"
                        stroke="var(--color-line)"
                    />
                    <rect
                        x="30"
                        y="10"
                        width="340"
                        height="580"
                        rx="4"
                        filter="url(#noise)"
                    />

                    {/* corner ticks */}
                    {[
                        [30, 10, 1, 1],
                        [370, 10, -1, 1],
                        [30, 590, 1, -1],
                        [370, 590, -1, -1],
                    ].map(([x, y, dx, dy], i) => (
                        <path
                            key={i}
                            d={`M${x} ${y + dy * 18} L${x} ${y} L${x + dx * 18} ${y}`}
                            stroke="var(--color-accent)"
                            strokeWidth="1.5"
                            fill="none"
                            opacity="0.7"
                        />
                    ))}

                    {/* crack geometry, drawn on */}
                    <motion.path
                        d={MAIN_CRACK}
                        stroke="var(--color-paper)"
                        strokeWidth="2.25"
                        strokeLinecap="round"
                        fill="none"
                        initial={{ pathLength: 0, opacity: 0.9 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.8, ease: "easeInOut", delay: 0.4 }}
                    />
                    <motion.path
                        d={BRANCH_A}
                        stroke="var(--color-paper)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        fill="none"
                        opacity="0.85"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.8, ease: "easeInOut", delay: 1.5 }}
                    />
                    <motion.path
                        d={BRANCH_B}
                        stroke="var(--color-paper)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        fill="none"
                        opacity="0.85"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.8, ease: "easeInOut", delay: 2.1 }}
                    />

                    {/* sweeping scan line */}
                    {!prefersReducedMotion && (
                        <motion.rect
                            x="30"
                            y="0"
                            width="340"
                            height="90"
                            fill="url(#scanGrad)"
                            initial={{ y: -90 }}
                            animate={{ y: 610 }}
                            transition={{
                                duration: 3.2,
                                ease: "linear",
                                delay: 0.2,
                                repeat: Infinity,
                                repeatDelay: 1.4,
                            }}
                        />
                    )}

                    {/* detection markers */}
                    {MARKERS.map((m, i) => (
                        <motion.g
                            key={i}
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.35, delay: prefersReducedMotion ? 0 : m.delay }}
                        >
                            <circle
                                cx={m.x}
                                cy={m.y}
                                r="5"
                                fill="none"
                                stroke="var(--color-crack)"
                                strokeWidth="1.5"
                            />
                            <motion.circle
                                cx={m.x}
                                cy={m.y}
                                r="5"
                                fill="var(--color-crack)"
                                initial={{ opacity: 0.5, scale: 1 }}
                                animate={{ opacity: 0, scale: 2.4 }}
                                transition={{
                                    duration: 1.4,
                                    delay: prefersReducedMotion ? 0 : m.delay,
                                    repeat: prefersReducedMotion ? 0 : Infinity,
                                    repeatDelay: 2.2,
                                }}
                            />
                        </motion.g>
                    ))}
                </svg>
            </div>

            {/* readout footer */}
            <div className="relative z-10 flex items-end justify-between border-t border-line pt-5 font-mono text-xs text-steel">
                <div>
                    <div className="uppercase tracking-[0.18em] text-steel/70">
                        Cracks detected
                    </div>
                    <div className="mt-1 text-2xl text-paper">
                        {String(count).padStart(2, "0")}
                    </div>
                </div>
                <div className="text-right">
                    <div className="uppercase tracking-[0.18em] text-steel/70">
                        Model
                    </div>
                    <div className="mt-1 text-paper">ResNet-CrackNet v2</div>
                </div>
            </div>
        </div>
    );
}

export default ScanPanel;