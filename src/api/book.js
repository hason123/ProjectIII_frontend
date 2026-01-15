//const API_URL = "http://localhost:8081/api/v1/library";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081';

const API_URL = `${BACKEND_URL}/api/v1/library`;

export async function getAllBooks(pageNumber = 1, pageSize = 10) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(
    `${API_URL}/books?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch books");
  }

  return await response.json();
}

export async function searchBooks(searchRequest = {}, pageNumber = 1, pageSize = 3) {
  const token = localStorage.getItem("accessToken");
  // Khởi tạo URLSearchParams với các tham số phân trang
  const params = new URLSearchParams({
    pageNumber: pageNumber,
    pageSize: pageSize,
  });
  // Tự động thêm các trường tìm kiếm vào query params nếu có giá trị
  Object.keys(searchRequest).forEach((key) => {
    const value = searchRequest[key];
    if (value !== undefined && value !== null && value !== "") {
      // Xử lý riêng cho mảng categories (Java nhận List<String>)
      if (key === "categories" && Array.isArray(value)) {
        value.forEach(cat => params.append("categories", cat));
      } else {
        params.append(key, value);
      }
    }
  });
  const response = await fetch(`${API_URL}/books/search?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Lỗi khi tìm kiếm sách");
  }
  return await response.json();
}

export async function getAdminBooks(pageNumber = 1, pageSize = 10) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(
    `${API_URL}/books?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch admin books");
  }

  return await response.json();
}

export async function getLibrarianBooks(pageNumber = 1, pageSize = 10) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(
    `${API_URL}/books?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch librarian books");
  }

  return await response.json();
}

export async function getApprovedBooks(pageNumber = 1, pageSize = 10) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(
    `${API_URL}/books/approved?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch approved books");
  }

  return await response.json();
}

export async function getPendingBooks(pageNumber = 1, pageSize = 10) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(
    `${API_URL}/books/pending?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch pending books");
  }

  return await response.json();
}

export async function getBookById(id) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${API_URL}/books/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch book details");
  }

  return await response.json();
}

export async function createBook(bookData) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${API_URL}/books`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(bookData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create book");
  }

  return await response.json();
}

export async function uploadBookImage(bookId, file) {
  const token = localStorage.getItem("accessToken");
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/books/${bookId}/avatar`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload book image");
  }

  return await response.json();
}

export async function updateBook(id, bookData) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${API_URL}/books/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(bookData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update book");
  }

  return await response.json();
}

export async function deleteBook(id) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${API_URL}/books/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete book");
  }

  // Handle 204 No Content response (empty body)
  if (response.status === 204) {
    return { success: true };
  }

  return await response.json();
}

// Controller: @GetMapping("/books/export")
export async function exportBook() {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${API_URL}/books/export`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to export books");
  }

  // Xử lý download file blob
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "books.xlsx"; // Tên file mặc định
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

// Controller: @PostMapping("/books/import")
export async function importBook(file) {
  const token = localStorage.getItem("accessToken");
  const formData = new FormData();
  formData.append("file", file); // Tên 'file' khớp với @RequestPart

  const response = await fetch(`${API_URL}/books/import`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // Không set Content-Type để browser tự thêm boundary
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to import books");
  }

  return await response.json();
}

export async function publishBook(id) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${API_URL}/books/${id}/publish`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to publish book");
  }

  return await response.json();
}

export async function enrollBook(bookId) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${API_URL}/books/${bookId}/enroll`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to enroll in book");
  }

  return await response.json();
}

export async function checkEnrollmentStatus(bookId) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${API_URL}/books/${bookId}/enrollment-status`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return await response.json();

  // if (!response.ok) {
  //   // If endpoint doesn't exist or error, return false (not enrolled)
  //   return false;
  // }

  // const data = await response.json();
  // return data.enrolled || data.isEnrolled || false;
}

export async function getAllEnrollments(pageNumber = 1, pageSize = 10) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(
    `${API_URL}/enrollments?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch all enrollments");
  }

  return await response.json();
}

export async function getLibrarianEnrollments(pageNumber = 1, pageSize = 10, bookId = null, approvalStatus = null) {
  const token = localStorage.getItem("accessToken");
  const params = new URLSearchParams();
  params.append("pageNumber", pageNumber);
  params.append("pageSize", pageSize);
  if (bookId) params.append("bookId", bookId);
  if (approvalStatus) params.append("approvalStatus", approvalStatus);

  const response = await fetch(
    `${API_URL}/librarian/enrollments?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch librarian enrollments");
  }

  return await response.json();
}

export async function getBookEnrollments(bookId, pageNumber = 1, pageSize = 10) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(
    `${API_URL}/librarian/books/${bookId}/enrollments?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch enrollments");
  }

  return await response.json();
}

export async function approveEnrollment(userId, bookId) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(
    `${API_URL}/enrollments/approve`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        studentId,
        bookId,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to approve enrollment");
  }

  return await response.json();
}

export async function rejectEnrollment(userId, bookId) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(
    `${API_URL}/enrollments/reject`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        studentId,
        bookId,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to reject enrollment");
  }

  return await response.json();
}

export async function deleteEnrollment(enrollmentId) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(
    `${API_URL}/enrollments/${enrollmentId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete enrollment");
  }

  return await response.json();
}

export async function deleteStudentsFromBook(bookId, studentIds) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(
    `${API_URL}/books/${bookId}/students`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        studentIds: studentIds,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete students from book");
  }

  // Response might be plain text or JSON, handle both cases
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  } else {
    return { message: await response.text() };
  }
}

export async function getStudentsNotInBook(bookId, searchRequest = {}, pageNumber = 1, pageSize = 10) {
  const token = localStorage.getItem("accessToken");
  const params = new URLSearchParams({
    pageNumber,
    pageSize,
    ...(searchRequest.fullName && { fullName: searchRequest.fullName }),
    ...(searchRequest.username && { username: searchRequest.username }),
    ...(searchRequest.email && { email: searchRequest.email }),
  });

  const response = await fetch(
    `${API_URL}/books/${bookId}/students/not-available?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch available students");
  }

  return await response.json();
}

export async function addStudentsToBook(bookId, studentIds) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(
      `${API_URL}/books/${bookId}/students`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentIds: studentIds,
        }),
      }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to add students to book");
  }

  // Response might be plain text or JSON, handle both cases
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  } else {
    return {message: await response.text()};
  }
}
  /* --- QUẢN LÝ MƯỢN SÁCH (BORROWING MANAGEMENT) --- */

  /**
   * Sinh viên gửi yêu cầu mượn sách
   * Controller: @PostMapping("/books/{bookId}/borrow")
   */
  export async function requestBorrowing(bookId) {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${API_URL}/books/${bookId}/borrow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Không thể gửi yêu cầu mượn sách");
    }

    return await response.json();
  }

  /**
   * Thủ thư duyệt yêu cầu mượn sách
   * Controller: @PostMapping("/borrowings/approve")
   */
  export async function approveBorrowing(userId, bookId) {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${API_URL}/borrowings/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
        bookId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Không thể duyệt yêu cầu mượn");
    }

    return await response.json();
  }

  /**
   * Thủ thư từ chối yêu cầu mượn sách
   * Controller: @DeleteMapping("/borrowings/reject")
   */
  export async function rejectBorrowing(userId, bookId) {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${API_URL}/borrowings/reject`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
        bookId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Không thể từ chối yêu cầu mượn");
    }

    // Trả về true nếu xóa thành công (204 No Content)
    if (response.status === 204) return true;
    return await response.json();
  }

  /**
   * Lấy chi tiết một lượt mượn sách
   * Controller: @GetMapping("/borrowings/{id}")
   */
  export async function getBorrowingDetail(id) {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${API_URL}/borrowings/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Không thể lấy chi tiết lượt mượn");
    }

    return await response.json();
  }

  /**
   * Lấy danh sách tất cả lượt mượn (Dành cho Thủ thư/Admin)
   * Controller: @GetMapping("/borrowings")
   */
  export async function getBorrowingPage(pageNumber = 1, pageSize = 10) {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(
        `${API_URL}/borrowings?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
    );

    if (!response.ok) {
      throw new Error("Không thể lấy danh sách lượt mượn");
    }

    return await response.json();
  }

  /**
   * Xóa một lượt mượn sách
   * Controller: @DeleteMapping("/borrowings/{id}")
   */
  export async function deleteBorrowing(id) {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${API_URL}/borrowings/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Không thể xóa lượt mượn");
    }

    if (response.status === 204) return true;
    return await response.json();
  }
