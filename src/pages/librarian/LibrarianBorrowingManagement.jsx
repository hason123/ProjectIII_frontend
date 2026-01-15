import React, { useState, useEffect } from "react";
import LibrarianHeader from "../../components/layout/LibrarianHeader";
import LibrarianSidebar from "../../components/layout/LibrarianSidebar";
import AdminSidebar from "../../components/layout/AdminSidebar";
import { Table, Input, Select, Button, Space, Tag, Modal, Spin, message } from "antd";
import {
  SearchOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import {getBorrowingPage, approveBorrowing, rejectBorrowing, deleteBorrowing, getAllBooks} from "../../api/book";

export default function LibrarianBorrowingManagement({ isAdmin = false }) {
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  // Xử lý responsive sidebar
  useEffect(() => {
    const handleResize = () => setSidebarCollapsed(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch dữ liệu mượn sách
  // Tìm đến hàm fetchBorrowings và sửa đoạn lấy dataList và totalItems

  const fetchBorrowings = async () => {
    try {
      setLoading(true);
      const res = await getBorrowingPage(currentPage, pageSize);

      // --- SỬA Ở ĐÂY ---
      // Dữ liệu API bọc trong thuộc tính "data", nên phải truy cập res.data.pageList
      const dataList = res.data?.pageList || [];
      const mappedData = dataList.map((item) => ({
        key: item.borrowingId,
        id: item.borrowingId,
        userId: item.userId,
        username: item.username,
        fullName: item.fullName,
        bookId: item.bookId,
        bookName: item.bookName,
        borrowDate: item.borrowingDate,
        returnDate: item.returnDate,
        status: item.status,
      }));

      setBorrowings(mappedData);
      // Sửa cả phần lấy tổng số trang/phần tử
      setTotalItems(res.data?.totalElements || 0);
      // ----------------

    } catch (err) {
      console.error("Lỗi tải dữ liệu mượn:", err);
      message.error("Không thể tải danh sách mượn trả sách");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowings();
  }, [currentPage]);
  // Lưu ý: API Java hiện tại (getBorrowingPage) chỉ có phân trang, chưa có filter server-side
  // nên việc filter Status/Tên sách sẽ thực hiện ở client trên trang hiện tại hoặc cần update API Backend.

  // --- HÀNH ĐỘNG: DUYỆT (APPROVE) ---
  const handleApprove = (borrowingId, userId, bookId) => {
    Modal.confirm({
      title: "Duyệt yêu cầu mượn",
      content: "Bạn có chắc chắn muốn cho phép mượn cuốn sách này?",
      okText: "Duyệt",
      cancelText: "Hủy",
      okButtonProps: { type: "primary" },
      async onOk() {
        try {
          // Gọi API approveBorrowing
          // Lưu ý: API yêu cầu Request Body { userId, bookId } tương ứng BorrowingRequest Java
          await approveBorrowing(userId, bookId);

          message.success("Đã duyệt yêu cầu mượn thành công!");
          fetchBorrowings(); // Reload lại bảng
        } catch (err) {
          message.error(err.message || "Lỗi khi duyệt yêu cầu");
        }
      },
    });
  };

  // --- HÀNH ĐỘNG: TỪ CHỐI (REJECT) ---
  const handleReject = (borrowingId, userId, bookId) => {
    Modal.confirm({
      title: "Từ chối yêu cầu",
      content: "Bạn có chắc chắn muốn từ chối yêu cầu này? Sách sẽ được trả lại kho.",
      okText: "Từ chối",
      cancelText: "Hủy",
      okButtonProps: { type: "primary", danger: true },
      async onOk() {
        try {
          await rejectBorrowing(userId, bookId);
          message.success("Đã từ chối yêu cầu thành công!");
          fetchBorrowings();
        } catch (err) {
          message.error(err.message || "Lỗi khi từ chối yêu cầu");
        }
      },
    });
  };

  // --- HÀNH ĐỘNG: XÓA (DELETE) ---
  const handleDelete = (borrowingId) => {
    Modal.confirm({
      title: "Xóa bản ghi",
      content: "Hành động này sẽ xóa hoàn toàn lịch sử mượn này. Bạn có chắc không?",
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { type: "primary", danger: true },
      async onOk() {
        try {
          await deleteBorrowing(borrowingId);
          message.success("Xóa bản ghi thành công!");
          fetchBorrowings();
        } catch (err) {
          message.error(err.message || "Lỗi khi xóa bản ghi");
        }
      },
    });
  };

  // --- XỬ LÝ LỌC CLIENT-SIDE (Do API Backend chưa hỗ trợ filter) ---
  const filteredData = borrowings.filter((item) => {
    const matchSearch =
        item.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.bookName?.toLowerCase().includes(searchText.toLowerCase());

    const matchStatus = statusFilter ? item.status === statusFilter : true;

    return matchSearch && matchStatus;
  });

  // --- CẤU HÌNH CỘT BẢNG ---
  const columns = [
    {
      title: "Người dùng",
      dataIndex: "fullName",
      key: "fullName",
      render: (text) => <span className="font-semibold text-[#111418] dark:text-white">{text}</span>,
    },
    {
      title: "Sách mượn",
      dataIndex: "bookName",
      key: "bookName",
      render: (text) => <span className="text-blue-600 dark:text-blue-400 font-medium">{text}</span>,
    },
    {
      title: "Ngày mượn",
      dataIndex: "borrowDate",
      key: "borrowDate",
      render: (date) => date ? new Date(date).toLocaleDateString("vi-VN") : "-",
    },
    {
      title: "Hạn trả / Ngày trả",
      dataIndex: "returnDate",
      key: "returnDate",
      render: (date, record) => {
        // Logic hiển thị: Nếu còn đang mượn thì đây là DueDate, nếu đã trả thì là ReturnDate
        // Dựa trên backend: convertBorrowingToDTO setBorrowingDate + 30 ngày
        // Nhưng DTO Java field là 'returnDate' cho ngày đã trả.
        // Ta có thể tính toán hiển thị dựa trên status
        if (record.status === 'BORROWING' && record.borrowDate) {
          const dueDate = new Date(new Date(record.borrowDate).setDate(new Date(record.borrowDate).getDate() + 30));
          return <span className="text-orange-500">Hạn: {dueDate.toLocaleDateString("vi-VN")}</span>
        }
        return date ? new Date(date).toLocaleDateString("vi-VN") : "-";
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        let text = status;
        switch (status) {
          case "PENDING": color = "orange"; text = "Chờ duyệt"; break;
          case "BORROWING": color = "blue"; text = "Đang mượn"; break;
          case "RETURNED": color = "green"; text = "Đã trả"; break;
          case "OVERDUE": color = "red"; text = "Quá hạn"; break;
          case "REJECTED": color = "volcano"; text = "Từ chối"; break;
          default: break;
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      align: "right",
      render: (_, record) => (
          <Space>
            {/* Chỉ hiện nút Duyệt/Từ chối khi trạng thái là PENDING */}
            {record.status === "PENDING" && (
                <>
                  <Button
                      type="primary"
                      size="small"
                      icon={<CheckOutlined />}
                      onClick={() => handleApprove(record.id, record.userId, record.bookId)}
                  >
                    Duyệt
                  </Button>
                  <Button
                      danger
                      size="small"
                      icon={<CloseOutlined />}
                      onClick={() => handleReject(record.id, record.userId, record.bookId)}
                  >
                    Từ chối
                  </Button>
                </>
            )}

            {/* Nút xóa cho phép dọn dẹp dữ liệu (Admin only) */}
            <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record.id)}
                title="Xóa lịch sử"
            />
          </Space>
      ),
    },
  ];

  return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark font-display">
        <LibrarianHeader />
        <div className="flex">
          {isAdmin ? <AdminSidebar /> : <LibrarianSidebar />}
          <main className={`flex-1 pt-16 transition-all duration-300 ${sidebarCollapsed ? "pl-20" : "pl-64"}`}>
            <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl mx-auto">

              {/* Page Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-2xl md:text-3xl text-[#111418] dark:text-white font-bold">
                  Quản lý mượn trả sách
                </h1>
                <Button icon={<ReloadOutlined />} onClick={fetchBorrowings}>
                  Làm mới
                </Button>
              </div>

              {/* Filters */}
              <div className="mb-6 flex gap-4">
                <Input
                    placeholder="Tìm theo tên người dùng hoặc tên sách..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ maxWidth: 400 }}
                />
                <Select
                    placeholder="Trạng thái"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    style={{ width: 200 }}
                    allowClear
                    options={[
                      { label: "Chờ duyệt", value: "PENDING" },
                      { label: "Đang mượn", value: "BORROWING" },
                      { label: "Quá hạn", value: "OVERDUE" },
                      { label: "Đã trả", value: "RETURNED" },
                      { label: "Từ chối", value: "REJECTED" },
                    ]}
                />
              </div>

              {/* Table */}
              <div className="bg-white dark:bg-[#1a2632] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table
                    loading={loading}
                    columns={columns}
                    dataSource={filteredData}
                    pagination={{
                      current: currentPage,
                      pageSize: pageSize,
                      total: totalItems, // Tổng số bản ghi từ Server
                      onChange: (page) => setCurrentPage(page),
                      showTotal: (total) => `Tổng ${total} yêu cầu`,
                    }}
                    scroll={{ x: 1000 }}
                    rowKey="id"
                />
              </div>
            </div>
          </main>
        </div>
      </div>
  );
}