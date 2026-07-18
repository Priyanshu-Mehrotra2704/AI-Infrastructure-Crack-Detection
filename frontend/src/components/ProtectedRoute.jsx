import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../services/api";

function ProtectedRoute({ children }) {

    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {

        const checkAuth = async () => {

            try {

                await getCurrentUser();

                setAuthenticated(true);

            } catch (error) {

                setAuthenticated(false);

            } finally {

                setLoading(false);

            }

        };

        checkAuth();

    }, []);

    if (loading) {
        return <div className="text-center mt-10">Loading...</div>;
    }

    return authenticated
        ? children
        : <Navigate to="/login" replace />;
}

export default ProtectedRoute;