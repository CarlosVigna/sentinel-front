import { apiFetch } from "./api";

export async function listUsers() {
  return apiFetch("/users");
}

export async function createUser(data) {
  return apiFetch("/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMe() {
  return apiFetch("/users/me");
}

export async function updateUser(id, data) {
  return apiFetch(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function changeMyPassword(data) {
  return apiFetch("/users/me/password", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}