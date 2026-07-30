import { useState } from "react";
import { resendVerification } from "../services/api";

// Drop this into Login.jsx. Render it when your login error handler sees
// the login request fail with status 403 and detail === "EMAIL_NOT_VERIFIED".
// You'll need to pass in the email the user just tried to log in with.
//
// Example wiring inside Login.jsx's catch block:
//
//   catch (err) {
//       if (err.response?.status === 403 && err.response?.data?.detail === "EMAIL_NOT_VERIFIED") {
//           setUnverifiedEmail(email);
//       } else {
//           setError("Invalid email or password.");
//       }
//   }
//
// then somewhere in the render: {unverifiedEmail && <ResendVerification email={unverifiedEmail} />}

function ResendVerification({ email }) {

    const [status, setStatus] = useState("idle"); // idle | sending | sent | error
    const [message, setMessage] = useState("");

    const handleResend = async () => {

        setStatus("sending");

        try {

            const res = await resendVerification(email);

            setStatus("sent");
            setMessage(res.data.message || "Verification email sent.");

        } catch (err) {

            setStatus("error");

            setMessage(
                err.response?.data?.detail || "Couldn't resend the email."
            );

        }

    };

    return (

        <div className="mt-3 text-sm text-center">

            <p className="text-red-600 mb-2">
                Please verify your email before logging in.
            </p>

            {status !== "sent" && (
                <button
                    onClick={handleResend}
                    disabled={status === "sending"}
                    className="text-blue-600 hover:underline disabled:text-gray-400"
                >
                    {status === "sending" ? "Sending..." : "Resend verification email"}
                </button>
            )}

            {message && (
                <p className={`mt-1 ${status === "error" ? "text-red-600" : "text-green-600"}`}>
                    {message}
                </p>
            )}

        </div>

    );

}

export default ResendVerification;