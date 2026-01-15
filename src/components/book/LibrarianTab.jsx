import React, { useState, useEffect } from "react";
import { Spin, message } from "antd";
import { getUserById } from "../../api/user";

export default function LibrarianTab({ book }) {
  const [librarian, setLibrarian] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (book?.librarianId) {
      const fetchLibrarianData = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await getUserById(book.librarianId);
          setLibrarian(response.data || response);
        } catch (err) {
          console.error("Error fetching librarian data:", err);
          setError("Không thể tải thông tin thủ thư");
          message.error("Không thể tải thông tin thủ thư");
        } finally {
          setLoading(false);
        }
      };

      fetchLibrarianData();
    }
  }, [book?.librarianId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spin />
      </div>
    );
  }

  if (error || !librarian) {
    return (
      <div className="py-8 text-center text-gray-500">
        {error || "Không có thông tin thủ thư"}
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-2xl">
        {/* Librarian Header */}
        <div className="flex items-start gap-6 mb-8">
          <div className="flex-shrink-0">
            {librarian.imageUrl ? (
              <img
                alt={`Avatar giảng viên ${librarian.fullName}`}
                className="w-24 h-24 rounded-full object-cover"
                src={librarian.imageUrl}
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-semibold">
                {librarian.fullName?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-2xl font-bold text-[#111418] dark:text-white mb-2">
              {librarian.fullName}
            </h3>
            {/* {librarian.bio && (
              <p className="text-base text-[#617589] dark:text-gray-400 mb-4">
                {librarian.bio}
              </p>
            )} */}

            {/* Librarian Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              {librarian.workPlace && (
                <div>
                  <p className="text-sm font-medium text-[#111418] dark:text-white">
                    Nơi công tác
                  </p>
                  <p className="text-sm text-[#617589] dark:text-gray-400">
                    {librarian.workPlace}
                  </p>
                </div>
              )}

              {librarian.yearsOfExperience && (
                <div>
                  <p className="text-sm font-medium text-[#111418] dark:text-white">
                    Năm kinh nghiệm
                  </p>
                  <p className="text-sm text-[#617589] dark:text-gray-400">
                    {librarian.yearsOfExperience} năm
                  </p>
                </div>
              )}

              {librarian.fieldOfExpertise && (
                <div>
                  <p className="text-sm font-medium text-[#111418] dark:text-white">
                    Lĩnh vực chuyên môn
                  </p>
                  <p className="text-sm text-[#617589] dark:text-gray-400">
                    {librarian.fieldOfExpertise}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Librarian Detailed Bio */}
        {librarian.bio && (
          <div className="border-t border-black/10 dark:border-white/10 pt-8">
            <h4 className="text-lg font-semibold text-[#111418] dark:text-white mb-4">
              Về thủ thư
            </h4>
            <p className="text-base text-[#617589] dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
              {librarian.bio}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
