import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Input, Spin, Alert, Button, message, Modal } from "antd";
import { useAuth } from "../../contexts/AuthContext";
import {
    ArrowLeftIcon,
    TrashIcon,
} from "@heroicons/react/24/outline";

// Import Layouts
import LibrarianHeader from "../../components/layout/LibrarianHeader";
import LibrarianSidebar from "../../components/layout/LibrarianSidebar";
import AdminSidebar from "../../components/layout/AdminSidebar";

// Import APIs
import {
    createCategory,
    updateCategory,
    getCategoryById,
    deleteCategory,
} from "../../api/category";

const { TextArea } = Input;

export default function CreateCategory() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Xác định Role để điều hướng
    const userRole = user?.role === "ADMIN" ? "admin" : "librarian";
    const isEditMode = !!id;

    // Form & State
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // UI State
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // --- 1. HANDLE RESIZE ---
    useEffect(() => {
        const handleResize = () => setSidebarCollapsed(window.innerWidth < 1024);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // --- 2. FETCH DATA (Nếu là Edit Mode) ---
    useEffect(() => {
        const fetchData = async () => {
            if (!isEditMode) return;

            setLoading(true);
            try {
                const res = await getCategoryById(id);
                // API trả về: res.data hoặc trực tiếp res tùy interceptor
                // Dựa vào code backend: trả về CategoryResponse
                const data = res.data || res;

                // Fill dữ liệu vào Form
                form.setFieldsValue({
                    categoryName: data.categoryName,
                    description: data.description,
                });
            } catch (err) {
                console.error(err);
                message.error("Lỗi khi tải thông tin danh mục.");
                // Nếu lỗi quá nặng (404), có thể navigate về list
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, isEditMode, form]);

    // --- 3. HANDLE SUBMIT ---
    const onFinish = async (values) => {
        setSubmitting(true);
        setError(null);
        try {
            // Backend Request DTO: { categoryName, description }
            const payload = {
                categoryName: values.categoryName,
                description: values.description,
            };

            if (isEditMode) {
                await updateCategory(id, payload);
                message.success("Cập nhật danh mục thành công!");
            } else {
                await createCategory(payload);
                message.success("Tạo danh mục mới thành công!");
            }

            navigate(`/${userRole}/categories`);

        } catch (err) {
            console.error(err);
            // Xử lý lỗi từ backend (ví dụ: tên trùng)
            const errorMsg = err.response?.data?.message || err.message || "Có lỗi xảy ra.";
            setError(errorMsg);
            message.error("Thất bại: " + errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    // --- 4. HANDLE DELETE ---
    const handleDelete = () => {
        Modal.confirm({
            title: "Xóa danh mục",
            content: "Bạn có chắc chắn muốn xóa danh mục này? Nếu danh mục có sách, sách có thể bị ảnh hưởng.",
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    setSubmitting(true);
                    await deleteCategory(id);
                    message.success("Đã xóa danh mục.");
                    navigate(`/${userRole}/categories`);
                } catch (err) {
                    message.error("Lỗi khi xóa danh mục: " + err.message);
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
                    <div className="max-w-3xl mx-auto px-6 py-8">

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
                                        {isEditMode ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
                                    </h1>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                                        {isEditMode ? `ID Danh mục: #${id}` : "Tạo thể loại sách mới cho thư viện"}
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
                                    Xóa danh mục
                                </Button>
                            )}
                        </div>

                        {error && (
                            <Alert message="Lỗi hệ thống" description={error} type="error" showIcon className="mb-6" />
                        )}

                        {/* --- FORM AREA --- */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={onFinish}
                            >
                                <Form.Item
                                    label="Tên danh mục"
                                    name="categoryName"
                                    rules={[
                                        { required: true, message: "Vui lòng nhập tên danh mục" },
                                        { min: 2, message: "Tên danh mục quá ngắn" }
                                    ]}
                                >
                                    <Input size="large" placeholder="Ví dụ: Tiểu thuyết, Khoa học..." />
                                </Form.Item>

                                <Form.Item
                                    label="Mô tả"
                                    name="description"
                                >
                                    <TextArea
                                        rows={5}
                                        placeholder="Nhập mô tả chi tiết về thể loại này..."
                                        showCount
                                        maxLength={500}
                                    />
                                </Form.Item>

                                {/* --- ACTION BUTTONS --- */}
                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-6">
                                    <Button
                                        size="large"
                                        onClick={() => navigate(`/${userRole}/categories`)}
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
                                        {isEditMode ? "Lưu thay đổi" : "Tạo mới"}
                                    </Button>
                                </div>
                            </Form>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}