import React, { useState, useEffect } from "react";
import Header from "../../components/layout/Header";
import LibrarianHeader from "../../components/layout/LibrarianHeader";
import LibrarianSidebar from "../../components/layout/LibrarianSidebar";
import BookTabs from "../../components/book/BookTabs";
import DescriptionBook from "../../components/book/DescriptionBook";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { requestBorrowing } from "../../api/book"; // Import API
import { getBookById, deleteBook } from "../../api/book"; // Thêm deleteBook
import { Spin, Alert, Modal, Button, message, Tag } from "antd";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  BuildingLibraryIcon,
  GlobeAltIcon,
  InboxStackIcon,
  PrinterIcon,
  BookmarkSquareIcon,
  TagIcon,
  IdentificationIcon,
  PencilSquareIcon,
  TrashIcon
} from "@heroicons/react/24/outline";

// Hàm tiện ích fix lỗi ảnh
const getValidImageUrl = (url) => {
  if (!url) return "https://via.placeholder.com/300x400?text=No+Cover";
  if (url.includes("https://res-https://")) {
    return url.replace("https://res-https://", "https://");
  }
  return url;
};

export default function BookDetailPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const isLibrarian = user?.role === "LIBRARIAN";
  const isAdmin = user?.role === "ADMIN";
  const isLibrarianOrAdmin = isLibrarian || isAdmin;
  const userRole = isAdmin ? "admin" : "librarian";

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [borrowing, setBorrowing] = useState(false);
  const [deleting, setDeleting] = useState(false); // State cho nút xóa

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => {
    const handleResize = () => setSidebarCollapsed(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const response = await getBookById(id);
      setBook(response.data);
    } catch (err) {
      setError(err.message || "Không thể tải thông tin sách");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchBook();
  }, [id]);

  // --- HÀM XỬ LÝ CHO SINH VIÊN ---
  const handleBorrowBook = () => {
    // 1. Kiểm tra đăng nhập
    if (!user) {
      message.warning("Vui lòng đăng nhập để thực hiện chức năng này");
      return;
    }

    // 2. Kiểm tra số lượng sách
    if (book.quantity <= 0) {
      message.error("Sách này hiện đã hết hàng trong kho.");
      return;
    }

    // 3. Hiển thị Modal xác nhận
    Modal.confirm({
      title: "Xác nhận mượn sách",
      icon: <BookmarkSquareIcon className="w-6 h-6 text-blue-500 mr-2 inline" />,
      content: (
          <div className="pt-2">
            <p>Bạn có chắc chắn muốn gửi yêu cầu mượn cuốn sách:</p>
            <p className="font-bold text-[#111418] mt-1 text-md bg-gray-50 p-2 rounded border border-gray-200">
              {book.bookName}
            </p>
            <p className="text-xs text-gray-500 mt-3 italic">
              * Yêu cầu sẽ được gửi đến Thủ thư. Vui lòng theo dõi trạng thái trong mục "Lịch sử mượn".
            </p>
          </div>
      ),
      okText: "Gửi yêu cầu",
      cancelText: "Hủy bỏ",
      centered: true,
      okButtonProps: { type: "primary" },
      onOk: async () => {
        try {
          setBorrowing(true);

          // --- GỌI API MƯỢN SÁCH ---
          // Truyền vào ID của sách (book.bookId hoặc id từ useParams)
          await requestBorrowing(book.bookId);

          message.success("Gửi yêu cầu thành công! Vui lòng chờ Thủ thư phê duyệt.");

          // Tải lại thông tin sách để cập nhật số lượng hiển thị (nếu backend trừ tồn kho tạm thời)
          fetchBook();

        } catch (err) {
          console.error("Lỗi mượn sách:", err);
          // Hiển thị thông báo lỗi cụ thể từ Backend (ví dụ: "Bạn đã mượn cuốn này rồi")
          message.error(err.message || "Không thể gửi yêu cầu mượn sách. Vui lòng thử lại.");
        } finally {
          setBorrowing(false);
        }
      },
    });
  };

  // --- HÀM XỬ LÝ CHO QUẢN TRỊ VIÊN / THỦ THƯ ---

  // 1. Chuyển hướng sang trang Edit (Dùng lại CreateBook.js)
  const handleEditBook = () => {
    navigate(`/${userRole}/books/edit/${id}`);
  };

  // 2. Xóa sách
  const handleDeleteBook = () => {
    Modal.confirm({
      title: "Xóa sách",
      content: "Bạn có chắc chắn muốn xóa cuốn sách này? Hành động này không thể hoàn tác.",
      okText: "Xóa ngay",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setDeleting(true);
          await deleteBook(id);
          message.success("Đã xóa sách thành công");
          navigate(`/${userRole}/books`); // Quay về danh sách sau khi xóa
        } catch (err) {
          message.error("Lỗi khi xóa sách: " + err.message);
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark"><Spin size="large" /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark"><Alert message="Lỗi" description={error} type="error" showIcon /></div>;
  if (!book) return null;

  return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-[#333333] dark:text-gray-200">
        {isLibrarianOrAdmin ? <LibrarianHeader /> : <Header />}

        <div className="flex">
          {isLibrarianOrAdmin && <LibrarianSidebar />}

          <main className={`flex-1 ${isLibrarianOrAdmin ? (sidebarCollapsed ? "lg:pl-20" : "lg:pl-64") : ""} w-full transition-all duration-300`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">

              <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 mb-6 text-gray-500 hover:text-primary transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span className="font-medium">Quay lại danh sách</span>
              </button>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                {/* --- CỘT 1: ẢNH BÌA --- */}
                <div className="col-span-1 md:col-span-4 lg:col-span-3">
                  <div className="sticky top-24">
                    <div className="rounded-xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 relative">
                      <div className="absolute top-2 right-2 z-10">
                        {book.quantity > 0 ? (
                            <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200 shadow-sm">
                                Còn {book.quantity} cuốn
                            </span>
                        ) : (
                            <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded-full border border-red-200 shadow-sm">
                                Hết hàng
                            </span>
                        )}
                      </div>

                      <div className="aspect-[3/4] w-full bg-gray-100 dark:bg-gray-900">
                        <img
                            src={getValidImageUrl(book.imageUrl)}
                            alt={book.bookName}
                            className="w-full h-full object-contain p-2"
                        />
                      </div>
                    </div>

                    <div className="mt-4 text-center text-gray-500 text-sm flex items-center justify-center gap-1">
                      <IdentificationIcon className="w-4 h-4" />
                      <span>Mã sách hệ thống: #{book.bookId}</span>
                    </div>
                  </div>
                </div>

                {/* --- CỘT 2: THÔNG TIN CHI TIẾT --- */}
                <div className="col-span-1 md:col-span-8 lg:col-span-9 flex flex-col gap-6">

                  {/* Header Info */}
                  <div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {book.categories?.length > 0 ? (
                          book.categories.map((cat) => (
                              <Tag key={cat.categoryId} icon={<TagIcon className="w-3 h-3 mr-1 inline"/>} color="cyan" className="flex items-center text-sm py-0.5 px-2">
                                {cat.categoryName}
                              </Tag>
                          ))
                      ) : (
                          <span className="text-sm text-gray-400 italic">Chưa phân loại</span>
                      )}
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-[#111418] dark:text-white mb-2 leading-tight">
                      {book.bookName}
                    </h1>

                    <div className="flex items-center gap-2 text-lg text-gray-600 dark:text-gray-300">
                      <span>Tác giả:</span>
                      <span className="font-bold text-primary text-xl">{book.author || "Đang cập nhật"}</span>
                    </div>
                  </div>

                  {/* Grid Info */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    {/* ... (Các thông tin chi tiết giữ nguyên như cũ) ... */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs text-gray-500 uppercase font-bold flex items-center gap-1.5"><BuildingLibraryIcon className="w-4 h-4 text-primary"/> Nhà xuất bản</span>
                      <span className="font-medium text-gray-900 dark:text-white">{book.publisher || "N/A"}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs text-gray-500 uppercase font-bold flex items-center gap-1.5"><BookOpenIcon className="w-4 h-4 text-primary"/> Số trang</span>
                      <span className="font-medium text-gray-900 dark:text-white">{book.pageCount ? `${book.pageCount} trang` : "Unknown"}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs text-gray-500 uppercase font-bold flex items-center gap-1.5"><GlobeAltIcon className="w-4 h-4 text-primary"/> Ngôn ngữ</span>
                      <span className="font-medium text-gray-900 dark:text-white">{book.language || "Tiếng Việt"}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs text-gray-500 uppercase font-bold flex items-center gap-1.5"><PrinterIcon className="w-4 h-4 text-primary"/> Phiên bản</span>
                      <span className="font-medium text-gray-900 dark:text-white">{book.printType || "Bản thường"}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs text-gray-500 uppercase font-bold flex items-center gap-1.5"><InboxStackIcon className="w-4 h-4 text-primary"/> Tồn kho</span>
                      <span className={`font-bold ${book.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>{book.quantity !== null ? book.quantity : 0} cuốn</span>
                    </div>
                  </div>

                  {/* --- KHU VỰC HÀNH ĐỘNG (ACTION BAR) --- */}

                  {/* TRƯỜNG HỢP 1: NẾU LÀ ADMIN / LIBRARIAN -> HIỆN NÚT CHỈNH SỬA & XÓA */}
                  {isLibrarianOrAdmin ? (
                      <div className="flex flex-col sm:flex-row gap-4 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 items-center justify-between">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                            Quản lý sách
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Cập nhật thông tin hoặc xóa sách khỏi hệ thống.
                          </p>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                          <Button
                              onClick={handleEditBook}
                              className="h-11 px-5 flex items-center gap-2 border-gray-300 dark:border-gray-600 hover:text-primary hover:border-primary"
                          >
                            <PencilSquareIcon className="w-5 h-5"/> Chỉnh sửa
                          </Button>
                          <Button
                              danger
                              type="primary"
                              onClick={handleDeleteBook}
                              loading={deleting}
                              className="h-11 px-5 flex items-center gap-2"
                          >
                            <TrashIcon className="w-5 h-5"/> Xóa sách
                          </Button>
                        </div>
                      </div>
                  ) : (
                      /* TRƯỜNG HỢP 2: NẾU LÀ SINH VIÊN -> HIỆN NÚT MƯỢN SÁCH */
                      <div className="flex flex-col sm:flex-row gap-4 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 items-center justify-between">
                        <div>
                          <h3 className="font-bold text-lg text-blue-900 dark:text-blue-100 mb-1">
                            Đăng ký mượn sách
                          </h3>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Mượn tối đa 30 ngày. Vui lòng mang thẻ sinh viên khi đến nhận sách.
                          </p>
                        </div>
                        <Button
                            type="primary"
                            size="large"
                            icon={<BookmarkSquareIcon className="w-5 h-5"/>}
                            loading={borrowing}
                            onClick={handleBorrowBook}
                            disabled={book.quantity <= 0}
                            className="h-11 px-6 font-bold shadow-md min-w-[180px]"
                        >
                          {book.quantity > 0 ? "Mượn ngay" : "Tạm hết hàng"}
                        </Button>
                      </div>
                  )}

                  {/* Tabs Nội dung */}
                  <div className="mt-2">
                    <BookTabs
                        tabs={[
                          {
                            label: "Giới thiệu nội dung",
                            content: (
                                <div className="prose dark:prose-invert max-w-none p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 min-h-[200px]">
                                  <DescriptionBook description={book.bookDesc || "Đang cập nhật nội dung giới thiệu..."} />
                                </div>
                            ),
                          },
                        ]}
                        defaultIndex={0}
                    />
                  </div>

                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
  );
}