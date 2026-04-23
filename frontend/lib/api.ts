import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 402) {
      console.error("Credits exhausted");
    }
    return Promise.reject(error);
  }
);

// Server-side token injection — use this in Server Components / Route Handlers
export async function injectToken(headers: Headers) {
  const { auth } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  if (userId) {
    headers.set("Authorization", `Bearer ${userId}`);
  }
  return headers;
}

export default api;
