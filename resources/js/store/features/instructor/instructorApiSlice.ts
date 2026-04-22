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
  avatar: string;
  enrolledCourses: InstructorStudentCourse[];
  totalProgress: number;
  totalCoursesEnrolled: number;
  totalCoursesCompleted: number;
  lastActiveAt: string;
  joinedAt: string;
}

export interface InstructorStudentsResponse {
  success: boolean;
  message: string;
  data: InstructorStudent[];
}

export const instructorApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInstructorDashboard: builder.query<InstructorDashboardData, void>({
      query: () => '/v1/instructor/dashboard',
      transformResponse: (response: InstructorDashboardResponse) => response.data,
    }),
    getInstructorCourses: builder.query<InstructorCourse[], void>({
      query: () => '/v1/instructor/courses',
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
      query: (id) => `/v1/instructor/courses/${id}`,
      transformResponse: (response: InstructorCourseDetailResponse) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'InstructorCourses', id }],
    }),
    getCategories: builder.query<Category[], void>({
      query: () => '/v1/admin/categories',
      transformResponse: (response: CategoriesResponse) => response.data,
    }),
    createCourse: builder.mutation<void, FormData>({
      query: (body) => ({
        url: '/v1/instructor/courses',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['InstructorCourses'],
    }),
    getInstructorStudents: builder.query<InstructorStudent[], void>({
      query: () => '/v1/instructor/students',
      transformResponse: (response: InstructorStudentsResponse) => response.data,
      providesTags: ['Students'],
    }),
  }),
});

export const { 
  useGetInstructorDashboardQuery, 
  useGetInstructorCoursesQuery,
  useGetInstructorCourseQuery,
  useGetCategoriesQuery,
  useCreateCourseMutation,
  useGetInstructorStudentsQuery
} = instructorApiSlice;
