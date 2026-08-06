import axios from "axios";

const BASE_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8000";

// Main API client
const API = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

// Separate client for refresh request.
// Is client par response interceptor nahi chalega.
const refreshClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

let refreshPromise = null;

API.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (!originalRequest) {
            return Promise.reject(error);
        }

        const requestUrl = originalRequest.url || "";

        const isAuthRoute =
            requestUrl.includes("/auth/login") ||
            requestUrl.includes("/auth/register") ||
            requestUrl.includes("/auth/google") ||
            requestUrl.includes("/auth/refresh") ||
            requestUrl.includes("/auth/resend-verification") ||
            requestUrl.includes("/auth/verify-email");

        const isUnauthorized =
            error.response?.status === 401;

        if (
            !isUnauthorized ||
            originalRequest._retry ||
            isAuthRoute
        ) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            // Agar refresh already chal raha hai,
            // baaki requests same promise ka wait karengi.
            if (!refreshPromise) {
                refreshPromise = refreshClient
                    .post(
                        "/auth/refresh",
                        {},
                        {
                            withCredentials: true
                        }
                    )
                    .finally(() => {
                        refreshPromise = null;
                    });
            }

            await refreshPromise;

            // Refresh successful hone ke baad
            // original request dobara call hogi.
            return API(originalRequest);

        } catch (refreshError) {
            refreshPromise = null;

            // Optional: login page par redirect
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }

            return Promise.reject(refreshError);
        }
    }
);

export default API;

// ---------- Prediction ----------

export const predictImage = (formData) =>
    API.post(
        "/predict/",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );

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
    API.post(
        "/auth/login",
        data,
        {
            withCredentials: true
        }
    );

export const loginWithGoogle = (credential) =>
    API.post(
        "/auth/google",
        {
            credential
        },
        {
            withCredentials: true
        }
    );

export const refreshAccessToken = () =>
    refreshClient.post(
        "/auth/refresh",
        {},
        {
            withCredentials: true
        }
    );

export const logoutUser = () =>
    API.post(
        "/auth/logout",
        {},
        {
            withCredentials: true
        }
    );

export const getCurrentUser = () =>
    API.get("/auth/me");

export const verifyEmail = (token) =>
    API.get(
        `/auth/verify-email?token=${encodeURIComponent(token)}`
    );

export const resendVerification = (email) =>
    API.post(
        "/auth/resend-verification",
        {
            email
        }
    );