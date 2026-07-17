import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api";

function Register() {

    const navigate = useNavigate();

    const [username, setUsername] = useState("");

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [error, setError] = useState("");

    const handleRegister = async (e) => {

        e.preventDefault();

        try {

            await registerUser({

                username,

                email,

                password

            });

            navigate("/login");

        }

        catch (err) {

            setError(

                err.response?.data?.detail ||

                "Registration Failed"

            );

        }

    };

    return (

        <div className="min-h-screen flex justify-center items-center bg-gray-100">

            <form
                onSubmit={handleRegister}
                className="bg-white p-8 rounded-xl shadow-lg w-96"
            >

                <h2 className="text-3xl font-bold text-center mb-6">

                    Register

                </h2>

                {error && (

                    <p className="text-red-500 mb-4">

                        {error}

                    </p>

                )}

                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e)=>setUsername(e.target.value)}
                    className="w-full border p-3 rounded-lg mb-4"
                    required
                />

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                    className="w-full border p-3 rounded-lg mb-4"
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                    className="w-full border p-3 rounded-lg mb-6"
                    required
                />

                <button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg"
                >

                    Register

                </button>

                <p className="text-center mt-4">

                    Already have an account?

                    <Link
                        to="/login"
                        className="text-blue-600 ml-2"
                    >
                        Login
                    </Link>

                </p>

            </form>

        </div>

    );

}

export default Register;