import API from "./api";

export const getSecretaries = async () => {
  const res = await API.get("/secretaries");
  return res.data;
};

export const createSecretary = async (data) => {
  const res = await API.post("/secretaries", data);
  return res.data;
};
