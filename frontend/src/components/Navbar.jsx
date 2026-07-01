function Navbar() {
    return (
        <nav className="bg-white shadow-md">

            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

                <h1 className="text-2xl font-bold text-blue-600">
                    AI Crack Detection
                </h1>

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

            </div>

        </nav>
    );
}

export default Navbar;