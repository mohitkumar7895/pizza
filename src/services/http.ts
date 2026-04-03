import axios from "axios";

/** Sends cookies (admin session) on same-origin API calls. */
export const http = axios.create({
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});
