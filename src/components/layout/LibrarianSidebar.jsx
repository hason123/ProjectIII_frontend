import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SidebarLink from "./SidebarLink";
import {
  Squares2X2Icon,
  AcademicCapIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BellIcon, TagIcon,
} from "@heroicons/react/24/outline";
import {BookOutlined} from "@ant-design/icons";

export default function LibrarianSidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const currentPath = location.pathname;
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth < 1024);
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <aside className={`flex flex-shrink-0 flex-col bg-white dark:bg-gray-800 border-r border-slate-200 dark:border-slate-700 fixed top-[65px] bottom-0 left-0 overflow-y-auto z-40 transition-all duration-300 ${
      isCollapsed ? "w-20" : "w-64"
    }`}>
      <nav className="flex-1 px-4 py-6 space-y-2">
        <SidebarLink
          icon={<AcademicCapIcon className="h-6 w-6" />}
          label={t("librarian.quanLyLuotMuon")}
          active={currentPath.startsWith("/librarian/books")}
          to="/librarian/books"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          icon={<UserGroupIcon className="h-6 w-6" />}
          label={t("librarian.quanLySach")}
          active={currentPath === "/librarian/borrowings"}
          to="/librarian/borrowings"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
            icon={<BookOutlined className="h-6 w-6" />}
            label={t("librarian.quanLyDanhMuc")}
            // Highlight khi đường dẫn bắt đầu bằng /librarian/categories
            active={currentPath.startsWith("/librarian/categories")}
            to="/librarian/categories"
            isCollapsed={isCollapsed}
        />
{/*        <SidebarLink
          icon={<ChartBarIcon className="h-6 w-6" />}
          label={t("librarian.baoCoThongKe")}
          active={currentPath === "/librarian/report"}
          to="/librarian/report"
          isCollapsed={isCollapsed}
        />*/}
        <SidebarLink
          icon={<BellIcon className="h-6 w-6" />}
          label={t("common.thongBao")}
          active={currentPath === "/notifications"}
          to="/notifications"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          icon={<UserGroupIcon className="h-6 w-6" />}
          label={t("librarian.hoSo")}
          active={currentPath === "/librarian/profile"}
          to="/librarian/profile"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          icon={<Cog6ToothIcon className="h-6 w-6" />}
          label={t("librarian.caiDatHeThong")}
          active={currentPath === "/librarian/settings"}
          to="/librarian/settings"
          isCollapsed={isCollapsed}
        />
      </nav>
    </aside>
  );
}
