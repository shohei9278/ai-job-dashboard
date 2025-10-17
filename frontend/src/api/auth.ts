import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // NestJSは message に文字列 or オブジェクトを返すことがある
    const data = err.response?.data;
    let message = "通信エラーが発生しました";

    if (typeof data?.message === "string") {
      message = data.message;
    } else if (typeof data?.message?.message === "string") {
      message = data.message.message;
    } else if (Array.isArray(data?.message)) {
      message = data.message[0]; // class-validator で配列になる場合
    }

    return Promise.reject(new Error(message));
  }
);

export const login = (email: string, password: string) =>
  api.post("/auth/login", { email, password }).then((r) => r.data);

export const loginApi = async (email: string, password: string) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
};

export const signupApi = async (email: string, password: string, name: string) => {
  const res = await api.post("/auth/signup", { email, password, name });
  return res.data;
};

export const getProfile = () =>
  api.get("/auth/profile").then((r) => r.data);

export const logoutApi = () =>
  api.post("/auth/logout").then((r) => r.data);

export default api;