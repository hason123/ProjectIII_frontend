import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Space, Tooltip, Modal, message, Tag } from "antd";
import {
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    ArrowDownTrayIcon,
    BookOpenIcon
} from "@heroicons/react/24/outline";

// Import Layouts
import LibrarianHeader from "../../components/layout/LibrarianHeader";
import LibrarianSidebar from "../../components/layout/LibrarianSidebar";
import AdminSidebar from "../../components/layout/AdminSidebar";

// Import APIs
import {
    getAllCategories,
    deleteCategory,
    downloadCategoryDashboard
} from "../../api/category";
import { useAuth } from "../../contexts/AuthContext";

export default function LibrarianCategoriesList() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const userRole = user?.role === "ADMIN" ? "admin" : "librarian";

    // States
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        const handleResize = () => setSidebarCollapsed(window.innerWidth < 1024);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const fetchData = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const res = await getAllCategories(page, pageSize);
            const responseData = res.data || {};
            const list = responseData.pageList || [];
            const total = responseData.totalElements || 0;

            setData(list);
            setPagination({
                current: page,
                pageSize: pageSize,
                total: total,
            });
        } catch (error) {
            console.error(error);
            message.error("Không thể tải danh sách danh mục.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(pagination.current, pagination.pageSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleTableChange = (newPagination) => {
        fetchData(newPagination.current, newPagination.pageSize);
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: "Xóa danh mục?",
            content: "Hành động này sẽ xóa danh mục khỏi hệ thống. Bạn có chắc chắn không?",
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    await deleteCategory(id);
                    message.success("Đã xóa danh mục.");
                    fetchData(pagination.current, pagination.pageSize);
                } catch (err) {
                    message.error("Lỗi khi xóa: " + (err.message || "Không xác định"));
                }
            },
        });
    };

    const handleExport = async () => {
        try {
            message.loading({ content: "Đang tạo báo cáo...", key: "export" });
            await downloadCategoryDashboard();
            message.success({ content: "Tải xuống thành công!", key: "export", duration: 2 });
        } catch (err) {
            message.error({ content: "Lỗi tải báo cáo.", key: "export" });
        }
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "categoryId",
            key: "categoryId",
            width: 80,
            align: "center",
            render: (text) => <span className="text-gray-500">#{text}</span>
        },
        {
            title: "Tên danh mục",
            dataIndex: "categoryName",
            key: "categoryName",
            render: (text) => <span className="font-semibold text-gray-800 dark:text-gray-200">{text}</span>
        },
        {
            title: "Số lượng sách",
            key: "bookCount",
            width: 150,
            align: "center",
            render: (_, record) => {
                const count = record.books ? record.books.length : 0;
                return (
                    <Tag color={count > 0 ? "blue" : "default"} className="mx-auto flex items-center w-fit gap-1">
                        <BookOpenIcon className="w-3 h-3"/> {count}
                    </Tag>
                );
            }
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
            render: (text) => text || <span className="italic text-gray-400">Không có mô tả</span>
        },
        {
            title: "Hành động",
            key: "action",
            width: 150,
            align: "center",
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<PencilSquareIcon className="w-5 h-5 text-blue-600" />}
                            onClick={() => navigate(`/${userRole}/categories/edit/${record.categoryId}`)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button
                            type="text"
                            danger
                            icon={<TrashIcon className="w-5 h-5" />}
                            onClick={() => handleDelete(record.categoryId)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display">
            <LibrarianHeader />
            <div className="flex">
                {user?.role === "ADMIN" ? <AdminSidebar /> : <LibrarianSidebar />}

                <main
                    className={`flex-1 bg-slate-50 dark:bg-slate-900 pt-16 transition-all duration-300 ${
                        sidebarCollapsed ? "pl-20" : "pl-64"
                    }`}
                >
                    <div className="max-w-7xl mx-auto px-6 py-8">

                        {/* Header Area */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                                    Quản lý Danh mục
                                </h1>
                                <p className="text-gray-500 text-sm mt-1">
                                    Hiển thị danh sách tất cả thể loại sách trong hệ thống
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button
                                    icon={<ArrowDownTrayIcon className="w-4 h-4" />}
                                    onClick={handleExport}
                                    className="flex items-center gap-2"
                                >
                                    Xuất Excel
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<PlusIcon className="w-4 h-4" />}
                                    onClick={() => navigate(`/${userRole}/categories/create`)}
                                    className="bg-primary flex items-center gap-2"
                                >
                                    Thêm mới
                                </Button>
                            </div>
                        </div>

                        {/* Table Area */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <Table
                                columns={columns}
                                dataSource={data}
                                rowKey="categoryId"
                                pagination={{
                                    current: pagination.current,
                                    pageSize: pagination.pageSize,
                                    total: pagination.total,
                                    showSizeChanger: true,
                                    pageSizeOptions: ['5', '10', '20', '50'],
                                    showTotal: (total) => `Tổng cộng ${total} mục`,
                                }}
                                loading={loading}
                                onChange={handleTableChange}
                                scroll={{ x: 600 }}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}