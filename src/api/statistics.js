//const API_URL = "http://localhost:8081/api/v1/library";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081';

const API_URL = `${BACKEND_URL}/api/v1/library`;
/**
 * Get librarian's enrollment statistics
 */
export async function getLibrarianEnrollments(bookId = null, approvalStatus = null, pageNumber = 1, pageSize = 10) {
  const token = localStorage.getItem("accessToken");
  let url = `${API_URL}/librarian/enrollments?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  
  if (bookId) {
    url += `&bookId=${bookId}`;
  }
  if (approvalStatus) {
    url += `&approvalStatus=${approvalStatus}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch enrollments");
  }

  return await response.json();
}

/**
 * Get book grade book (all students' quiz results)
 */
export async function getBookGradeBook(bookId) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(
    `${API_URL}/books/${bookId}/quiz-grades`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch book grade book");
  }

  return await response.json();
}

/**
 * Get quiz attempts for a specific chapter item
 */
export async function getQuizAttempts(chapterItemId, pageNumber = 1, pageSize = 10) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(
    `${API_URL}/chapterItem/${chapterItemId}/attempts?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch quiz attempts");
  }

  return await response.json();
}

/**
 * Get approved students for a book
 */
export async function getBookApprovedStudents(bookId, pageNumber = 1, pageSize = 10) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(
    `${API_URL}/books/${bookId}/enrollments/approved?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch approved students");
  }

  return await response.json();
}

/**
 * Get pending enrollment requests for a book
 */
export async function getBookPendingRequests(bookId, pageNumber = 1, pageSize = 10) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(
    `${API_URL}/books/${bookId}/enrollments/pending?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch pending requests");
  }

  return await response.json();
}
