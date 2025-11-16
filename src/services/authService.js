import API from "./api";

export const login = async (email, password) => {
  const res = await API.post("/auth/login", { email, password });
  return res.data;
};

export const register = async (data) => {
  const res = await API.post("/auth/signup", data);
  return res.data;
};


