import { apiFetch } from "./api";

export async function listOccurrences(page = 0, size = 10, status = "") {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (status) {
    params.append("status", status);
  }

  return apiFetch(`/occurrences?${params.toString()}`);
}

export async function findOccurrenceById(id) {
  return apiFetch(`/occurrences/${id}`);
}

export async function createOccurrence(data) {
  return apiFetch("/occurrences", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateOccurrence(id, data) {
  return apiFetch(`/occurrences/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function resolveOccurrence(id) {
  return apiFetch(`/occurrences/${id}/resolve`, {
    method: "PATCH",
  });
}

export async function cancelOccurrence(id) {
  return apiFetch(`/occurrences/${id}/cancel`, {
    method: "PATCH",
  });
}

export async function reopenOccurrence(id) {
  return apiFetch(`/occurrences/${id}/reopen`, {
    method: "PATCH",
  });
}

export async function deleteOccurrence(id) {
  return apiFetch(`/occurrences/${id}`, {
    method: "DELETE",
  });
}