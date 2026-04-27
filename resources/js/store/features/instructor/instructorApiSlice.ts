import { apiSlice } from '../../api/apiSlice';

export interface InstructorDashboardData {
  stats: {
    total_courses: number;
    total_students: number;
    monthly_revenue: number;
    total_revenue: number;
    average_rating: number;
  };
  actions: {
    pending_grading: number;
    unanswered_questions: number;
  };
  top_courses: Array<{
    id: number;
    title: string;
    total_students: number;
    revenue: number;
    trend: string;
  }>;
  revenue_summary: {
    total_revenue: number;
    this_month: number;
    available_balance: number;
  };
  activities: Array<{
    type: string;
    message: string;
    created_at: string;
  }>;
  revenue_chart: Array<{
    month: string;
    total: number;
  }>;
  active_students: Array<{
    id: number;
    name: string;
    course: string;
    progress: number;
  }>;
}

export interface InstructorDashboardResponse {
  success: boolean;
  message: string;
  data: InstructorDashboardData;
}

export interface InstructorCourse {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  price: number;
  totalStudents: number;
  totalRevenue: number;
  rating: number;
  totalRatings: number;
  totalLessons: number;
  totalModules: number;
  completionRate: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  enrollmentsThisMonth: number;
  revenueThisMonth: number;
}

export interface RawInstructorCourse {
  id: number;
  instructor_id: string;
  category_id: string | null;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  thumbnail: string | null;
  preview_video: string | null;
  type: string;
  level: string;
  language: string;
  price: string;
  discount_price: string | null;
  requirements: string[] | null;
  outcomes: string[] | null;
  target_audience: string[] | null;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  admin_feedback: string | null;
  is_featured: boolean;
  published_at: string | null;
  total_duration: string;
  total_lessons: string;
  total_enrollments: string;
  average_rating: string;
  total_reviews: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  sections_count: string;
  lessons_count: string;
  revenue: string | null;
  category: any;
}

export interface CourseSection {
  id: number;
  course_id: string;
  title: string;
  sort_order: number;
  is_active: boolean;
  is_free: boolean;
  lessons: CourseLesson[];
}

export interface CourseLesson {
  id: number;
  section_id: string;
  title: string;
  slug: string;
  type: 'video' | 'article' | 'quiz' | 'assignment';
  content: string | null;
  video_url: string | null;
  duration: number;
  is_preview: boolean;
  sort_order: number;
  is_active: boolean;
}

export interface InstructorCourseDetail extends RawInstructorCourse {
  sections: CourseSection[];
  requirements: string[] | null;
  outcomes: string[] | null;
  target_audience: string[] | null;
}

export interface InstructorCourseDetailResponse {
  success: boolean;
  message: string;
  data: InstructorCourseDetail;
}

export interface InstructorCoursesResponse {
  success: boolean;
  message: string;
  data: RawInstructorCourse[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface CreateCoursePayload {
  title: string;
  slug: string;
  thumbnail: string;
  subtitle: string;
  description: string;
  category_id: number;
  type: 'self_paced' | 'structured';
  level: 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
  language: string;
  price: number;
  discount_price: number;
  requirements: string[];
  outcomes: string[];
  target_audience: string[];
}

export interface CategoriesResponse {
  success: boolean;
  message: string;
  data: Category[];
}

export interface InstructorStudentCourse {
  courseId: string;
  courseTitle: string;
  type: 'course' | 'class';
  progress: number;
  enrolledAt: string;
  lastAccessedAt: string;
  completedLessons: number;
  totalLessons: number;
  assignmentsCompleted: number;
  totalAssignments: number;
  quizzesPassed: number;
  totalQuizzes: number;
  status: 'active' | 'completed' | 'inactive';
}

export interface InstructorStudent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinedAt: string;
  lastActiveAt: string;
  totalProgress: number;
  totalCoursesEnrolled: number;
  enrolledCourses: InstructorStudentCourse[];
}

export interface InstructorSubmission {
  id: string;
  student: {
    id: string;
    name: string;
    avatar?: string;
    email: string;
  };
  assignment: {
    id: string;
    title: string;
    type: 'assignment' | 'quiz' | 'project' | 'discussion';
    due_date: string;
    max_points: number;
    is_class_based: boolean;
    class_info?: {
      id: string;
      name: string;
    };
    course_title: string;
  };
  content?: string;
  answers?: any;
  files?: Array<{
    path: string;
    name: string;
    size: number;
    mime: string;
  }>;
  status: 'submitted' | 'late' | 'graded' | 'draft';
  submitted_at: string;
  points_awarded?: number;
  instructor_feedback?: string;
  graded_at?: string;
  ai_score?: number;
  ai_feedback?: string;
  ai_status?: 'pending' | 'processing' | 'completed' | 'failed';
  ai_evaluated_at?: string;
}

export interface InstructorSubmissionsResponse {
  success: boolean;
  message: string;
  data: {
    data: InstructorSubmission[];
    total: number;
    current_page: number;
    last_page: number;
  };
}

export interface GradeSubmissionPayload {
  id: string;
  points_awarded: number;
  instructor_feedback?: string;
}

export interface InstructorStudentsResponse {
  success: boolean;
  message: string;
  data: InstructorStudent[];
}

export interface FinancialStats {
  total_revenue: number;
  monthly_revenue: number;
  available_for_withdraw: number;
  pending_clearance: number;
  total_students: number;
  avg_revenue_per_student: number;
  settings: {
    commission_rate: number;
    tax_rate: number;
    minimum_payout: number;
    payout_delay_days: number;
  };
}

export interface CourseEarning {
  courseId: string;
  courseTitle: string;
  courseThumbnail: string;
  price: number;
  totalStudents: number;
  totalRevenue: number;
  netRevenue: number;
  monthlyRevenue: number;
  commission: number;
  growthPercentage: number;
}

export interface InstructorTransaction {
  id: string;
  studentName: string;
  studentAvatar: string | null;
  courseTitle: string;
  amount: number;
  netAmount: number;
  status: 'completed' | 'pending' | 'refunded';
  date: string;
}

export interface EarningsData {
  stats: FinancialStats;
  course_earnings: CourseEarning[];
  recent_transactions: InstructorTransaction[];
}

export interface Payout {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled';
  method: string;
  account_info: string;
  notes: string | null;
  processed_at: string | null;
  created_at: string;
}

export interface RequestPayoutPayload {
  amount: number;
  method: string;
  account_info: string;
}

export const instructorApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInstructorDashboard: builder.query<InstructorDashboardData, void>({
      query: () => '/instructor/dashboard',
      transformResponse: (response: InstructorDashboardResponse) => response.data,
    }),
    getInstructorCourses: builder.query<InstructorCourse[], void>({
      query: () => '/instructor/courses',
      transformResponse: (response: RawInstructorCourse[]) => {
        const courses = Array.isArray(response) ? response : [];
        return courses.map((course) => ({
          id: String(course.id),
          title: course.title,
          slug: course.slug,
          thumbnail: course.thumbnail ? `${import.meta.env.VITE_URL_API_IMAGE}/${course.thumbnail}` : '',
          status: course.status,
          price: Number(course.price),
          totalStudents: Number(course.total_enrollments),
          totalRevenue: Number(course.revenue || 0),
          rating: Number(course.average_rating),
          totalRatings: Number(course.total_reviews),
          totalLessons: Number(course.lessons_count),
          totalModules: Number(course.sections_count),
          completionRate: 0, // Not provided by backend yet
          createdAt: course.created_at,
          updatedAt: course.updated_at,
          publishedAt: course.published_at || undefined,
          enrollmentsThisMonth: 0, // Not provided by backend yet
          revenueThisMonth: 0, // Not provided by backend yet
        }));
      },
      providesTags: ['InstructorCourses'],
    }),
    getInstructorCourse: builder.query<InstructorCourseDetail, string>({
      query: (id) => `/instructor/courses/${id}`,
      transformResponse: (response: InstructorCourseDetailResponse) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'InstructorCourses', id }],
    }),
    getCategories: builder.query<Category[], void>({
      query: () => '/admin/categories',
      transformResponse: (response: CategoriesResponse) => response.data,
    }),
    createCourse: builder.mutation<void, FormData>({
      query: (body) => ({
        url: '/instructor/courses',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['InstructorCourses'],
    }),
    getInstructorStudents: builder.query<InstructorStudent[], void>({
      query: () => '/instructor/students',
      transformResponse: (response: InstructorStudentsResponse) => response.data,
      providesTags: ['Students'],
    }),
    getInstructorSubmissions: builder.query<InstructorSubmission[], { status?: string; type?: string }>({
      query: (params) => ({
        url: '/instructor/submissions',
        params,
      }),
      transformResponse: (response: InstructorSubmissionsResponse) => response.data.data,
      providesTags: ['Submissions'],
    }),
    gradeSubmission: builder.mutation<InstructorSubmission, GradeSubmissionPayload>({
      query: ({ id, ...body }) => ({
        url: `/instructor/submissions/${id}/grade`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Submissions'],
    }),
    aiGradeSubmission: builder.mutation<InstructorSubmission, string>({
      query: (id) => ({
        url: `/instructor/submissions/${id}/ai-grade`,
        method: 'POST',
      }),
      invalidatesTags: ['Submissions'],
    }),
    getInstructorEarnings: builder.query<EarningsData, void>({
      query: () => '/instructor/earnings',
      transformResponse: (response: { data: EarningsData }) => response.data,
      providesTags: ['Earnings'],
    }),
    getInstructorPayouts: builder.query<Payout[], void>({
      query: () => '/instructor/payouts',
      transformResponse: (response: { data: Payout[] }) => response.data,
      providesTags: ['Payouts'],
    }),
    requestPayout: builder.mutation<{ success: boolean; message: string }, RequestPayoutPayload>({
      query: (body) => ({
        url: '/instructor/payouts',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Payouts', 'Earnings'],
    }),
  }),
});

export const { 
  useGetInstructorDashboardQuery, 
  useGetInstructorCoursesQuery,
  useGetInstructorCourseQuery,
  useGetCategoriesQuery,
  useCreateCourseMutation,
  useGetInstructorStudentsQuery,
  useGetInstructorSubmissionsQuery,
  useGradeSubmissionMutation,
  useAiGradeSubmissionMutation,
  useGetInstructorEarningsQuery,
  useGetInstructorPayoutsQuery,
  useRequestPayoutMutation,
} = instructorApiSlice;
