import React, { useState, useEffect } from "react";
import LibrarianHeader from "../../components/layout/LibrarianHeader";
import LibrarianSidebar from "../../components/layout/LibrarianSidebar";
import AdminSidebar from "../../components/layout/AdminSidebar";
import { Table, Input, Select, Button, Space, Tag, Modal, message, DatePicker, Form } from "antd";
import {
  SearchOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  ReloadOutlined,
  EditOutlined,
  RollbackOutlined
} from "@ant-design/icons";
import {
  getBorrowingPage,
  approveBorrowing,
  rejectBorrowing,
  deleteBorrowing,
  // 3. Import API update
  updateBorrowing
} from "../../api/book";
import dayjs from "dayjs";

export default function LibrarianBorrowingManagement({ isAdmin = false }) {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // "RETURN" hoặc "EDIT_DATE"
  const [currentRecord, setCurrentRecord] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const handleResize = () => setSidebarCollapsed(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const calculateDueDate = (dateString, daysToAdd = 30) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    date.setDate(date.getDate() + daysToAdd);
    return date;
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const fetchBorrowings = async () => {
    try {
      setLoading(true);
      const res = await getBorrowingPage(currentPage, pageSize);
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
      setTotalItems(res.data?.totalElements || 0);
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

  // --- HÀNH ĐỘNG CŨ ---
  const handleApprove = (borrowingId, userId, bookId) => {
    Modal.confirm({
      title: "Duyệt yêu cầu mượn",
      content: "Bạn có chắc chắn muốn cho phép mượn cuốn sách này?",
      okText: "Duyệt",
      cancelText: "Hủy",
      okButtonProps: { type: "primary" },
      async onOk() {
        try {
          await approveBorrowing(userId, bookId);
          message.success("Đã duyệt yêu cầu mượn thành công!");
          fetchBorrowings();
        } catch (err) {
          message.error(err.message || "Lỗi khi duyệt yêu cầu");
        }
      },
    });
  };

  const handleReject = (borrowingId, userId, bookId) => {
    Modal.confirm({
      title: "Từ chối yêu cầu",
      content: "Từ chối yêu cầu này?",
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

  const handleDelete = (borrowingId) => {
    Modal.confirm({
      title: "Xóa bản ghi",
      content: "Hành động này sẽ xóa hoàn toàn lịch sử mượn này.",
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


  const openReturnModal = (record) => {
    setModalType("RETURN");
    setCurrentRecord(record);
    form.setFieldsValue({
      actionDate: dayjs(), // Mặc định là hôm nay
    });
    setIsModalOpen(true);
  };

  // 2. Mở modal Sửa ngày mượn
  const openEditDateModal = (record) => {
    setModalType("EDIT_DATE");
    setCurrentRecord(record);
    form.setFieldsValue({
      actionDate: record.borrowDate ? dayjs(record.borrowDate) : dayjs(),
    });
    setIsModalOpen(true);
  };

  // 3. Submit Modal
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const dateValue = values.actionDate.format("YYYY-MM-DD");

      let payload = {};
      if (modalType === "RETURN") {
        payload = { returnDate: dateValue };
      } else if (modalType === "EDIT_DATE") {
        payload = { borrowingDate: dateValue };
      }

      await updateBorrowing(currentRecord.id, payload);

      message.success(modalType === "RETURN" ? "Đã xác nhận trả sách!" : "Đã cập nhật ngày mượn!");
      setIsModalOpen(false);
      fetchBorrowings();
    } catch (err) {
      console.error(err);
      message.error(err.message || "Có lỗi xảy ra khi cập nhật");
    }
  };

  const filteredData = borrowings.filter((item) => {
    const matchSearch =
        item.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.bookName?.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = statusFilter ? item.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  const columns = [
    {
      title: "Người dùng",
      dataIndex: "fullName",
      key: "fullName",
      width: 160,
      render: (text) => <span className="font-semibold text-gray-800 dark:text-gray-200">{text}</span>,
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
      width: 110,
      align: "center",
      render: (date) => formatDate(date),
    },
    {
      title: "Hạn trả / Ngày trả",
      key: "returnDateInfo",
      width: 140,
      align: "center",
      render: (_, record) => {
        if (record.status === 'BORROWING' && record.borrowDate) {
          const dueDate = calculateDueDate(record.borrowDate, 30);
          return <span className="text-orange-600 font-medium">Hạn: {formatDate(dueDate)}</span>
        }
        if (record.status === 'RETURNED' && record.returnDate) {
          return <span className="text-green-600">Đã trả: {formatDate(record.returnDate)}</span>
        }
        if (record.status === 'OVERDUE' && record.borrowDate) {
          const dueDate = calculateDueDate(record.borrowDate, 30);
          return <span className="text-red-600 font-bold">Hạn: {formatDate(dueDate)}</span>
        }
        return <span className="text-gray-400">-</span>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 110,
      align: "center",
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
      width: 160, // Tăng width để chứa đủ nút
      render: (_, record) => (
          <Space>
            {/* 1. Nhóm nút cho trạng thái PENDING */}
            {record.status === "PENDING" && (
                <>
                  <Button
                      type="text"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      icon={<CheckOutlined />}
                      onClick={() => handleApprove(record.id, record.userId, record.bookId)}
                      title="Duyệt"
                  />
                  <Button
                      type="text"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      icon={<CloseOutlined />}
                      onClick={() => handleReject(record.id, record.userId, record.bookId)}
                      title="Từ chối"
                  />
                </>
            )}

            {/* 2. Nhóm nút cho BORROWING / OVERDUE: Trả sách */}
            {(record.status === "BORROWING" || record.status === "OVERDUE") && (
                <Button
                    type="primary"
                    size="small"
                    ghost
                    icon={<RollbackOutlined />}
                    onClick={() => openReturnModal(record)}
                >
                  Trả sách
                </Button>
            )}

            {/* 3. Nhóm nút cho BORROWING: Sửa ngày mượn */}
            {record.status === "BORROWING" && (
                <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => openEditDateModal(record)}
                    title="Sửa ngày mượn"
                />
            )}

            {/* 4. Nút Xóa (Luôn hiện hoặc chỉ hiện khi đã trả/hủy) */}
            <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record.id)}
                title="Xóa"
            />
          </Space>
      ),
    },
  ];

  const disabledDate = (current) => {
    // 1. Nếu đang ở màn hình TRẢ SÁCH (RETURN)
    if (modalType === "RETURN" && currentRecord?.borrowDate) {
      // Không được chọn ngày TRƯỚC ngày mượn
      // current < borrowDate (start of day)
      return current && current < dayjs(currentRecord.borrowDate).startOf('day');
    }

    // 2. Nếu đang ở màn hình SỬA NGÀY MƯỢN (EDIT_DATE)
    if (modalType === "EDIT_DATE") {
      // Không được chọn ngày trong tương lai (tùy logic bên bạn, thường ngày mượn <= hôm nay)
      return current && current > dayjs().endOf('day');
    }

    return false;
  };

  return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark font-display">
        <LibrarianHeader />
        <div className="flex">
          {isAdmin ? <AdminSidebar /> : <LibrarianSidebar />}
          <main className={`flex-1 pt-16 transition-all duration-300 ${sidebarCollapsed ? "pl-20" : "pl-64"}`}>
            <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl mx-auto">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-2xl md:text-3xl text-[#111418] dark:text-white font-bold">
                  Quản lý mượn trả sách
                </h1>
                <Button icon={<ReloadOutlined />} onClick={fetchBorrowings}>
                  Làm mới
                </Button>
              </div>

              <div className="mb-6 flex flex-wrap gap-4">
                <Input
                    placeholder="Tìm theo tên hoặc sách..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ maxWidth: 300 }}
                />
                <Select
                    placeholder="Lọc theo trạng thái"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    style={{ width: 180 }}
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

              <div className="bg-white dark:bg-[#1a2632] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table
                    loading={loading}
                    columns={columns}
                    dataSource={filteredData}
                    pagination={{
                      current: currentPage,
                      pageSize: pageSize,
                      total: totalItems,
                      onChange: (page) => setCurrentPage(page),
                      showTotal: (total) => `Tổng ${total} yêu cầu`,
                      showSizeChanger: false
                    }}
                    scroll={{ x: 1000 }}
                    rowKey="id"
                />
              </div>

              {/* MODAL UPDATE (Dùng chung cho Trả sách & Sửa ngày) */}
              <Modal
                  title={modalType === "RETURN" ? "Xác nhận trả sách" : "Cập nhật ngày mượn"}
                  open={isModalOpen}
                  onOk={handleModalOk}
                  onCancel={() => setIsModalOpen(false)}
                  okText={modalType === "RETURN" ? "Xác nhận trả" : "Lưu thay đổi"}
                  cancelText="Hủy bỏ"
              >
                <Form form={form} layout="vertical" className="mt-4">
                  {/* Hiển thị thông tin tóm tắt để user đỡ nhầm */}
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    <p className="text-sm"><strong>Người mượn:</strong> {currentRecord?.fullName}</p>
                    <p className="text-sm"><strong>Sách:</strong> {currentRecord?.bookName}</p>
                    {modalType === "RETURN" && (
                        <p className="text-sm text-blue-600">
                          <strong>Ngày mượn:</strong> {formatDate(currentRecord?.borrowDate)}
                        </p>
                    )}
                  </div>

                  <Form.Item
                      name="actionDate"
                      label={modalType === "RETURN" ? "Ngày trả sách" : "Ngày bắt đầu mượn"}
                      rules={[
                        { required: true, message: "Vui lòng chọn ngày!" },
                        // Validate bổ sung nếu cần
                      ]}
                  >
                    <DatePicker
                        className="w-full"
                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày"
                        // Thêm dòng này để chặn ngày sai
                        disabledDate={disabledDate}
                        // Mặc định không cho chọn quá xa trong quá khứ nếu cần (optional)
                    />
                  </Form.Item>

                  {modalType === "RETURN" && (
                      <div className="text-gray-500 text-xs italic space-y-1">
                        <p>* Ngày trả không được nhỏ hơn ngày mượn.</p>
                        <p>* Sách sẽ được cộng lại vào kho (+1 quantity).</p>
                      </div>
                  )}
                  {modalType === "EDIT_DATE" && (
                      <div className="text-gray-500 text-xs italic">
                        * Hạn trả mới sẽ được tự động tính lại (Ngày mượn mới + 30 ngày).
                      </div>
                  )}
                </Form>
              </Modal>
            </div>
          </main>
        </div>
      </div>
  );
}