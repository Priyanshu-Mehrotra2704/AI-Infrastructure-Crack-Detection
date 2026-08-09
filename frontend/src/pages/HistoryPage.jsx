import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import History from "../components/History";

function HistoryPage() {

    // ---- Same refreshHistory bool toggle from original Dashboard ----
    const [refreshHistory, setRefreshHistory] = useState(false);

    useEffect(() => {
        // ScanPage dispatches "history-refresh" after a successful prediction
        // — same trigger as original Dashboard's setRefreshHistory(!refreshHistory)
        const onRefresh = () => setRefreshHistory((r) => !r);
        window.addEventListener("history-refresh", onRefresh);
        return () => window.removeEventListener("history-refresh", onRefresh);
    }, []);

    return (
        <div className="min-h-screen bg-ink font-body">
            <Navbar />

            <div className="mx-auto max-w-7xl px-6 py-10">

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-2"
                >
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
                        Inspection log
                    </p>
                    <h1 className="mt-1 font-display text-3xl text-paper">
                        History
                    </h1>
                </motion.div>

                {/* History — same refresh prop as original Dashboard */}
                <History refresh={refreshHistory} />

            </div>
        </div>
    );
}

export default HistoryPage;