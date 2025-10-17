import api from "./auth"; // axiosインスタンス再利用

export const saveSkills = async (
  skills: { skill: string; level: number }[]
) => {
  const res = await api.post("/skills", { skills });
  return res.data;
};

export const getSkills = async () => {
  const res = await api.get("/skills");
  return res.data;
};