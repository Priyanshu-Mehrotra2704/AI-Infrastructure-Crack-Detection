import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiCheck, FiAlertTriangle, FiLoader } from "react-icons/fi";
import { verifyEmail } from "../services/api";

function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [status, setStatus] = useState("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("No verification token found in the link.");
            return;
        }
        verifyEmail(token)
            .then((res) => {
                setStatus("success");
                setMessage(res.data.message || "Email verified successfully.");
            })
            .catch((err) => {
                setStatus("error");
                setMessage(
                    err.response?.data?.detail ||
                    "This verification link is invalid or has expired."
                );
            });
    }, [token]);

    return (
        <div
            className="flex min-h-screen items-center justify-center bg-ink px-4"
            style={{
                backgroundImage: "radial-gradient(var(--color-line) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative w-full max-w-sm"
            >
                <div className="relative rounded-lg border border-line bg-panel/80 p-10 text-center backdrop-blur-sm">
                    <span className="absolute -left-px -top-px h-5 w-5 border-l-2 border-t-2 border-accent" />
                    <span className="absolute -right-px -top-px h-5 w-5 border-r-2 border-t-2 border-accent" />
                    <span className="absolute -left-px -bottom-px h-5 w-5 border-l-2 border-b-2 border-accent" />
                    <span className="absolute -right-px -bottom-px h-5 w-5 border-r-2 border-b-2 border-accent" />

                    {status === "loading" && (
                        <div className="flex flex-col items-center gap-4">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="flex h-12 w-12 items-center justify-center rounded-full border border-line text-steel"
                            >
                                <FiLoader className="h-5 w-5" />
                            </motion.div>
                            <p className="font-mono text-xs uppercase tracking-[0.18em] text-steel">
                                Verifying your email…
                            </p>
                        </div>
                    )}

                    {status === "success" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                                className="flex h-12 w-12 items-center justify-center rounded-full border border-accent/50 bg-accent/10 text-accent"
                            >
                                <FiCheck className="h-5 w-5" />
                            </motion.div>
                            <div>
                                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                                    Verified
                                </p>
                                <h2 className="mt-2 font-display text-xl text-paper">{message}</h2>
                            </div>
                            <Link
                                to="/login"
                                className="mt-2 rounded-md bg-accent px-5 py-2.5 font-mono text-xs uppercase tracking-[0.1em] text-ink transition-shadow hover:shadow-[0_0_20px_-4px_var(--color-accent)]"
                            >
                                Sign in
                            </Link>
                        </motion.div>
                    )}

                    {status === "error" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-crack/40 bg-crack/10 text-crack">
                                <FiAlertTriangle className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-crack">
                                    Verification failed
                                </p>
                                <h2 className="mt-2 font-display text-lg text-paper">{message}</h2>
                            </div>
                            <Link
                                to="/login"
                                className="mt-2 rounded-md border border-line px-5 py-2.5 font-mono text-xs uppercase tracking-[0.1em] text-steel transition-colors hover:border-steel hover:text-paper"
                            >
                                Back to login
                            </Link>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

export default VerifyEmail;