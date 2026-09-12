import axios from "axios";

export const AUTH_API = "http://127.0.0.1:8001";
export const OCR_API = "http://127.0.0.1:8000";

export const authApi = axios.create({
  baseURL: AUTH_API,
  headers: { "Content-Type": "application/json" },
});

export const scanApi = axios.create({
  baseURL: OCR_API,
});
