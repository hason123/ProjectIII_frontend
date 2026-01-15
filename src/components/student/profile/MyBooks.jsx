import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Spin, Empty } from "antd";
import { useNavigate } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import BookCard from "../../book/BookCard";
import { getApprovedBooks } from "../../../api/book";

export default function MyBooks() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyBooks();
  }, []);

  const fetchMyBooks = async () => {
    try {
      setLoading(true);
      const response = await getApprovedBooks(1, 100);
      // Handle API response structure: data.pageList
      const bookList = response.data?.pageList || [];
      setBooks(bookList);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch my books:", err);
      setError(err.message);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spin size="large" tip={t("profile.dangTaiKhoaHoc")} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">{t("profile.loi")}: {error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-4 pb-6 border-b border-black/10 dark:border-white/10">
        <div className="flex min-w-72 flex-col gap-2">
          <p className="text-3xl font-bold tracking-tight text-[#111418] dark:text-white">
            {t("profile.khoaHocCuaToi")}
          </p>
          <p className="text-[#617589] dark:text-gray-400 text-base font-normal leading-normal">
            {t("profile.tiepTucHoc")}
          </p>
        </div>
      </div>
      <div>
        {books.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-96 gap-4">
            <Empty description={t("profile.chuaDangKy")} />
            <button
              className="group flex min-w-[84px] max-w-[480px] w-fit cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-white text-base font-bold gap-2"
              onClick={() => navigate("/books")}
            >
              <span>{t("profile.khamPhaCacKhoaHoc")}</span>
              <ArrowRightIcon className="h-4 w-4 transform transition-transform duration-200 group-hover:translate-x-2" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-2">
            {books.map((book) => (
              <BookCard
                key={book.id}
                id={book.id}
                title={book.title}
                author={book.librarianName}
                image={book.imageUrl}
                rating={book.rating || 0}
                reviews={book.reviewCounts?.toString() || "0"}
                progress={book.progress || 0}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
