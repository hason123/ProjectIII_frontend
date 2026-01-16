//const API_URL = "http://localhost:8081/api/v1/library";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081';

const API_URL = `${BACKEND_URL}/api/v1/library`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};
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

export async function getBooksBorrowingStudent(pageNumber = 1, pageSize = 10) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(
      `${API_URL}/books/user/borrowing?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch borrowing books");
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

  const response = await fetch(`${API_URL}/books/${bookId}/image`, {
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

  export async function updateBorrowing(id, borrowingRequest) {
    const response = await fetch(`${API_URL}/borrowings/${id}`, {
      method: "POST", // Lưu ý: Backend Java dùng @PostMapping
      headers: getAuthHeaders(),
      body: JSON.stringify(borrowingRequest),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Không thể cập nhật phiếu mượn");
    }

    return await response.json();
  }