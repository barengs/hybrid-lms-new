import { apiSlice } from './apiSlice';

export interface CourseStats {
  total: number;
  pending: number;
  published: number;
  revision: number;
  rejected: number;
  totalStudents: number;
}

export interface AdminCourse {
  id: number | string;
  title: string;
  slug: string;
  thumbnail: string;
  instructor: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  category: {
    id: number;
    name: string;
  };
  studentsEnrolled: number;
  price: number;
  status: 'draft' | 'pending' | 'published' | 'revision' | 'rejected';
  submitted_at?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  // Detailed fields
  subtitle?: string;
  description?: string;
  level?: string;
  language?: string;
  requirements?: string[];
  outcomes?: string[];
  admin_feedback?: string;
  sections?: any[];
}

export const courseManagementApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminCourses: builder.query<{ success: boolean; data: any }, any>({
      query: (params) => ({
        url: '/admin/courses',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.data.map(({ id }: { id: number }) => ({ type: 'Courses' as const, id })),
              { type: 'Courses', id: 'LIST' },
            ]
          : [{ type: 'Courses', id: 'LIST' }],
    }),
    getAdminCourse: builder.query<{ success: boolean; data: AdminCourse }, string | number>({
      query: (id) => `/admin/courses/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Courses', id }],
    }),
    getAdminCourseStats: builder.query<{ success: boolean; data: CourseStats }, void>({
      query: () => '/admin/courses/stats',
      providesTags: [{ type: 'Courses', id: 'STATS' }],
    }),
    updateAdminCourseStatus: builder.mutation<
      { success: boolean; message: string; data: AdminCourse },
      { id: string | number; status: string; admin_feedback?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/admin/courses/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Courses', id },
        { type: 'Courses', id: 'LIST' },
        { type: 'Courses', id: 'STATS' },
      ],
    }),
  }),
});

export const {
  useGetAdminCoursesQuery,
  useGetAdminCourseQuery,
  useGetAdminCourseStatsQuery,
  useUpdateAdminCourseStatusMutation,
} = courseManagementApiSlice;
