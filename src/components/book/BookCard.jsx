import React from "react";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export default function BookCard({
                                   id,
                                   title,
                                   author,
                                   image,
                                   type = "student",
                                   status,
                                   categories = [],
                                   onManage,
                                   onEdit,
                                   onPreview,
                                 }) {
  const navigate = useNavigate();

  // Hàm render danh sách Tags
  const renderCategories = () => {
    if (!categories || categories.length === 0) return null;

    // Chỉ hiển thị tối đa 2 tag để không vỡ giao diện
    const displayCats = categories.slice(0, 2);
    const remainingCount = categories.length - 2;

    return (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {displayCats.map((cat) => (
              <span
                  key={cat.categoryId}
                  className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
              >
            {cat.categoryName}
          </span>
          ))}
          {remainingCount > 0 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
            +{remainingCount}
          </span>
          )}
        </div>
    );
  };

  if (type === "librarian") {
    return null; // Tạm ẩn để tập trung vào giao diện chính bên dưới
  }


    return (
        <div className="flex h-full w-full flex-col rounded-xl bg-white dark:bg-background-dark shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:-translate-y-1 transform transition duration-200 overflow-hidden group">

            {/* 1. Ảnh Bìa */}
            <div className="relative w-full aspect-[3/4] bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                />
                {status === 'active' && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        Sẵn sàng
                    </div>
                )}
            </div>

            <div className="flex flex-col flex-1 p-4 pt-3">

                <div className="flex flex-col">
                    {renderCategories()}

                    <h3
                        className="text-[15px] font-bold leading-snug text-[#111418] dark:text-white line-clamp-2 mb-0.5"
                        title={title}
                    >
                        {title}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                        {author || "Chưa cập nhật tác giả"}
                    </p>
                </div>

                <div className="flex-1 min-h-[12px]"></div>

                <button
                    onClick={onPreview ? onPreview : () => navigate(`/books/${id}`)}
                    className="w-full h-9 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 group-hover:bg-primary group-hover:text-white group-hover:border-primary"
                >
                    <span>Xem chi tiết</span>
                    <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
            </div>
        </div>
    );

}