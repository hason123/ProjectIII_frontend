import React, { useState, useEffect, useCallback } from "react";
import Header from "../../components/layout/Header";
import LibrarianHeader from "../../components/layout/LibrarianHeader";
import LibrarianSidebar from "../../components/layout/LibrarianSidebar";
import BookCard from "../../components/book/BookCard";
import BookFilters from "../../components/book/BookFilters";
import { Select, Spin, Alert, Pagination } from "antd";
import { searchBooks } from "../../api/book";
import { useAuth } from "../../contexts/AuthContext";

// --- 1. Hàm tiện ích để sửa lỗi URL ảnh (Tránh lỗi https://res-https://) ---
const getValidImageUrl = (url) => {
  if (!url) return "https://via.placeholder.com/300x200?text=No+Image";
  if (url.includes("https://res-https://")) {
    return url.replace("https://res-https://", "https://");
  }
  return url;
};

export default function BooksPage() {
  // --- 2. Chuyển PAGE_SIZE thành State, mặc định là 10 ---
  const [pageSize, setPageSize] = useState(10);

  const { user } = useAuth();
  const isLibrarian = user?.role === "librarian";
  const isAdmin = user?.role === "admin";
  const isLibrarianOrAdmin = isLibrarian || isAdmin;

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [filters, setFilters] = useState({
    bookName: "",
    author: "",
    publisher: "",
    categories: [],
    rating: null,
  });

  // --- 3. Cập nhật hàm fetch để nhận pageSize hiện tại ---
  const fetchBooksData = useCallback(async (page, currentFilters, currentSize) => {
    try {
      setLoading(true);
      setError(null);

      const searchRequest = {
        bookName: currentFilters.bookName,
        author: currentFilters.author,
        publisher: currentFilters.publisher,
        categories: currentFilters.categories,
      };

      // Gọi API với currentSize thay vì số cố định
      const response = await searchBooks(searchRequest, page, currentSize);
      const apiResponse = response.data;

      if (apiResponse) {
        let bookList = apiResponse.pageList || [];

        if (currentFilters.rating) {
          const minRating = parseFloat(currentFilters.rating);
          bookList = bookList.filter((book) => (book.rating || 0) >= minRating);
        }

        setBooks(bookList);
        setTotalPages(apiResponse.totalPage || 1);
        setTotalElements(apiResponse.totalElements || 0);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(err.message || "Không thể tải danh sách sách.");
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- 4. useEffect lắng nghe cả sự thay đổi của pageSize ---
  useEffect(() => {
    fetchBooksData(currentPage, filters, pageSize);
  }, [currentPage, filters, pageSize, fetchBooksData]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // --- 5. Hàm xử lý khi người dùng đổi số lượng hiển thị ---
  const handlePageSizeChange = (value) => {
    setPageSize(value);
    setCurrentPage(1); // Reset về trang 1 khi đổi số lượng hiển thị
  };

  // Layout chung cho phần hiển thị sách để tái sử dụng
  const renderBookContent = () => (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-[#111418] dark:text-white mb-2">
              Tất cả sách
            </h1>
            <p className="text-[#617589] dark:text-gray-400">
              Khám phá và quản lý các sách có sẵn
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <aside className="lg:col-span-1">
              <div className="sticky top-20">
                <BookFilters onFilterChange={handleFilterChange} />
              </div>
            </aside>

            <div className="lg:col-span-3">
              {/* --- PHẦN HEADER CÂN ĐỐI LẠI Ở ĐÂY --- */}
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-transparent dark:border-gray-700/50">
                <h2 className="text-lg font-bold text-[#111418] dark:text-white flex items-center gap-2">
                  Kết quả: <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-md">{totalElements}</span> sách
                </h2>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <span className="text-sm font-medium text-[#617589] dark:text-gray-400 whitespace-nowrap">
                  Hiển thị:
                </span>
                  <Select
                      value={pageSize}
                      onChange={handlePageSizeChange}
                      options={[
                        { value: 10, label: "10 sách / trang" },
                        { value: 20, label: "20 sách / trang" },
                        { value: 50, label: "50 sách / trang" },
                      ]}
                      // Đổi thành w-40 để vừa vặn nội dung text
                      className="w-40"
                  />
                </div>
              </div>

              {loading ? (
                  <div className="flex justify-center items-center min-h-96">
                    <Spin size="large" tip="Đang tải sách..." />
                  </div>
              ) : error ? (
                  <Alert
                      message="Lỗi tải sách"
                      description={error}
                      type="error"
                      showIcon
                      className="mb-6"
                  />
              ) : books?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center min-h-96 gap-4">
                <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600">
                  school
                </span>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      Không tìm thấy sách nào
                    </p>
                  </div>
              ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {books?.map((c) => (
                          <BookCard
                              key={c.bookId || c.id}
                              id={c.bookId || c.id}
                              title={c.bookName || c.title}
                              author={c.author || "Chưa rõ tác giả"}
                              // Sử dụng hàm getValidImageUrl ở đây
                              image={getValidImageUrl(c.imageUrl || c.avatar)}
                              categories={c.categories}
                              rating={c.rating || 0}
                              reviews={c.reviewCount?.toString() || "0"}
                          />
                      ))}
                    </div>

                    {/* --- 7. Cập nhật Pagination để đồng bộ với pageSize --- */}
                    <div className="flex justify-center mt-12 pb-8">
                      <Pagination
                          current={currentPage}
                          total={totalElements}
                          pageSize={pageSize} // Truyền pageSize vào đây
                          onChange={handlePageChange}
                          showSizeChanger={false} // Tắt cái mặc định của Antd vì mình đã làm cái custom ở trên
                      />
                    </div>
                  </>
              )}
            </div>
          </div>
        </div>
      </div>
  );

  return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-white">
        {isLibrarianOrAdmin ? (
            <>
              <LibrarianHeader />
              <div className="flex">
                <LibrarianSidebar />
                <main className="flex-1 lg:ml-64">{renderBookContent()}</main>
              </div>
            </>
        ) : (
            <>
              <Header />
              <main className="flex-1">{renderBookContent()}</main>
            </>
        )}
      </div>
  );
}