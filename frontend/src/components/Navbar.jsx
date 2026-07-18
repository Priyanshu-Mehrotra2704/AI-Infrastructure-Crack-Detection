import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Navbar() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    useEffect(() => {

        const fetchUser = async () => {

            try {

                const response = await API.get("/auth/me");

                setUser(response.data);

            } catch (error) {

                console.error(error);

            }

        };

        fetchUser();

    }, []);

    const handleLogout = async () => {

        try {

            await API.post("/auth/logout");

            navigate("/login");

        } catch (error) {

            console.error(error);

        }

    };

    return (

        <nav className="bg-white shadow-md">

            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

                {/* Left */}

                <h1 className="text-2xl font-bold text-blue-600">

                    AI Crack Detection

                </h1>

                {/* Center */}

                <ul className="flex gap-8 text-gray-700 font-medium">

                    <li className="cursor-pointer hover:text-blue-600 transition">
                        Dashboard
                    </li>

                    <li className="cursor-pointer hover:text-blue-600 transition">
                        History
                    </li>

                    <li className="cursor-pointer hover:text-blue-600 transition">
                        Analytics
                    </li>

                    <li className="cursor-pointer hover:text-blue-600 transition">
                        About
                    </li>

                </ul>

                {/* Right */}

                <div className="flex items-center gap-4">

                    <span className="font-semibold text-gray-700">

                        👤 {user?.username}

                    </span>

                    <button

                        onClick={handleLogout}

                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"

                    >

                        Logout

                    </button>

                </div>

            </div>

        </nav>

    );

}

export default Navbar;