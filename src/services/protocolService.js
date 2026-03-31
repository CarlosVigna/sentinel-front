import { apiFetch } from "./api";

export async function listProtocols(categoryId) {
  const query = categoryId ? `?categoryId=${categoryId}` : "";
  return apiFetch(`/protocols${query}`);
}

export async function listProtocolsByCategory(categoryId) {
  return apiFetch(`/protocols?categoryId=${categoryId}`);
}

export async function findProtocolById(id) {
  return apiFetch(`/protocols/${id}`);
}

export async function createProtocol(data) {
  return apiFetch("/protocols", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProtocol(id, data) {
  return apiFetch(`/protocols/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteProtocol(id) {
  return apiFetch(`/protocols/${id}`, {
    method: "DELETE",
  });
}