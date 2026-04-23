import { apiSlice } from './apiSlice';

export interface InstructorStats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
}

export interface Instructor {
  id: number | string;
  name: string;
  email: string;
  status: 'active' | 'suspended' | 'pending' | 'rejected';
  created_at: string;
  profile?: {
    avatar: string | null;
    bio: string | null;
    address: string | null;
    phone: string | null;
    headline: string | null;
    website?: string | null;
    linkedin?: string | null;
    twitter?: string | null;
    youtube?: string | null;
    expertise: any;
  };
  last_login_at?: string | null;
  stats?: {
    coursesCreated: number;
    totalStudents: number;
    totalRevenue: number;
    rating: number;
    totalCourses?: number;
    publishedCourses?: number;
    totalClasses?: number;
    averageRating?: number;
    totalReviews?: number;
  };
  courses_data?: any[];
  batches_data?: any[];
}

export const instructorManagementApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInstructors: builder.query<{ success: boolean; data: any }, any>({
      query: (params) => ({
        url: '/admin/instructors',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.data.map(({ id }: { id: number }) => ({ type: 'Instructors' as const, id })),
              { type: 'Instructors', id: 'LIST' },
            ]
          : [{ type: 'Instructors', id: 'LIST' }],
    }),
    getInstructor: builder.query<{ success: boolean; data: Instructor }, string | number>({
      query: (id) => `/admin/instructors/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Instructors', id }],
    }),
    getInstructorStats: builder.query<{ success: boolean; data: InstructorStats }, void>({
      query: () => '/admin/instructors/stats',
      providesTags: [{ type: 'Instructors', id: 'STATS' }],
    }),
    updateInstructorStatus: builder.mutation<{ success: boolean; message: string; data: any }, { id: string | number; status: string }>({
      query: ({ id, status }) => ({
        url: `/admin/instructors/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Instructors', id },
        { type: 'Instructors', id: 'LIST' },
        { type: 'Instructors', id: 'STATS' },
      ],
    }),
    deleteInstructor: builder.mutation<{ success: boolean; message: string }, string | number>({
      query: (id) => ({
        url: `/admin/instructors/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Instructors', id: 'LIST' }, { type: 'Instructors', id: 'STATS' }],
    }),
  }),
});

export const {
  useGetInstructorsQuery,
  useGetInstructorQuery,
  useGetInstructorStatsQuery,
  useUpdateInstructorStatusMutation,
  useDeleteInstructorMutation,
} = instructorManagementApiSlice;
