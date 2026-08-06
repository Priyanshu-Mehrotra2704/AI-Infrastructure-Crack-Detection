import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import { loginUser, loginWithGoogle } from "../services/api";
import ScanPanel from "../components/ScanPanel";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const containerVariants = {
    hidden: {},
    show: {
        transition: { staggerChildren: 0.07, delayChildren: 0.15 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        try {
            await loginUser({ email, password });
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.detail || "Login failed");
        } finally {
            setSubmitting(false);
        }
    };

    // ---- Google Sign-In ----
    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) {
            console.warn("VITE_GOOGLE_CLIENT_ID is not set — Google sign-in disabled.");
            return;
        }

        const handleGoogleResponse = async (googleResponse) => {
            try {
                await loginWithGoogle(googleResponse.credential);
                navigate("/");
            } catch (err) {
                setError(err.response?.data?.detail || "Google sign-in failed.");
            }
        };

        const initializeGoogle = () => {
            if (!window.google || !document.getElementById("google-signin-button")) {
                return;
            }

            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleResponse,
            });

            window.google.accounts.id.renderButton(
                document.getElementById("google-signin-button"),
                { theme: "outline", size: "large", width: 320 }
            );
        };

        // The GIS script (loaded in index.html) may not be ready the
        // instant this component mounts — poll briefly until it is.
        if (window.google) {
            initializeGoogle();
        } else {
            const interval = setInterval(() => {
                if (window.google) {
                    initializeGoogle();
                    clearInterval(interval);
                }
            }, 200);
            return () => clearInterval(interval);
        }
    }, [navigate]);

    return (
        <div className="flex min-h-screen bg-ink font-body">
            <ScanPanel />

            <div className="relative flex w-full lg:w-[54%] items-center justify-center px-6 py-16">
                {/* faint corner grid, mobile/tablet also gets a hint of the brand */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-30"
                    style={{
                        backgroundImage:
                            "radial-gradient(var(--color-line) 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                    }}
                />

                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={containerVariants}
                    className="relative z-10 w-full max-w-sm"
                >
                    {/* corner bracket frame */}
                    <div className="relative rounded-lg border border-line bg-panel/80 p-8 shadow-[0_0_0_1px_rgba(0,0,0,0.2)] backdrop-blur-sm">
                        <span className="absolute -left-px -top-px h-5 w-5 border-l-2 border-t-2 border-accent" />
                        <span className="absolute -right-px -top-px h-5 w-5 border-r-2 border-t-2 border-accent" />
                        <span className="absolute -left-px -bottom-px h-5 w-5 border-l-2 border-b-2 border-accent" />
                        <span className="absolute -right-px -bottom-px h-5 w-5 border-r-2 border-b-2 border-accent" />

                        <motion.div variants={itemVariants} className="mb-8">
                            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                                Inspector access
                            </p>
                            <h1 className="mt-2 font-display text-3xl text-paper">
                                Welcome back
                            </h1>
                            <p className="mt-2 text-sm text-steel">
                                Sign in to review your latest structural scans.
                            </p>
                        </motion.div>

                        <AnimatePresence>
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    className="mb-5 rounded-md border border-crack/40 bg-crack/10 px-3 py-2 text-sm text-crack"
                                >
                                    {error}
                                </motion.p>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <motion.div variants={itemVariants}>
                                <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-steel">
                                    Email
                                </label>
                                <div className="group flex items-center gap-2 rounded-md border border-line bg-ink px-3 py-2.5 transition-colors focus-within:border-accent">
                                    <FiMail className="h-4 w-4 shrink-0 text-steel transition-colors group-focus-within:text-accent" />
                                    <input
                                        type="email"
                                        placeholder="you@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-transparent text-sm text-paper placeholder:text-steel/60 focus:outline-none"
                                        required
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <div className="mb-1.5 flex items-center justify-between">
                                    <label className="block font-mono text-[11px] uppercase tracking-[0.14em] text-steel">
                                        Password
                                    </label>
                                </div>
                                <div className="group flex items-center gap-2 rounded-md border border-line bg-ink px-3 py-2.5 transition-colors focus-within:border-accent">
                                    <FiLock className="h-4 w-4 shrink-0 text-steel transition-colors group-focus-within:text-accent" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-transparent text-sm text-paper placeholder:text-steel/60 focus:outline-none"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((s) => !s)}
                                        className="shrink-0 text-steel transition-colors hover:text-paper"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? (
                                            <FiEyeOff className="h-4 w-4" />
                                        ) : (
                                            <FiEye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </motion.div>

                            <motion.button
                                variants={itemVariants}
                                type="submit"
                                disabled={submitting}
                                whileHover={{ y: -1 }}
                                whileTap={{ scale: 0.98 }}
                                className="group mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-accent py-3 text-sm font-semibold text-ink transition-shadow hover:shadow-[0_0_24px_-4px_var(--color-accent)] disabled:opacity-60"
                            >
                                {submitting ? "Signing in…" : "Sign in"}
                                {!submitting && (
                                    <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                )}
                            </motion.button>
                        </form>

                        <motion.div variants={itemVariants} className="my-6 flex items-center gap-3">
                            <div className="h-px flex-1 bg-line" />
                            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel">
                                Or continue with
                            </span>
                            <div className="h-px flex-1 bg-line" />
                        </motion.div>

                        <motion.div variants={itemVariants} id="google-signin-button" className="flex justify-center" />

                        <motion.p variants={itemVariants} className="mt-6 text-center text-sm text-steel">
                            Don't have an account?{" "}
                            <Link to="/register" className="font-medium text-accent hover:text-accent-2">
                                Register
                            </Link>
                        </motion.p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default Login;