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

        <div className="min-h-screen flex justify-center items-center bg-gray-100">

            <form

                onSubmit={handleLogin}

                className="bg-white p-8 rounded-xl shadow-lg w-96"

            >

                <h2 className="text-3xl font-bold text-center mb-6">

                    Login

                </h2>

                {error && (

                    <p className="text-red-500 mb-4">

                        {error}

                    </p>

                )}

                <input

                    type="email"

                    placeholder="Email"

                    value={email}

                    onChange={(e) =>

                        setEmail(e.target.value)

                    }

                    className="w-full border p-3 rounded-lg mb-4"

                    required

                />

                <input

                    type="password"

                    placeholder="Password"

                    value={password}

                    onChange={(e) =>

                        setPassword(e.target.value)

                    }

                    className="w-full border p-3 rounded-lg mb-6"

                    required

                />

                <button

                    className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg"

                >

                    Login

                </button>

                <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-gray-400 text-sm">OR</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div id="google-signin-button" className="flex justify-center" />

                <p className="text-center mt-4">Don't have an account?
                    <Link to="/register" className="text-blue-600 ml-2">Register</Link>

                </p>

            </form>

        </div>

    );

}

export default Login;