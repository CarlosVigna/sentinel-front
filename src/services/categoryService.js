import { apiFetch } from "./api";

export async function listCategories() {
  return apiFetch("/categories");
}

export async function createCategory(data) {
  return apiFetch("/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCategory(id, data) {
  return apiFetch(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id) {
  return apiFetch(`/categories/${id}`, {
    method: "DELETE",
  });
}