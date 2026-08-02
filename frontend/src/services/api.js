import axios from "axios";

const API = axios.create({

    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",

    withCredentials: true

});

let isRefreshing = false;
let refreshPromise = null;

API.interceptors.response.use(

    (response) => response,

    async (error) => {

        const originalRequest = error.config;

        const isAuthRoute =
            originalRequest?.url?.includes("/auth/login") ||
            originalRequest?.url?.includes("/auth/register") ||
            originalRequest?.url?.includes("/auth/refresh");

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !isAuthRoute
        ) {

            originalRequest._retry = true;

            try {

                if (!isRefreshing) {
                    isRefreshing = true;
                    refreshPromise = API.post("/auth/refresh").finally(() => {
                        isRefreshing = false;
                    });
                }

                await refreshPromise;

                return API(originalRequest);

            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

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

export const verifyEmail = (token) =>
    API.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);

export const resendVerification = (email) =>
    API.post("/auth/resend-verification", { email });