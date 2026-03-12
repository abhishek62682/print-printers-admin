import axios from "axios";
import Cookies from "js-cookie";

const httpClient = axios.create({
  baseURL: "http://localhost:3000/api/",
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
  },
});

httpClient.interceptors.request.use(function (config) {
  const authorizationToken = Cookies.get("accessToken");
  console.log(authorizationToken)
  config.headers.Authorization = `Bearer ${authorizationToken}`;
  return config;

},(error) => Promise.reject(error));

export default httpClient;
