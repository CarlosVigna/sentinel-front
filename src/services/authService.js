import { apiFetch } from "./api";

export async function login(email, senha) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, senha }),
  });
}