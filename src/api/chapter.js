
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081';

const API_URL = `${BACKEND_URL}/api/v1/library/chapters`;

export async function getChaptersByBookId(bookId) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${API_URL}/book/${bookId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch chapters");
  }

  return await response.json();
}

export async function getChapterById(id) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${API_URL}/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch chapter");
  }

  return await response.json();
}

export async function createChapter(bookId, chapterData) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${API_URL}/${bookId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(chapterData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create chapter");
  }

  return await response.json();
}

export async function updateChapter(id, chapterData) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(chapterData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update chapter");
  }

  return await response.json();
}

export async function deleteChapter(id) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete chapter");
  }

  if (response.status === 204) {
    return { success: true };
  }

  return await response.json();
}

export async function getChapterItems(chapterId) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${API_URL}/${chapterId}/items`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch chapter items");
  }

  return await response.json();
}

export async function updateChapterItemOrder(chapterId, orderedItemIds) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${API_URL}/${chapterId}/order-items`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      orderedItemIds: orderedItemIds,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update item order");
  }

  return { success: true };
}

export async function deleteChapterItem(itemId) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${BACKEND_URL}/api/v1/library/chaptersItems/${itemId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete chapter item");
  }

  return { success: true };
}
