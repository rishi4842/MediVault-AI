import axios from "axios";

const api = axios.create({
    baseURL: "https://medivault-ai-backend.onrender.com"
});

export default api;