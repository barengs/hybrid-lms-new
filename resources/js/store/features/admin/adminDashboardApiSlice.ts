import { apiSlice } from '@/store/api/apiSlice';

export const adminDashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboard: builder.query<any, void>({
      query: () => '/admin/dashboard',
    }),
  }),
  overrideExisting: false,
});

export const { useGetAdminDashboardQuery } = adminDashboardApiSlice;
