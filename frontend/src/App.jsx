import { Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Overview from "./pages/Overview";
import ScanPage from "./pages/ScanPage";
import HistoryPage from "./pages/HistoryPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import VerifyEmail from "./pages/VerifyEmail";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <Routes>
            <Route path="/register"     element={<Register />} />
            <Route path="/login"        element={<Login />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            <Route path="/"          element={<ProtectedRoute><Overview />      </ProtectedRoute>} />
            <Route path="/scan"      element={<ProtectedRoute><ScanPage />      </ProtectedRoute>} />
            <Route path="/history"   element={<ProtectedRoute><HistoryPage />   </ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /> </ProtectedRoute>} />
        </Routes>
    );
}

export default App;