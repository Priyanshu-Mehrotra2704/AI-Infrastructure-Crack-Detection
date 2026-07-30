import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { verifyEmail } from "../services/api";

function VerifyEmail() {

    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [status, setStatus] = useState("verifying"); // verifying | success | error
    const [message, setMessage] = useState("Verifying your email...");

    useEffect(() => {

        if (!token) {
            setStatus("error");
            setMessage("Missing verification token.");
            return;
        }

        const run = async () => {

            try {

                const res = await verifyEmail(token);

                setStatus("success");
                setMessage(res.data.message || "Email verified successfully.");

            } catch (err) {

                setStatus("error");

                setMessage(
                    err.response?.data?.detail || "Verification failed."
                );

            }

        };

        run();

    }, [token]);

    return (

        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

            <div className="max-w-md w-full bg-white rounded-lg shadow p-8 text-center">

                {status === "verifying" && (
                    <p className="text-gray-600">{message}</p>
                )}

                {status === "success" && (
                    <>
                        <h1 className="text-xl font-semibold text-green-600 mb-2">
                            Email Verified
                        </h1>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <Link
                            to="/login"
                            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Go to Login
                        </Link>
                    </>
                )}

                {status === "error" && (
                    <>
                        <h1 className="text-xl font-semibold text-red-600 mb-2">
                            Verification Failed
                        </h1>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <Link
                            to="/login"
                            className="inline-block bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                        >
                            Back to Login
                        </Link>
                    </>
                )}

            </div>

        </div>

    );

}

export default VerifyEmail;