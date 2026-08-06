import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheck } from "react-icons/fi";
import { registerUser } from "../services/api";
import ScanPanel from "../components/ScanPanel";

const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

function StrengthBar({ password }) {
    const score = !password
        ? 0
        : [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) => r.test(password)).length;

    const labels = ["", "Weak", "Fair", "Good", "Strong"];
    const colors = ["", "#ff6152", "#f2a93b", "#ffd27a", "#3ed6c4"];

    return (
        <div className="mt-2 space-y-1.5">
            <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                    <motion.div
                        key={i}
                        className="h-0.5 flex-1 rounded-full"
                        style={{ backgroundColor: i <= score ? colors[score] : "var(--color-line)" }}
                        animate={{ backgroundColor: i <= score ? colors[score] : "var(--color-line)" }}
                        transition={{ duration: 0.3 }}
                    />
                ))}
            </div>
            {score > 0 && (
                <p className="font-mono text-[10px]" style={{ color: colors[score] }}>
                    {labels[score]}
                </p>
            )}
        </div>
    );
}

function Field({ label, icon: Icon, children }) {
    return (
        <motion.div variants={itemVariants}>
            <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-steel">
                {label}
            </label>
            <div className="group flex items-center gap-2 rounded-md border border-line bg-ink px-3 py-2.5 transition-colors focus-within:border-accent">
                <Icon className="h-4 w-4 shrink-0 text-steel transition-colors group-focus-within:text-accent" />
                {children}
            </div>
        </motion.div>
    );
}

function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: "", email: "", password: "" });
    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const handleRegister = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            await registerUser(form);
            setDone(true);
            setTimeout(() => navigate("/login"), 2600);
        } catch (err) {
            setError(err.response?.data?.detail || "Registration failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-ink font-body">
            <ScanPanel />

            <div className="relative flex w-full lg:w-[54%] items-center justify-center px-6 py-16">
                <div
                    className="pointer-events-none absolute inset-0 opacity-30"
                    style={{
                        backgroundImage: "radial-gradient(var(--color-line) 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                    }}
                />

                <AnimatePresence mode="wait">
                    {done ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative z-10 flex flex-col items-center gap-4 text-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                                className="flex h-14 w-14 items-center justify-center rounded-full border border-accent bg-accent/10 text-accent"
                            >
                                <FiCheck className="h-6 w-6" />
                            </motion.div>
                            <h2 className="font-display text-2xl text-paper">Account created</h2>
                            <p className="max-w-xs text-sm text-steel">
                                Check your email for a verification link, then sign in.
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="form"
                            initial="hidden"
                            animate="show"
                            variants={containerVariants}
                            className="relative z-10 w-full max-w-sm"
                        >
                            <div className="relative rounded-lg border border-line bg-panel/80 p-8 shadow-[0_0_0_1px_rgba(0,0,0,0.2)] backdrop-blur-sm">
                                <span className="absolute -left-px -top-px h-5 w-5 border-l-2 border-t-2 border-accent" />
                                <span className="absolute -right-px -top-px h-5 w-5 border-r-2 border-t-2 border-accent" />
                                <span className="absolute -left-px -bottom-px h-5 w-5 border-l-2 border-b-2 border-accent" />
                                <span className="absolute -right-px -bottom-px h-5 w-5 border-r-2 border-b-2 border-accent" />

                                <motion.div variants={itemVariants} className="mb-8">
                                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                                        New inspector
                                    </p>
                                    <h1 className="mt-2 font-display text-3xl text-paper">
                                        Create account
                                    </h1>
                                    <p className="mt-2 text-sm text-steel">
                                        Start scanning structural cracks in minutes.
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

                                <form onSubmit={handleRegister} className="space-y-4">
                                    <Field label="Username" icon={FiUser}>
                                        <input
                                            type="text"
                                            placeholder="inspector_01"
                                            value={form.username}
                                            onChange={set("username")}
                                            className="w-full bg-transparent text-sm text-paper placeholder:text-steel/60 focus:outline-none"
                                            required
                                        />
                                    </Field>

                                    <Field label="Email" icon={FiMail}>
                                        <input
                                            type="email"
                                            placeholder="you@company.com"
                                            value={form.email}
                                            onChange={set("email")}
                                            className="w-full bg-transparent text-sm text-paper placeholder:text-steel/60 focus:outline-none"
                                            required
                                        />
                                    </Field>

                                    <motion.div variants={itemVariants}>
                                        <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-steel">
                                            Password
                                        </label>
                                        <div className="group flex items-center gap-2 rounded-md border border-line bg-ink px-3 py-2.5 transition-colors focus-within:border-accent">
                                            <FiLock className="h-4 w-4 shrink-0 text-steel group-focus-within:text-accent" />
                                            <input
                                                type={showPwd ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={form.password}
                                                onChange={set("password")}
                                                className="w-full bg-transparent text-sm text-paper placeholder:text-steel/60 focus:outline-none"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPwd((s) => !s)}
                                                className="shrink-0 text-steel hover:text-paper"
                                                aria-label={showPwd ? "Hide password" : "Show password"}
                                            >
                                                {showPwd ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        <StrengthBar password={form.password} />
                                    </motion.div>

                                    <motion.button
                                        variants={itemVariants}
                                        type="submit"
                                        disabled={submitting}
                                        whileHover={{ y: -1 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="group mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-accent py-3 text-sm font-semibold text-ink transition-shadow hover:shadow-[0_0_24px_-4px_var(--color-accent)] disabled:opacity-60"
                                    >
                                        {submitting ? "Creating account…" : "Create account"}
                                        {!submitting && (
                                            <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                        )}
                                    </motion.button>
                                </form>

                                <motion.p variants={itemVariants} className="mt-6 text-center text-sm text-steel">
                                    Already have an account?{" "}
                                    <Link to="/login" className="font-medium text-accent hover:text-accent-2">
                                        Sign in
                                    </Link>
                                </motion.p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default Register;