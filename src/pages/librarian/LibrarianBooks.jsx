import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { searchBooks } from "../../api/book";
import { Spin, Alert, Pagination, Select, Button } from "antd";
import { PlusCircleIcon } from "@heroicons/react/24/outline";

// Layouts & Components
import LibrarianHeader from "../../components/layout/LibrarianHeader";
import LibrarianSidebar from "../../components/layout/LibrarianSidebar";
import AdminSidebar from "../../components/layout/AdminSidebar";
import BookCard from "../../components/book/BookCard";
import BookFilters from "../../components/book/BookFilters";

// 1. Hàm tiện ích để sửa lỗi URL ảnh (Giống hệt BooksPage)
const getValidImageUrl = (url) => {
  if (!url) return "https://via.placeholder.com/300x400?text=No+Image";
  if (url.includes("https://res-https://")) {
    return url.replace("https://res-https://", "https://");
  }
  return url;
};

export default function LibrarianBooks({ isAdmin = false }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Xác định role để điều hướng đúng URL
  const userRolePath = isAdmin || user?.role === "ADMIN" ? "admin" : "librarian";

  // --- STATE ---
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12); // Mặc định 12 cho đẹp Grid
  const [totalElements, setTotalElements] = useState(0);

  const [currentFilters, setCurrentFilters] = useState({
    bookName: "",
    author: "",
    publisher: "",
    categories: [],
    rating: null,
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // --- EFFECT ---
  useEffect(() => {
    const handleResize = () => setSidebarCollapsed(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchBooksData = useCallback(async (page, size, filters) => {
    try {
      setLoading(true);
      setError(null);

      const searchRequest = {
        bookName: filters.bookName,
        author: filters.author,
        publisher: filters.publisher,
        categories: filters.categories,
      };

      const response = await searchBooks(searchRequest, page, size);
      const data = response.data || response;

      let resultList = data.pageList || [];
      if (filters.rating) {
        const minRating = parseFloat(filters.rating);
        resultList = resultList.filter(b => (b.rating || 0) >= minRating);
      }

      setBooks(resultList);
      setTotalElements(data.totalElements || 0);

    } catch (err) {
      console.error("Lỗi tải sách:", err);
      setError("Không thể tải danh sách sách. Vui lòng thử lại.");
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooksData(currentPage, pageSize, currentFilters);
  }, [currentPage, pageSize, currentFilters, fetchBooksData]);

  // --- HANDLERS ---
  const handleFilterChange = (newFilters) => {
    setCurrentFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (value) => {
    setPageSize(value);
    setCurrentPage(1);
  };

  const handleCreateBook = () => {
    navigate(`/${userRolePath}/books/create`);
  };

  // Hàm chuyển hướng sang trang Chi tiết dành cho Admin
  const handleGoToDetail = (bookId) => {
    navigate(`/${userRolePath}/books/${bookId}`);
  };

  return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-white">
        <LibrarianHeader />

        <div className="flex">
          {/* Sidebar */}
          {isAdmin ? <AdminSidebar /> : <LibrarianSidebar />}

          <main className={`flex-1 bg-slate-50 dark:bg-slate-900 pt-16 transition-all duration-300 ${
              sidebarCollapsed ? "pl-20" : "pl-64"
          }`}>
            <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl mx-auto">

              {/* 1. Header Page */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-[#111418] dark:text-white">
                    {isAdmin ? "Quản lý kho sách" : "Sách của tôi"}
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Quản lý, tìm kiếm và cập nhật sách trong hệ thống.
                  </p>
                </div>
                <Button
                    type="primary"
                    size="large"
                    icon={<PlusCircleIcon className="h-5 w-5" />}
                    onClick={handleCreateBook}
                    className="flex items-center gap-2 bg-primary font-bold hover:bg-primary/90 h-10 shadow-sm"
                >
                  Tạo sách mới
                </Button>
              </div>

              {/* 2. BOOK FILTERS (Bộ lọc ngang) */}
              <div className="mb-8 w-full">
                <BookFilters onFilterChange={handleFilterChange} />
              </div>

              {/* 3. INFO BAR */}
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <h2 className="text-lg font-bold text-[#111418] dark:text-white flex items-center gap-2">
                  Kết quả: <span className="text-primary">{totalElements}</span> sách
                </h2>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <span className="text-sm font-medium text-[#617589] dark:text-gray-400 whitespace-nowrap">
                  Hiển thị:
                </span>
                  <Select
                      value={pageSize}
                      onChange={handlePageSizeChange}
                      options={[
                        { value: 12, label: "12 sách / trang" },
                        { value: 24, label: "24 sách / trang" },
                        { value: 48, label: "48 sách / trang" },
                      ]}
                      className="w-40"
                  />
                </div>
              </div>

              {/* 4. BOOK GRID (Hiển thị giống BooksPage) */}
              {loading ? (
                  <div className="flex justify-center items-center h-96">
                    <Spin size="large" tip="Đang tải dữ liệu..." />
                  </div>
              ) : error ? (
                  <Alert message="Lỗi" description={error} type="error" showIcon />
              ) : books.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                    <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">menu_book</span>
                    <p className="text-lg text-slate-500 mb-4">Không tìm thấy cuốn sách nào.</p>
                    <Button onClick={handleCreateBook} type="dashed">Thêm sách ngay</Button>
                  </div>
              ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
                      {books.map((book) => (
                          <BookCard
                              key={book.bookId || book.id}
                              id={book.bookId || book.id}

                              // BỎ type="librarian" để dùng giao diện Student đẹp hơn (như bạn yêu cầu trước đó)
                              // type="librarian"

                              title={book.bookName || book.title}
                              author={book.author || "Chưa cập nhật"}
                              image={getValidImageUrl(book.imageUrl || book.avatar)}

                              // [QUAN TRỌNG] Truyền list categories vào đây
                              categories={book.categories}

                              status={book.quantity > 0 ? "active" : "archived"}
                              code={book.bookId}
                              studentsCount={book.quantity || 0}
                              schedule="Sách in"

                              // Click vào thì chuyển trang quản lý
                              onPreview={() => handleGoToDetail(book.bookId || book.id)}
                          />
                      ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center pb-8">
                      <Pagination
                          current={currentPage}
                          pageSize={pageSize}
                          total={totalElements}
                          onChange={handlePageChange}
                          showSizeChanger={false}
                      />
                    </div>
                  </>
              )}
            </div>
          </main>
        </div>
      </div>
  );
}