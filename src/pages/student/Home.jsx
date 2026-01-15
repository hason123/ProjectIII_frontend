import React, { useState, useEffect } from 'react'
import Header from '../../components/layout/Header'
import BookCard from '../../components/book/BookCard'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom';
//import { getAllBooks } from '../../api/book';
//import { getAllCategories } from '../../api/category';
import { Spin } from 'antd';
import { FolderIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const navigate = useNavigate();
/*  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);*/

  useEffect(() => {
  //  fetchData();
  }, []);

 /* const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch books
      const booksResponse = await getAllBooks(1, 8);
      const booksList = booksResponse.data?.pageList || [];
      setFeaturedBooks(booksList);
      
      // Fetch categories
      const categoriesResponse = await getAllCategories(1, 10);
      const categoriesList = categoriesResponse.data?.pageList || [];
      setCategories(categoriesList);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Lỗi khi tải dữ liệu');
      // Fallback to empty arrays so page still renders
      setFeaturedBooks([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };*/


  return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-white">
        <Header />
        <main className="flex-1">
          <section className="flex justify-center sm:py-20 px-4 sm:px-6 lg:px-8 mb-10">
            <div className="w-full max-w-7xl">
              <div className="container mx-auto">
                <div className="flex flex-col-reverse gap-8 lg:flex-row lg:items-center">
                  <div className="flex flex-col gap-6 w-full lg:w-1/2 lg:justify-center">
                    <div className="flex flex-col gap-4 text-left">
                      {/* Thay đổi tiêu đề chính */}
                      <h1 className="text-4xl font-black leading-tight lg:text-5xl text-[#111418] dark:text-white">
                        Khám phá kho tri thức tại LibHust
                      </h1>
                      {/* Thay đổi đoạn giới thiệu */}
                      <h2 className="text-base text-slate-600 dark:text-slate-300">
                        Tra cứu hàng ngàn đầu sách chuyên ngành, đặt mượn trực tuyến nhanh chóng và trải nghiệm không gian đọc sách lý tưởng ngay tại thư viện.
                      </h2>
                    </div>
                    {/* Thay đổi nút kêu gọi hành động */}
                    <button className="group flex min-w-[84px] max-w-[480px] w-fit cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-white text-base font-bold gap-2"
                            onClick={() => navigate('/books')}>
                      <span>Tìm sách ngay</span>
                      <ArrowRightIcon className="h-4 w-4 transform transition-transform duration-200 group-hover:translate-x-2" />
                    </button>
                  </div>
                  {/* Ảnh minh họa thư viện */}
                  <div className="w-full lg:w-1/2 bg-center bg-no-repeat aspect-video bg-cover rounded-xl" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=2070)' }} />
                </div>
              </div>
            </div>
          </section>

        {/*<section className="flex justify-center px-4 sm:px-6 lg:px-8 mb-8">
          <div className="flex flex-col w-full max-w-7xl">
            <h2 className="text-3xl font-bold leading-tight px-4 pb-6 text-[#111418] dark:text-white">sách nổi bật</h2>
            {loading ? (
              <div className="flex justify-center py-12">
                <Spin />
              </div>
            ) : (
              <div className="flex overflow-x-auto -mx-4 scrollbar-hide p-4 gap-6">
                {featuredBooks.length > 0 ? (
                  featuredBooks.map((book) => (
                    <BookCard
                      key={book.id}
                      id={book.id}
                      title={book.name}
                      author={book.librarianName}
                      image={book.imageUrl}
                      rating={book.rating || 0}
                      reviews={book.reviewCounts || 0}
                      type={book.description || 'Unknown'}
                      status={book.status || 'published'}
                      code={book.bookCode}
                      studentsCount={book.studentsCount || 0}
                      schedule="Weekly"
                    />
                  ))
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 col-span-full ml-4">Không có sách nào</p>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="flex justify-center px-4 sm:px-6 lg:px-8 mb-10">
          <div className="flex flex-col w-full max-w-7xl">
            <h2 className="text-3xl font-bold leading-tight px-4 pb-6 text-[#111418] dark:text-white">Danh mục sách</h2>
            {loading ? (
              <div className="flex justify-center py-12">
                <Spin />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <div 
                      key={category.categoryId}
                      onClick={() => navigate(`/books?category=${category.categoryId}`)}
                      className="flex items-center gap-4 rounded-xl p-4 bg-white dark:bg-slate-800/50 shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                    >
                      <div className="flex items-center justify-center size-12 rounded-lg bg-primary/20 text-primary flex-shrink-0">
                        <FolderIcon className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-lg text-[#111418] dark:text-white">{category.categoryName}</span>
                        <span className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">{category.description}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 col-span-full">Không có danh mục nào</p>
                )}
              </div>
            )}
          </div>
        </section>*/}

        <section className="flex justify-center px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col items-center text-center w-full max-w-7xl gap-10">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-bold leading-tight tracking-[-0.015em] text-[#111418] dark:text-white">Dịch vụ của chúng tôi</h2>
              <p className="text-slate-600 dark:text-slate-300 max-w-2xl">Hỗ trợ sinh viên mượn trả sách dễ dàng và cung cấp không gian nghiên cứu chuyên sâu.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
              {/* Feature 1: Đặt mượn online */}
              <div className="flex flex-col items-center gap-4 text-center p-6 rounded-xl bg-white dark:bg-slate-800/50">
                <div className="flex items-center justify-center size-16 rounded-full bg-primary/20 text-primary">
                  <span className="material-symbols-outlined !text-4xl">book_5</span>
                </div>
                <h3 className="text-xl font-bold text-[#111418] dark:text-white">Đặt mượn nhanh chóng</h3>
                <p className="text-slate-600 dark:text-slate-300">Kiểm tra tình trạng sách và đặt mượn trực tuyến trước khi đến thư viện nhận sách.</p>
              </div>
              {/* Feature 2: Đọc tại chỗ */}
              <div className="flex flex-col items-center gap-4 text-center p-6 rounded-xl bg-white dark:bg-slate-800/50">
                <div className="flex items-center justify-center size-16 rounded-full bg-primary/20 text-primary">
                  <span className="material-symbols-outlined !text-4xl">menu_book</span>
                </div>
                <h3 className="text-xl font-bold text-[#111418] dark:text-white">Không gian đọc hiện đại</h3>
                <p className="text-slate-600 dark:text-slate-300">Tận hưởng môi trường yên tĩnh, đầy đủ tiện nghi để nghiên cứu sách trực tiếp.</p>
              </div>
              {/* Feature 3: Quản lý cá nhân */}
              <div className="flex flex-col items-center gap-4 text-center p-6 rounded-xl bg-white dark:bg-slate-800/50">
                <div className="flex items-center justify-center size-16 rounded-full bg-primary/20 text-primary">
                  <span className="material-symbols-outlined !text-4xl">history_edu</span>
                </div>
                <h3 className="text-xl font-bold text-[#111418] dark:text-white">Quy trình đơn giản</h3>
                <p className="text-slate-600 dark:text-slate-300">Chỉ cần chọn sách trực tuyến và mang thẻ sinh viên đến quầy thủ thư để hoàn tất thủ tục mượn.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
