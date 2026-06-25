import { apiSlice } from '@/store/api/apiSlice';

export const adminInstructorVerificationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInstructorApplications: builder.query<any, void>({
      query: () => '/admin/instructor-applications',
      providesTags: ['InstructorApplications'],
    }),
    approveInstructorApplication: builder.mutation<any, number>({
      query: (id) => ({
        url: `/admin/instructor-applications/${id}/approve`,
        method: 'POST',
      }),
      invalidatesTags: ['InstructorApplications', 'AdminDashboard'],
    }),
    rejectInstructorApplication: builder.mutation<any, { id: number; notes: string }>({
      query: ({ id, notes }) => ({
        url: `/admin/instructor-applications/${id}/reject`,
        method: 'POST',
        body: { notes },
      }),
      invalidatesTags: ['InstructorApplications', 'AdminDashboard'],
    }),
  }),
});

export const {
  useGetInstructorApplicationsQuery,
  useApproveInstructorApplicationMutation,
  useRejectInstructorApplicationMutation,
} = adminInstructorVerificationApiSlice;
