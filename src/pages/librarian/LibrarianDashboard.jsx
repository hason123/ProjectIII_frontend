import React from "react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import LibrarianHeader from "../../components/layout/LibrarianHeader";
import LibrarianSidebar from "../../components/layout/LibrarianSidebar";
import QuickActionCard from "../../components/librarian/dashboard/QuickActionCard";
import DashboardBookCard from "../../components/librarian/dashboard/DashboardBookCard";
import StatItem from "../../components/librarian/dashboard/StatItem";
import NotificationItem from "../../components/librarian/dashboard/NotificationItem";
// import { getBooksByLibrarian } from "../../api/book";
import { getLibrarianBooks } from "../../api/book";
import { Spin, Alert } from "antd";
import {
  AcademicCapIcon,
  PlusCircleIcon,
  DocumentPlusIcon,
  ClipboardDocumentCheckIcon,
  ArrowRightIcon,
  TrophyIcon,
  ChatBubbleLeftEllipsisIcon,
} from "@heroicons/react/24/outline";

export default function LibrarianDashboard() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchLibrarianBooks();
  }, []);

  const fetchLibrarianBooks = async () => {
    try {
      setLoading(true);
      const response = await getLibrarianBooks();
      // Response có cấu trúc: { data: [...] }
      const booksList = response.data.pageList;
      setBooks(booksList);
    } catch (err) {
      setError(err.message || "Lỗi khi tải sách");
      console.error("Error fetching books:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalStudents = books.reduce((sum, book) => sum + (book.totalEnrollments || 0), 0);
  const totalBooks = books.length;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-white">
      {/* Librarian Header */}
      <LibrarianHeader />

      <div className="flex">
        {/* Sidebar */}
        <LibrarianSidebar />

      </div>
    </div>
  );
}
