import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

export const predictImage = (formData) => 
  api.post('/predict/', formData);

export const getHistory = () => 
  api.get('/history/');

export const deleteHistory = (id) =>
  api.delete(`/history/${id}`);
