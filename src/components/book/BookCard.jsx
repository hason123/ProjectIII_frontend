import React from "react";
import {
  ArrowRightIcon,
  UserGroupIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export default function BookCard({
  id,
  title,
  author,
  image,
  reviews,
  type = "student", // 'student' | 'librarian'
  status, // 'active' | 'draft' | 'archived'
  code,
  studentsCount,
  schedule,
  onManage,
  onEdit,
  onPreview,
}) {
  const navigate = useNavigate();



  if (type === "librarian") {
    return (
      <div className="flex flex-col w-full bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img
              src={image}
              alt={title}
              className="w-full h-full object-contain" // object-contain giúp hiện hết ảnh bìa
          />
        </div>
        <div className="p-4 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white pr-2">
              {title}
            </h3>
            {status === "active" && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                Hoạt động
              </span>
            )}
            {status === "draft" && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                Bản nháp
              </span>
            )}
            {status === "archived" && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                Đã lưu trữ
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Mã lớp: #{code}
          </p>
          <div className="flex-grow space-y-3 text-sm text-gray-600 dark:text-gray-300 mb-4">
            <div className="flex items-center gap-2">
              <UserGroupIcon className="h-5 w-5" />
              <span>{studentsCount} học viên</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDaysIcon className="h-5 w-5" />
              <span>{schedule}</span>
            </div>
          </div>
          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            {status === "active" ? (
              <>
                <button
                  onClick={onPreview}
                  className="flex-1 flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-3 bg-primary text-white text-xs font-bold leading-normal tracking-wide hover:bg-primary/90"
                >
                  Xem chi tiết
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onEdit}
                  className="flex-1 flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-3 bg-primary text-white text-xs font-bold leading-normal tracking-wide hover:bg-primary/90"
                >
                  Chi tiết
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="flex h-full w-72 flex-col gap-4 rounded-xl bg-white dark:bg-background-dark shadow-md dark:shadow-xl dark:shadow-black/20 hover:shadow-lg hover:-translate-y-1 transform transition duration-200">
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
            src={image}
            alt={title}
            className="w-full h-full object-contain" // object-contain giúp hiện hết ảnh bìa
        />
      </div>
      <div className="flex flex-col flex-1 justify-between p-4 pt-0 gap-4">
        <div>
          <p className="text-lg font-bold leading-normal text-[#111418] dark:text-white">
            {title}
          </p>
          <p className="text-sm font-normal leading-normal text-slate-500 dark:text-slate-400">
            {author}
          </p>

        </div>
        <button
          onClick={() => navigate(`/books/${id}`)}
          className="btn btn-outline w-full text-sm font-bold inline-flex items-center justify-center gap-2 hover:bg-primary hover:text-white dark:hover:bg-primary/90"
          aria-label={`Xem chi tiết ${title}`}
        >
          <span>Xem chi tiết</span>
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
