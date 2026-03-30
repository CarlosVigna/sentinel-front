import { apiFetch } from "./api";

export async function login(email, senha) {
  const token = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, senha })
  });

  localStorage.setItem("token", token);
  return token;
}