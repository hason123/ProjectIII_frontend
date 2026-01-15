import React, { useState, useEffect } from "react";
import { Modal, Form, Select, Input, Button, message, Spin, Table, Checkbox, Space, Alert } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { getStudentsNotInBook, addStudentsToBook } from "../../api/book";
import CustomAvatar from "../common/Avatar";

export default function AddStudentModal({ visible, onClose, onSuccess, books }) {
  const [form] = Form.useForm();
  const [selectedBook, setSelectedBook] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const pageSize = 10;

  // Fetch available students when book is selected or search text changes
  useEffect(() => {
    if (selectedBook) {
      fetchAvailableStudents();
    }
  }, [selectedBook, searchText, currentPage]);

  const fetchAvailableStudents = async () => {
    try {
      setLoading(true);
      const searchRequest = {};
      if (searchText) {
        searchRequest.fullName = searchText;
      }
      const res = await getStudentsNotInBook(selectedBook, searchRequest, currentPage, pageSize);
      const studentList = res.data.pageList.map((student) => ({
        id: student.id,
        key: student.id,
        fullName: student.fullName || "N/A",
        username: student.userName || "N/A",
        email: student.gmail || "N/A",
        avatar: student.avatar || "",
      }));
      setAvailableStudents(studentList);
      setTotalStudents(res.data.totalElements || 0);
    } catch (err) {
      console.log("Failed to fetch available students:", err);
      message.error("Không thể tải danh sách học viên");
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelection = (studentId) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const allStudentIds = availableStudents.map((s) => s.id);
      setSelectedStudents((prev) => [
        ...new Set([...prev, ...allStudentIds]),
      ]);
    } else {
      // Deselect all from current page
      const currentPageIds = availableStudents.map((s) => s.id);
      setSelectedStudents((prev) =>
        prev.filter((id) => !currentPageIds.includes(id))
      );
    }
  };

  const handleAddStudents = async () => {
    if (!selectedBook) {
      message.error("Vui lòng chọn sách");
      return;
    }

    if (selectedStudents.length === 0) {
      message.error("Vui lòng chọn ít nhất một học viên");
      return;
    }

    try {
      setLoading(true);
      await addStudentsToBook(selectedBook, selectedStudents);
      message.success(`Đã thêm ${selectedStudents.length} học viên vào sách`);
      
      // Reset form
      form.resetFields();
      setSelectedBook(null);
      setSelectedStudents([]);
      setSearchText("");
      setCurrentPage(1);
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.log("Failed to add students:", err);
      message.error(err.message || "Thêm học viên thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedBook(null);
    setSelectedStudents([]);
    setSearchText("");
    setCurrentPage(1);
    onClose();
  };

  const columns = [
    {
      title: (
        <Checkbox
          onChange={(e) => handleSelectAll(e.target.checked)}
          checked={
            availableStudents.length > 0 &&
            availableStudents.every((s) => selectedStudents.includes(s.id))
          }
          indeterminate={
            selectedStudents.length > 0 &&
            !availableStudents.every((s) => selectedStudents.includes(s.id))
          }
        />
      ),
      key: "checkbox",
      width: 50,
      render: (_, record) => (
        <Checkbox
          onChange={() => handleStudentSelection(record.id)}
          checked={selectedStudents.includes(record.id)}
        />
      ),
    },
    {
      title: "Họ và tên",
      key: "fullName",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <CustomAvatar size="small" src={record.avatar} name={record.fullName} />
          <span>{record.fullName}</span>
        </div>
      ),
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
  ];

  return (
    <Modal
      title="Thêm học viên vào sách"
      open={visible}
      onCancel={handleCancel}
      width={900}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleAddStudents}
          disabled={selectedStudents.length === 0 || !selectedBook}
        >
          Thêm {selectedStudents.length > 0 ? `(${selectedStudents.length})` : ""}
        </Button>,
      ]}
    >
      <Spin spinning={loading}>
        <Form form={form} layout="vertical">
          {/* Select Book */}
          <Form.Item label="Chọn sách" required>
            <Select
              placeholder="Chọn một sách"
              value={selectedBook}
              onChange={(value) => {
                setSelectedBook(value);
                setSelectedStudents([]);
                setSearchText("");
                setCurrentPage(1);
              }}
              options={books.map((book) => ({
                value: book.id,
                label: book.name,
              }))}
            />
          </Form.Item>

          {/* Search Students */}
          {selectedBook && (
            <Form.Item label="Tìm kiếm học viên">
              <Input
                placeholder="Tìm kiếm theo tên..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </Form.Item>
          )}

          {/* Students Table */}
          {selectedBook && (
            <Form.Item>
              {selectedStudents.length > 0 && (
                <Alert
                  message={`Đã chọn ${selectedStudents.length} học viên`}
                  type="info"
                  style={{ marginBottom: "16px" }}
                  showIcon
                />
              )}
              <Table
                columns={columns}
                dataSource={availableStudents}
                loading={loading}
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: totalStudents,
                  onChange: (page) => setCurrentPage(page),
                }}
                size="small"
                bordered
              />
            </Form.Item>
          )}
        </Form>
      </Spin>
    </Modal>
  );
}
