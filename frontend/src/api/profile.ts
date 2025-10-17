import api from "./auth";

export const getProfile = async () => {
  const res = await api.get("/profile");
  return res.data;
};

export const updateProfile = async (payload: {
  name: string;
  skills: { skill: string; level: number }[];
}) => {
  const res = await api.post("/profile", payload);
  return res.data;
};
