import axios from "axios";

const API = axios.create({

    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",

    withCredentials: true

});

export default API;

// ---------- Prediction ----------

export const predictImage = (formData) =>
    API.post("/predict/", formData);

// ---------- History ----------

export const getHistory = () =>
    API.get("/history/");

export const deleteHistory = (id) =>
    API.delete(`/history/${id}/`);

// ---------- Dashboard ----------

export const getDashboardStats = () =>
    API.get("/dashboard/stats");

// ---------- Reports ----------

export const downloadReport = (id) =>
    API.get(`/report/${id}`, {
        responseType: "blob"
    });

// ---------- Authentication ----------

export const registerUser = (data) =>
    API.post("/auth/register", data);

export const loginUser = (data) =>
    API.post("/auth/login", data);

export const logoutUser = () =>
    API.post("/auth/logout");

export const getCurrentUser = () =>
    API.get("/auth/me");

// ---------- Email Verification ----------

export const verifyEmail = (token) =>
    API.get("/auth/verify-email", {
        params: { token }
    });

export const resendVerification = (email) =>
    API.post("/auth/resend-verification", { email });