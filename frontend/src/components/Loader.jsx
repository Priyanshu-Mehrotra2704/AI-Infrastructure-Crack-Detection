import { motion } from "framer-motion";
import { FiZap } from "react-icons/fi";

// ---- Exact same role as original Loader — shown while loading===true ----
function Loader() {
    return (
        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-line bg-panel p-8">

            <div className="relative h-16 w-16">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-2 border-line border-t-accent"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <FiZap className="h-5 w-5 text-accent" />
                </div>
            </div>

            <h2 className="mt-6 font-display text-xl text-paper">
                AI is Analyzing...
            </h2>
            <p className="mt-3 text-center text-sm text-steel">
                Please wait while the model processes the uploaded image.
            </p>

        </div>
    );
}

export default Loader;