import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import { Link } from "react-router-dom";
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
                <p className="text-center mt-4">Don't have an account?
                    <Link to="/register" className="text-blue-600 ml-2">Register</Link>

                </p>

            </form>

        </div>

    );

}

export default Login;