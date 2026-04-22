import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { AuthProvider, CartProvider, NotificationProvider, LanguageProvider, ThemeProvider, LockscreenProvider } from '@/context';
import { ProtectedRoute, PublicOnlyRoute } from '@/components/routes';
import { Lockscreen } from '@/components/Lockscreen';

// Public Pages
import { HomePage, CourseCatalogPage, CourseDetailPage, InstructorRegisterPage } from '@/pages/public';

// Auth Pages
import { LoginPage, RegisterPage, ForgotPasswordPage } from '@/pages/auth';

// Student Pages
import { StudentDashboard, MyCoursesPage, MyClassesPage, ClassDetailPage, DiscussionsPage, DiscussionDetailPage } from '@/pages/student';

// Instructor Pages
import { InstructorDashboard, InstructorCoursesPage, CourseManagePage, InstructorStudentsPage, InstructorClassesPage, ClassManagePage, InstructorGradingPage, AssignmentGradingPage, ExamGradingPage, ClassGradingPage, InstructorEarningsPage, InstructorPayoutsPage, InstructorCreateCoursePage } from '@/pages/instructor';

// Admin Pages
import { AdminDashboard, AdminUsersPage, UserDetailPage, InstructorsManagementPage, InstructorDetailPage, CoursesManagementPage, CourseReviewPage, CategoriesManagementPage, TransactionsPage, TransactionDetailPage, AdminPayoutsPage, CommissionSettingsPage, AdminSettingsPage, ModerationPage } from '@/pages/admin';

// Gamification Pages
import { LeaderboardPage, BadgesPage } from '@/pages/gamification';

// Cart Pages
import { CartPage } from '@/pages/cart';

// Checkout Pages
import { CheckoutPage, PaymentSuccessPage } from '@/pages/checkout';

// Profile Pages
import { ProfilePage } from '@/pages/profile';

// Certificate Pages
import { CertificatesPage, CertificateDetailPage } from '@/pages/certificates';

// Assignment Pages
import { AssignmentsPage, AssignmentDetailPage } from '@/pages/assignments';

// Learning Pages
import { CourseLearningPage, LessonPage, QuizPage, ExamPage } from '@/pages/learning';

// Root layout with providers
function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <LockscreenProvider>
            <CartProvider>
              <NotificationProvider>
                <Lockscreen />
                <Outlet />
              </NotificationProvider>
            </CartProvider>
          </LockscreenProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // Public Routes
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/courses',
        element: <CourseCatalogPage />,
      },
      {
        path: '/course/:slug',
        element: <CourseDetailPage />,
      },
      {
        path: '/instructor/register',
        element: <InstructorRegisterPage />,
      },
      {
        path: '/cart',
        element: <CartPage />,
      },
      {
        path: '/checkout',
        element: (
          <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
            <CheckoutPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/payment/success',
        element: (
          <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
            <PaymentSuccessPage />
          </ProtectedRoute>
        ),
      },

      // Auth Routes (Public Only)
      {
        path: '/login',
        element: (
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        ),
      },
      {
        path: '/register',
        element: (
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        ),
      },
      {
        path: '/forgot-password',
        element: (
          <PublicOnlyRoute>
            <ForgotPasswordPage />
          </PublicOnlyRoute>
        ),
      },

      // Student Routes (Protected)
      {
        path: '/dashboard',
        element: (
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/my-courses',
        element: (
          <ProtectedRoute allowedRoles={['student']}>
            <MyCoursesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/my-classes',
        element: (
          <ProtectedRoute allowedRoles={['student']}>
            <MyClassesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/student/class/:classId',
        element: (
          <ProtectedRoute allowedRoles={['student']}>
            <ClassDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/leaderboard',
        element: (
          <ProtectedRoute allowedRoles={['student']}>
            <LeaderboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/badges',
        element: (
          <ProtectedRoute allowedRoles={['student']}>
            <BadgesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/discussions',
        element: (
          <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
            <DiscussionsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/discussions/:id',
        element: (
          <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
            <DiscussionDetailPage />
          </ProtectedRoute>
        ),
      },

      // Instructor Routes (Protected)
      {
        path: '/instructor',
        element: (
          <ProtectedRoute allowedRoles={['instructor']}>
            <InstructorDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/instructor/courses',
        element: (
          <ProtectedRoute allowedRoles={['instructor']}>
            <InstructorCoursesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/instructor/courses/create',
        element: (
          <ProtectedRoute allowedRoles={['instructor']}>
            <InstructorCreateCoursePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/instructor/courses/:courseId/edit',
        element: (
          <ProtectedRoute allowedRoles={['instructor']}>
            <CourseManagePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/instructor/courses/:courseId/analytics',
        element: (
          <ProtectedRoute allowedRoles={['instructor']}>
            <CourseManagePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/instructor/courses/:courseId/students',
        element: (
          <ProtectedRoute allowedRoles={['instructor']}>
            <CourseManagePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/instructor/classes',
        element: (
          <ProtectedRoute allowedRoles={['instructor']}>
            <InstructorClassesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/instructor/classes/:classId',
        element: (
          <ProtectedRoute allowedRoles={['instructor']}>
            <ClassManagePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/instructor/classes/:classId/manage',
        element: (
          <ProtectedRoute allowedRoles={['instructor']}>
            <ClassManagePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/instructor/students',
        element: (
          <ProtectedRoute allowedRoles={['instructor']}>
            <InstructorStudentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/instructor/grading',
        element: (
          <ProtectedRoute allowedRoles={['instructor']}>
            <InstructorGradingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/instructor/grading/assignments/:assignmentId/submissions/:submissionId',
        element: (
          <ProtectedRoute allowedRoles={['instructor']}>
            <AssignmentGradingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/instructor/grading/exams/:examId/submissions/:submissionId',
        element: (
          <ProtectedRoute allowedRoles={['instructor']}>
            <ExamGradingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/instructor/classes/:classId/grading',
        element: (
          <ProtectedRoute allowedRoles={['instructor']}>
            <ClassGradingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/instructor/earnings',
        element: (
          <ProtectedRoute allowedRoles={['instructor']}>
            <InstructorEarningsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/instructor/payouts',
        element: (
          <ProtectedRoute allowedRoles={['instructor']}>
            <InstructorPayoutsPage />
          </ProtectedRoute>
        ),
      },

      // Admin Routes (Protected)
      {
        path: '/admin',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/users',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUsersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/users/:id',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <UserDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/instructors',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <InstructorsManagementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/instructors/:id',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <InstructorDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/courses',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <CoursesManagementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/courses/:id/review',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <CourseReviewPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/categories',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <CategoriesManagementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/transactions',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <TransactionsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/transactions/:id',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <TransactionDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/payouts',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminPayoutsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/commission',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <CommissionSettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/settings',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminSettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/moderation',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <ModerationPage />
          </ProtectedRoute>
        ),
      },

      // Certificate Routes (Protected)
      {
        path: '/certificates',
        element: (
          <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
            <CertificatesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/certificates/:id',
        element: (
          <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
            <CertificateDetailPage />
          </ProtectedRoute>
        ),
      },

      // Assignment Routes (Protected)
      {
        path: '/assignments',
        element: (
          <ProtectedRoute allowedRoles={['student']}>
            <AssignmentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/assignments/:id',
        element: (
          <ProtectedRoute allowedRoles={['student']}>
            <AssignmentDetailPage />
          </ProtectedRoute>
        ),
      },

      // Learning Routes (Protected)
      {
        path: '/learn/:slug',
        element: (
          <ProtectedRoute allowedRoles={['student']}>
            <CourseLearningPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/learn/:courseId/lesson/:lessonId',
        element: (
          <ProtectedRoute allowedRoles={['student']}>
            <LessonPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/learn/:courseId/quiz/:quizId',
        element: (
          <ProtectedRoute allowedRoles={['student']}>
            <QuizPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/learn/:courseId/exam',
        element: (
          <ProtectedRoute allowedRoles={['student']}>
            <ExamPage />
          </ProtectedRoute>
        ),
      },

      // Profile Route (Protected - All authenticated users)
      {
        path: '/profile',
        element: (
          <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },

      // Catch-all - redirect to home
      {
        path: '*',
        element: <HomePage />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
