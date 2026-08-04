import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, loginWithGoogle } from "../services/api";
import { Link } from "react-router-dom";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [error, setError] = useState("");

    const handleLogin = async (e) => {

        e.preventDefault();

        try {

            await loginUser({

                email,

                password

            });

            navigate("/");

        }

        catch (err) {

            setError(

                err.response?.data?.detail ||

                "Login Failed"

            );

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

                setError(
                    err.response?.data?.detail ||
                    "Google sign-in failed."
                );

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

        <div className="min-h-screen lg:grid lg:grid-cols-2 bg-[#F6F2E7]">

            {/* Fonts — move these <link> tags into index.html for production */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');

                .ledger-underline {
                    stroke-dasharray: 240;
                    stroke-dashoffset: 240;
                    animation: draw-underline 1.1s 0.35s cubic-bezier(0.65, 0, 0.35, 1) forwards;
                }

                @keyframes draw-underline {
                    to { stroke-dashoffset: 0; }
                }

                .ledger-rise {
                    opacity: 0;
                    transform: translateY(8px);
                    animation: rise 0.6s ease-out forwards;
                }

                @keyframes rise {
                    to { opacity: 1; transform: translateY(0); }
                }

                @media (prefers-reduced-motion: reduce) {
                    .ledger-underline { animation: none; stroke-dashoffset: 0; }
                    .ledger-rise { animation: none; opacity: 1; transform: none; }
                }
            `}</style>

            {/* ---- Left: the cover ---- */}
            <div className="relative overflow-hidden bg-[#12151C] px-8 py-14 sm:px-14 lg:px-20 lg:py-0 flex flex-col justify-between lg:min-h-screen">

                {/* faint diagonal cloth-cover texture */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage:
                            "repeating-linear-gradient(135deg, #C9973F 0px, #C9973F 1px, transparent 1px, transparent 14px)",
                    }}
                />

                {/* stitched spine seam, desktop only */}
                <div
                    className="hidden lg:block absolute top-0 bottom-0 right-0 w-px"
                    style={{
                        backgroundImage:
                            "repeating-linear-gradient(180deg, #C9973F 0 6px, transparent 6px 14px)",
                        opacity: 0.35,
                    }}
                />

                <div className="relative">
                    <span
                        className="text-[11px] tracking-[0.28em] text-[#C9973F]"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                        VOLUME&nbsp;II
                    </span>
                    <p
                        className="mt-3 text-2xl text-[#F3F1EC]"
                        style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
                    >
                        Ledger
                    </p>
                </div>

                <div className="relative max-w-md py-16 lg:py-0">
                    <h1
                        className="text-[2.75rem] sm:text-5xl leading-[1.08] text-[#F3F1EC]"
                        style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
                    >
                        Every entry
                        <br />
                        finds its way
                        <br />
                        back to you.
                    </h1>

                    <svg
                        width="220"
                        height="14"
                        viewBox="0 0 220 14"
                        fill="none"
                        className="mt-5"
                        aria-hidden="true"
                    >
                        <path
                            className="ledger-underline"
                            d="M2 8C40 2 90 12 130 6C160 1 190 10 218 5"
                            stroke="#C9973F"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>

                    <p className="mt-6 text-[15px] leading-relaxed text-[#8A8F98]">
                        Sign back in to pick up exactly where you left the page open.
                    </p>
                </div>

                <p
                    className="relative text-[11px] tracking-[0.2em] text-[#5A5F68]"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                    KEPT SINCE 2024
                </p>
            </div>

            {/* ---- Right: the page ---- */}
            <div className="flex items-center justify-center px-6 py-16 sm:px-10 lg:py-0">
                <div className="w-full max-w-[380px] ledger-rise">

                    <span
                        className="text-[11px] tracking-[0.28em] text-[#8B8578]"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                        ACCOUNT ACCESS
                    </span>

                    <h2
                        className="mt-3 text-3xl text-[#211E18]"
                        style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
                    >
                        Sign in
                    </h2>

                    {error && (
                        <div className="mt-5 flex items-start gap-2 border-l-2 border-[#B3432B] pl-3 py-1">
                            <span
                                className="text-[10px] tracking-[0.16em] text-[#B3432B] mt-[3px]"
                                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                                ERROR
                            </span>
                            <p className="text-[14px] text-[#B3432B]">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="mt-8">

                        <div className="group">
                            <label
                                htmlFor="email"
                                className="block text-[10px] tracking-[0.18em] text-[#8B8578] group-focus-within:text-[#C9973F] transition-colors"
                                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                                EMAIL
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-transparent border-0 border-b-2 border-[#E3DAC5] focus:border-[#C9973F] outline-none py-2.5 mt-1 text-[15px] text-[#211E18] placeholder:text-[#B7AF9C] transition-colors"
                                style={{ fontFamily: "'Inter', sans-serif" }}
                                required
                            />
                        </div>

                        <div className="group mt-6">
                            <label
                                htmlFor="password"
                                className="block text-[10px] tracking-[0.18em] text-[#8B8578] group-focus-within:text-[#C9973F] transition-colors"
                                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                                PASSWORD
                            </label>
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-transparent border-0 border-b-2 border-[#E3DAC5] focus:border-[#C9973F] outline-none py-2.5 mt-1 text-[15px] text-[#211E18] placeholder:text-[#B7AF9C] transition-colors"
                                style={{ fontFamily: "'Inter', sans-serif" }}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full mt-9 py-3 rounded-sm bg-[#12151C] text-[#F3F1EC] text-[14px] tracking-[0.04em] hover:bg-[#1B2029] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9973F] transition-colors"
                            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                        >
                            Sign in
                        </button>

                    </form>

                    <div className="flex items-center gap-4 my-7">
                        <div className="flex-1 h-px bg-[#E3DAC5]" />
                        <span
                            className="text-[10px] tracking-[0.2em] text-[#B7AF9C]"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                            OR
                        </span>
                        <div className="flex-1 h-px bg-[#E3DAC5]" />
                    </div>

                    <div id="google-signin-button" className="flex justify-center" />

                    <p
                        className="text-center mt-8 text-[14px] text-[#8B8578]"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                        Don't have an account?{" "}
                        <Link to="/register" className="text-[#211E18] font-medium underline underline-offset-4 decoration-[#E3DAC5] hover:decoration-[#C9973F] transition-colors">
                            Register
                        </Link>
                    </p>

                </div>
            </div>

        </div>

    );

}

export default Login;