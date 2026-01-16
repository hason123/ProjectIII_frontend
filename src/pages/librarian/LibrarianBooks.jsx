import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
// --- MỚI: Thêm importBook, exportBook ---
import { searchBooks, importBook, exportBook } from "../../api/book";
// --- MỚI: Thêm Upload, message ---
import { Spin, Alert, Pagination, Select, Button, Upload, message } from "antd";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
// --- MỚI: Thêm Icon Import/Export ---
import { DownloadOutlined, FileExcelOutlined, UploadOutlined } from "@ant-design/icons";

// Layouts & Components
import LibrarianHeader from "../../components/layout/LibrarianHeader";
import LibrarianSidebar from "../../components/layout/LibrarianSidebar";
import AdminSidebar from "../../components/layout/AdminSidebar";
import BookCard from "../../components/book/BookCard";
import BookFilters from "../../components/book/BookFilters";

// 1. Hàm tiện ích để sửa lỗi URL ảnh
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

  const userRolePath = isAdmin || user?.role === "ADMIN" ? "admin" : "librarian";

  // --- STATE ---
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- MỚI: State cho Import/Export ---
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
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

  const handleGoToDetail = (bookId) => {
    navigate(`/${userRolePath}/books/${bookId}`);
  };

  // --- MỚI: Xử lý Export ---
  const handleExportBooks = async () => {
    setIsExporting(true);
    try {
      await exportBook();
      message.success("Xuất file Excel thành công!");
    } catch (err) {
      console.error(err);
      message.error("Xuất file thất bại: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // --- MỚI: Xử lý Import ---
  const handleImportBooks = async (file) => {
    setIsImporting(true);
    try {
      await importBook(file);
      message.success("Nhập sách thành công! Đang làm mới danh sách...");

      // Load lại danh sách ngay lập tức để thấy dữ liệu mới
      await fetchBooksData(currentPage, pageSize, currentFilters);
    } catch (err) {
      console.error(err);
      message.error("Nhập file thất bại: " + err.message);
    } finally {
      setIsImporting(false);
    }
    return false; // Chặn upload mặc định của antd
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

              {/* 1. Header Page: Title & Buttons */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-[#111418] dark:text-white">
                    {isAdmin ? "Quản lý kho sách" : "Thư viện sách"}
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Quản lý, tìm kiếm và cập nhật sách trong hệ thống.
                  </p>
                </div>

                {/* --- KHU VỰC NÚT BẤM (ĐÃ SỬA) --- */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Nút Export */}
                  <Button
                      icon={<DownloadOutlined />}
                      onClick={handleExportBooks}
                      loading={isExporting}
                      className="h-10 border-gray-300 shadow-sm"
                  >
                    Export
                  </Button>

                  {/* Nút Import */}
                  <Upload
                      accept=".xlsx, .xls"
                      showUploadList={false}
                      beforeUpload={handleImportBooks}
                  >
                    <Button
                        icon={<FileExcelOutlined />}
                        loading={isImporting}
                        className="h-10 border-gray-300 shadow-sm"
                    >
                      Import
                    </Button>
                  </Upload>

                  {/* Nút Tạo Mới */}
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
              </div>

              {/* 2. BOOK FILTERS */}
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

              {/* 4. BOOK GRID */}
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
                              title={book.bookName || book.title}
                              author={book.author || "Chưa cập nhật"}
                              image={getValidImageUrl(book.imageUrl || book.avatar)}
                              categories={book.categories}
                              status={book.quantity > 0 ? "active" : "archived"}
                              code={book.bookId}
                              studentsCount={book.quantity || 0}
                              schedule="Sách in"
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