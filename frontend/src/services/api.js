import axios from "axios";

export default axios.create({
  baseURL: "https://medivault-ai-backend.onrender.com",
  headers: {
    Accept: "application/json",
  },
});