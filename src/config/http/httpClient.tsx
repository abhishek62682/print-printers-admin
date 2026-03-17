import axios from "axios";
import Cookies from "js-cookie";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
  },
});

httpClient.interceptors.request.use(function (config) {
  const authorizationToken = Cookies.get("accessToken");
  config.headers.Authorization = `Bearer ${authorizationToken}`;
  return config;

},(error) => Promise.reject(error));

export default httpClient;
