import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Input, InputNumber, Select, Spin, Alert, Button, message, Modal, Upload } from "antd";
import { useAuth } from "../../contexts/AuthContext";
import {
  ArrowLeftIcon,
  CloudArrowUpIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";

// Import Layouts
import LibrarianHeader from "../../components/layout/LibrarianHeader";
import LibrarianSidebar from "../../components/layout/LibrarianSidebar";
import AdminSidebar from "../../components/layout/AdminSidebar";

// Import APIs
import {
  createBook,
  updateBook,
  uploadBookImage,
  getBookById,
  deleteBook,
} from "../../api/book";
import { getAllCategories } from "../../api/category";

const { TextArea } = Input;

export default function CreateBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Xác định Role để điều hướng sau khi lưu
  const userRole = user?.role === "ADMIN" ? "admin" : "librarian";
  const isEditMode = !!id;

  // Form & State
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Data State
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [bookData, setBookData] = useState(null); // Lưu dữ liệu gốc để so sánh nếu cần

  // UI State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // --- 1. HANDLE RESIZE ---
  useEffect(() => {
    const handleResize = () => setSidebarCollapsed(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- 2. FETCH DATA (Categories & Book Detail) ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 2.1 Lấy danh sách thể loại
        const catRes = await getAllCategories(1, 100);
        // Map data category cho Select option
        const catOptions = catRes.data.pageList.map((cat) => ({
          value: cat.categoryId || cat.id, // Kiểm tra lại field id của category
          label: cat.categoryName || cat.title,
        }));
        setCategories(catOptions);

        // 2.2 Nếu là Edit Mode, lấy thông tin sách
        if (isEditMode) {
          const bookRes = await getBookById(id);
          const data = bookRes.data || bookRes;
          setBookData(data);

          // Fill dữ liệu vào Form
          form.setFieldsValue({
            bookName: data.bookName || data.title,
            author: data.author,
            publisher: data.publisher,
            quantity: data.quantity,
            pageCount: data.pageCount,
            language: data.language || "Tiếng Việt",
            bookDesc: data.bookDesc || data.description,
            // Nếu API trả về mảng categories, lấy ID của cái đầu tiên hoặc map lại
            categoryId: data.categories?.[0]?.categoryId || data.categoryId,
          });

          // Set ảnh preview từ server
          if (data.imageUrl) {
            setPreviewImage(data.imageUrl);
          }
        }
      } catch (err) {
        console.error(err);
        message.error("Lỗi khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode, form]);

  // --- 3. HANDLE IMAGE CHANGE ---
  const handleImageChange = (info) => {
    const file = info.file.originFileObj || info.file;
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file)); // Preview ảnh ngay lập tức
    }
  };

  // --- 4. SUBMIT FORM (CREATE / UPDATE) ---
  const onFinish = async (values) => {
    setSubmitting(true);
    setError(null);
    try {
      let currentBookId = id;

      // Prepare Payload (Map đúng tên trường theo DTO BookRequest)
      const payload = {
        bookName: values.bookName,
        author: values.author,
        publisher: values.publisher,
        quantity: values.quantity,
        pageCount: values.pageCount,
        language: values.language,
        bookDesc: values.bookDesc,
        // Backend nhận List<Integer> categoryIds, nhưng form đang chọn 1
        categoryIds: values.categoryId ? [values.categoryId] : [],
      };

      if (isEditMode) {
        // --- UPDATE ---
        await updateBook(currentBookId, payload);
        message.success("Cập nhật thông tin sách thành công!");
      } else {
        // --- CREATE ---
        const res = await createBook(payload);
        // Lấy ID sách vừa tạo để upload ảnh
        currentBookId = res.data?.bookId || res.bookId || res.id;
        message.success("Tạo sách mới thành công!");
      }

      // --- UPLOAD IMAGE (Nếu có chọn ảnh mới) ---
      if (imageFile && currentBookId) {
        try {
          await uploadBookImage(currentBookId, imageFile);
          message.success("Đã cập nhật ảnh bìa sách.");
        } catch (imgErr) {
          console.error(imgErr);
          message.warning("Sách đã lưu nhưng lỗi tải ảnh. Vui lòng thử lại ảnh.");
        }
      }

      // --- NAVIGATE BACK ---
      navigate(`/${userRole}/books`);

    } catch (err) {
      console.error(err);
      setError(err.message || "Có lỗi xảy ra khi lưu sách.");
      window.scrollTo(0, 0);
    } finally {
      setSubmitting(false);
    }
  };

  // --- 5. HANDLE DELETE ---
  const handleDelete = () => {
    Modal.confirm({
      title: "Xóa sách",
      content: "Bạn có chắc chắn muốn xóa cuốn sách này? Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setSubmitting(true);
          await deleteBook(id);
          message.success("Đã xóa sách.");
          navigate(`/${userRole}/books`);
        } catch (err) {
          message.error("Lỗi khi xóa sách: " + err.message);
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
          <Spin size="large" tip="Đang tải dữ liệu..." />
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-white">
        <LibrarianHeader />

        <div className="flex">
          {user?.role === "ADMIN" ? <AdminSidebar /> : <LibrarianSidebar />}

          <main className={`flex-1 bg-slate-50 dark:bg-slate-900 pt-16 transition-all duration-300 ${
              sidebarCollapsed ? "pl-20" : "pl-64"
          }`}>
            <div className="max-w-5xl mx-auto px-6 py-8">

              {/* Header: Title & Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <button
                      onClick={() => navigate(-1)}
                      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                  </button>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold">
                      {isEditMode ? "Chỉnh sửa sách" : "Thêm sách mới"}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      {isEditMode ? `Mã sách: #${id}` : "Nhập thông tin để tạo sách mới vào thư viện"}
                    </p>
                  </div>
                </div>

                {isEditMode && (
                    <Button
                        danger
                        type="primary"
                        icon={<TrashIcon className="w-4 h-4"/>}
                        onClick={handleDelete}
                        className="flex items-center gap-2"
                    >
                      Xóa sách
                    </Button>
                )}
              </div>

              {error && (
                  <Alert message="Lỗi" description={error} type="error" showIcon className="mb-6" />
              )}

              <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* --- LEFT COLUMN: IMAGE UPLOAD --- */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-lg mb-4">Ảnh bìa sách</h3>
                    <div className="flex flex-col items-center">
                      <Upload
                          accept="image/*"
                          showUploadList={false}
                          beforeUpload={() => false} // Prevent auto upload
                          onChange={handleImageChange}
                          className="w-full"
                      >
                        <div className="w-full aspect-[3/4] bg-gray-100 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden relative group">
                          {previewImage ? (
                              <>
                                <img
                                    src={previewImage}
                                    alt="Book Cover"
                                    className="w-full h-full object-contain"
                                />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-white font-medium flex items-center gap-2">
                                <CloudArrowUpIcon className="w-5 h-5"/> Thay đổi
                              </span>
                                </div>
                              </>
                          ) : (
                              <div className="text-gray-400 flex flex-col items-center">
                                <PlusOutlined className="text-3xl mb-2" />
                                <span>Tải ảnh lên</span>
                              </div>
                          )}
                        </div>
                      </Upload>
                      <p className="text-xs text-gray-500 mt-3 text-center">
                        Định dạng hỗ trợ: JPG, PNG, WEBP. <br/> Dung lượng tối đa: 5MB.
                      </p>
                    </div>
                  </div>
                </div>

                {/* --- RIGHT COLUMN: INFO FORM --- */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-lg mb-4 border-b pb-2 dark:border-gray-700">Thông tin chung</h3>

                    <Form.Item
                        label="Tên sách"
                        name="bookName"
                        rules={[{ required: true, message: "Vui lòng nhập tên sách" }]}
                    >
                      <Input size="large" placeholder="Ví dụ: Đắc Nhân Tâm" />
                    </Form.Item>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Form.Item
                          label="Tác giả"
                          name="author"
                          rules={[{ required: true, message: "Vui lòng nhập tác giả" }]}
                      >
                        <Input placeholder="Tên tác giả" />
                      </Form.Item>

                      <Form.Item
                          label="Nhà xuất bản"
                          name="publisher"
                      >
                        <Input placeholder="Tên NXB" />
                      </Form.Item>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Form.Item
                          label="Thể loại"
                          name="categoryId"
                          rules={[{ required: true, message: "Chọn thể loại sách" }]}
                      >
                        <Select
                            placeholder="Chọn danh mục"
                            options={categories}
                            showSearch
                            optionFilterProp="label"
                        />
                      </Form.Item>

                      <Form.Item
                          label="Ngôn ngữ"
                          name="language"
                          initialValue="Tiếng Việt"
                      >
                        <Select
                            options={[
                              { value: "Tiếng Việt", label: "Tiếng Việt" },
                              { value: "Tiếng Anh", label: "Tiếng Anh" },
                              { value: "Khác", label: "Khác" }
                            ]}
                        />
                      </Form.Item>
                    </div>

                    <Form.Item
                        label="Mô tả nội dung"
                        name="bookDesc"
                    >
                      <TextArea rows={5} placeholder="Nhập tóm tắt nội dung sách..." />
                    </Form.Item>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-lg mb-4 border-b pb-2 dark:border-gray-700">Chi tiết kho</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Form.Item
                          label="Số lượng trong kho"
                          name="quantity"
                          rules={[{ required: true, message: "Nhập số lượng" }]}
                      >
                        <InputNumber min={0} className="w-full" placeholder="0" />
                      </Form.Item>

                      <Form.Item
                          label="Số trang"
                          name="pageCount"
                      >
                        <InputNumber min={1} className="w-full" placeholder="VD: 300" />
                      </Form.Item>
                    </div>
                  </div>

                  {/* --- ACTION BUTTONS --- */}
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                        size="large"
                        onClick={() => navigate(`/${userRole}/books`)}
                    >
                      Hủy bỏ
                    </Button>
                    <Button
                        type="primary"
                        size="large"
                        htmlType="submit"
                        loading={submitting}
                        className="bg-primary hover:bg-primary/90 min-w-[140px]"
                    >
                      {isEditMode ? "Lưu thay đổi" : "Tạo sách mới"}
                    </Button>
                  </div>
                </div>
              </Form>
            </div>
          </main>
        </div>
      </div>
  );
}