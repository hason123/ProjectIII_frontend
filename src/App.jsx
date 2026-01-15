import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AuthPage from "./pages/auth/AuthPage";
import Home from "./pages/student/Home";
import BooksPage from "./pages/common/BooksPage";
import BookDetailPage from "./pages/common/BookDetailPage";
import NotificationsPage from "./pages/common/NotificationsPage";
import QuizAttempt from "./pages/student/QuizAttempt";
import QuizResult from "./pages/student/QuizResult";
import QuizDetail from "./pages/student/QuizDetail";
import LibrarianQuizDetail from "./pages/librarian/QuizDetail";
import StudentLectureDetail from "./pages/student/StudentLectureDetail";
import ProfilePage from "./pages/student/ProfilePage";
import LibrarianDashboard from "./pages/librarian/LibrarianDashboard";
import LibrarianReport from "./pages/librarian/LibrarianReport";
import LibrarianBooks from "./pages/librarian/LibrarianBooks";
import CreateBook from "./pages/librarian/CreateBook";
import CreateChapter from "./pages/librarian/CreateChapter";
import LectureDetail from "./pages/librarian/LectureDetail";
import LibrarianProfilePage from "./pages/librarian/LibrarianProfilePage";
import LibrarianSettingsPage from "./pages/librarian/LibrarianSettingsPage";
import LibrarianBorrowingManagement from "./pages/librarian/LibrarianBorrowingManagement";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUserManagement from "./pages/admin/AdminUserManagement";
import AdminProfilePage from "./pages/admin/AdminProfilePage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import ProtectedRoute from "./components/common/ProtectedRoute";

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE";

function RootRedirect() {
  const { user, isLoggedIn, loading } = useAuth();

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  if (user?.role === "LIBRARIAN") {
    return <Navigate to="/librarian/dashboard" replace />;
  }

  if (user?.role === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Default for USER and others
  return <Navigate to="/home" replace />;
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />

          {/* Student Routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute element={<Home />} allowedRoles={["USER"]} />
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute
                element={<ProfilePage />}
                allowedRoles={["USER"]}
              />
            }
          />
          <Route
            path="/student/profile/information"
            element={
              <ProtectedRoute
                element={<ProfilePage />}
                allowedRoles={["USER"]}
              />
            }
          />
          <Route
            path="/student/profile/books"
            element={
              <ProtectedRoute
                element={<ProfilePage />}
                allowedRoles={["USER"]}
              />
            }
          />
          <Route
            path="/student/profile/certificate"
            element={
              <ProtectedRoute
                element={<ProfilePage />}
                allowedRoles={["USER"]}
              />
            }
          />
          <Route
            path="/student/profile/notifications"
            element={
              <ProtectedRoute
                element={<ProfilePage />}
                allowedRoles={["USER"]}
              />
            }
          />
          <Route
            path="/student/profile/password"
            element={
              <ProtectedRoute
                element={<ProfilePage />}
                allowedRoles={["USER"]}
              />
            }
          />
          <Route
            path="/student/profile/settings"
            element={
              <ProtectedRoute
                element={<ProfilePage />}
                allowedRoles={["USER"]}
              />
            }
          />
          <Route
            path="/books/:bookId/quizzes/:id/attempt"
            element={
              <ProtectedRoute
                element={<QuizAttempt />}
                allowedRoles={["USER"]}
              />
            }
          />
          <Route
            path="/books/:bookId/quizzes/:id/detail"
            element={
              <ProtectedRoute
                element={<QuizDetail />}
                allowedRoles={["USER"]}
              />
            }
          />
          <Route
            path="/books/:bookId/lectures/:lectureId"
            element={
              <ProtectedRoute
                element={<StudentLectureDetail />}
                allowedRoles={["USER"]}
              />
            }
          />
          <Route
            path="/books/:bookId/quizzes/:id/result"
            element={
              <ProtectedRoute
                element={<QuizResult />}
                allowedRoles={["USER"]}
              />
            }
          />

          {/* Public/Auth Routes */}
          <Route path="/login" element={<AuthPage defaultTab="login" />} />
          <Route
            path="/register"
            element={<AuthPage defaultTab="register" />}
          />
          {/* Common Routes (Student, Librarian, Admin) */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute
                element={<NotificationsPage />}
                allowedRoles={["USER", "LIBRARIAN", "ADMIN"]}
              />
            }
          />
          <Route
            path="/books"
            element={
              <ProtectedRoute
                element={<BooksPage />}
                allowedRoles={["USER", "LIBRARIAN", "ADMIN"]}
              />
            }
          />
          <Route
            path="/books/:id"
            element={
              <ProtectedRoute
                element={<BookDetailPage />}
                allowedRoles={["USER", "LIBRARIAN", "ADMIN"]}
              />
            }
          />

          {/* Librarian Routes */}
          <Route
            path="/librarian/dashboard"
            element={
              <ProtectedRoute
                element={<LibrarianDashboard />}
                allowedRoles={["LIBRARIAN"]}
              />
            }
          />
          <Route
            path="/librarian/report"
            element={
              <ProtectedRoute
                element={<LibrarianReport />}
                allowedRoles={["LIBRARIAN"]}
              />
            }
          />
          <Route
            path="/librarian/books"
            element={
              <ProtectedRoute
                element={<LibrarianBooks />}
                allowedRoles={["LIBRARIAN"]}
              />
            }
          />
          <Route
            path="/librarian/books/create"
            element={
              <ProtectedRoute
                element={<CreateBook />}
                allowedRoles={["LIBRARIAN"]}
              />
            }
          />
          <Route
            path="/librarian/books/:id"
            element={
              <ProtectedRoute
                element={<BookDetailPage />}
                allowedRoles={["LIBRARIAN", "ADMIN"]}
              />
            }
          />
          <Route
            path="/librarian/books/edit/:id"
            element={
              <ProtectedRoute
                element={<CreateBook />}
                allowedRoles={["LIBRARIAN"]}
              />
            }
          />
          {/*<Route
            path="/librarian/books/:bookId/chapters/create"
            element={
              <ProtectedRoute
                element={<CreateChapter />}
                allowedRoles={["LIBRARIAN"]}
              />
            }
          />*/}
          {/*<Route
            path="/librarian/books/:bookId/lectures/create"
            element={
              <ProtectedRoute
                element={<LectureDetail />}
                allowedRoles={["LIBRARIAN"]}
              />
            }
          />
          <Route
            path="/librarian/books/:bookId/chapters/:chapterId/lectures/create"
            element={
              <ProtectedRoute
                element={<LectureDetail />}
                allowedRoles={["LIBRARIAN"]}
              />
            }
          />
          <Route
            path="/librarian/books/:bookId/lectures/:lectureId"
            element={
              <ProtectedRoute
                element={<LectureDetail />}
                allowedRoles={["LIBRARIAN"]}
              />
            }
          />
          <Route
            path="/librarian/books/:bookId/quizzes/create"
            element={
              <ProtectedRoute
                element={<LibrarianQuizDetail />}
                allowedRoles={["LIBRARIAN"]}
              />
            }
          />
          <Route
            path="/librarian/books/:bookId/chapters/:chapterId/quizzes/create"
            element={
              <ProtectedRoute
                element={<LibrarianQuizDetail />}
                allowedRoles={["LIBRARIAN"]}
              />
            }
          />
          <Route
            path="/librarian/books/:bookId/quizzes/:quizId"
            element={
              <ProtectedRoute
                element={<LibrarianQuizDetail />}
                allowedRoles={["LIBRARIAN"]}
              />
            }
          />*/}
          <Route
            path="/librarian/students"
            element={
              <ProtectedRoute
                element={<LibrarianBorrowingManagement />}
                allowedRoles={["LIBRARIAN"]}
              />
            }
          />
          <Route
            path="/librarian/profile"
            element={
              <ProtectedRoute
                element={<LibrarianProfilePage />}
                allowedRoles={["LIBRARIAN"]}
              />
            }
          />
          <Route
            path="/librarian/settings"
            element={
              <ProtectedRoute
                element={<LibrarianSettingsPage />}
                allowedRoles={["LIBRARIAN"]}
              />
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute
                element={<AdminDashboard />}
                allowedRoles={["ADMIN"]}
              />
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute
                element={<AdminUserManagement />}
                allowedRoles={["ADMIN"]}
              />
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute
                element={<AdminProfilePage />}
                allowedRoles={["ADMIN"]}
              />
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute
                element={<AdminSettingsPage />}
                allowedRoles={["ADMIN"]}
              />
            }
          />
          <Route
            path="/admin/books"
            element={
              <ProtectedRoute
                element={<LibrarianBooks isAdmin={true} />}
                allowedRoles={["ADMIN"]}
              />
            }
          />
          <Route
            path="/admin/books/:id"
            element={
              <ProtectedRoute
                element={<BookDetailPage />}
                allowedRoles={["ADMIN"]}
              />
            }
          />
          <Route
            path="/admin/books/create"
            element={
              <ProtectedRoute
                element={<CreateBook isAdmin={true} />}
                allowedRoles={["ADMIN"]}
              />
            }
          />
          <Route
            path="/admin/books/edit/:id"
            element={
              <ProtectedRoute
                element={<CreateBook isAdmin={true} />}
                allowedRoles={["ADMIN"]}
              />
            }
          />
          <Route
            path="/admin/books/:bookId/chapters/create"
            element={
              <ProtectedRoute
                element={<CreateChapter isAdmin={true} />}
                allowedRoles={["ADMIN"]}
              />
            }
          />
          <Route
            path="/admin/books/:bookId/lectures/create"
            element={
              <ProtectedRoute
                element={<LectureDetail isAdmin={true} />}
                allowedRoles={["ADMIN"]}
              />
            }
          />
          <Route
            path="/admin/books/:bookId/chapters/:chapterId/lectures/create"
            element={
              <ProtectedRoute
                element={<LectureDetail isAdmin={true} />}
                allowedRoles={["ADMIN"]}
              />
            }
          />
          <Route
            path="/admin/books/:bookId/lectures/:lectureId"
            element={
              <ProtectedRoute
                element={<LectureDetail isAdmin={true} />}
                allowedRoles={["ADMIN"]}
              />
            }
          />
          <Route
            path="/admin/books/:bookId/quizzes/create"
            element={
              <ProtectedRoute
                element={<LibrarianQuizDetail isAdmin={true} />}
                allowedRoles={["ADMIN"]}
              />
            }
          />
          <Route
            path="/admin/books/:bookId/chapters/:chapterId/quizzes/create"
            element={
              <ProtectedRoute
                element={<LibrarianQuizDetail isAdmin={true} />}
                allowedRoles={["ADMIN"]}
              />
            }
          />
          <Route
            path="/admin/books/:bookId/quizzes/:quizId"
            element={
              <ProtectedRoute
                element={<LibrarianQuizDetail isAdmin={true} />}
                allowedRoles={["ADMIN"]}
              />
            }
          />
          <Route
            path="/admin/students"
            element={
              <ProtectedRoute
                element={<LibrarianBorrowingManagement isAdmin={true} />}
                allowedRoles={["ADMIN"]}
              />
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute
                element={<LibrarianReport isAdmin={true} />}
                allowedRoles={["ADMIN"]}
              />
            }
          />
        </Routes>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
