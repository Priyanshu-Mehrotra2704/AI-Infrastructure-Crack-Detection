import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8000"
});

export const predictImage = (formData) =>
    API.post("/predict/", formData);

export const getHistory = () =>
    API.get("/history/");

export const deleteHistory = (id) =>
    API.delete(`/history/${id}/`);

export const getDashboardStats = () =>
    API.get("/dashboard/stats");

export const downloadReport = (id) =>
    API.get(`/report/${id}`, {
        responseType: "blob"
    });