import { apiSlice } from '../../api/apiSlice';

export const adminSettingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAppSettings: builder.query<any, void>({
      query: () => '/admin/settings',
      providesTags: ['AppSettings' as any],
    }),
    updateAppSettings: builder.mutation<any, { settings: any[] }>({
      query: (data) => ({
        url: '/admin/settings/bulk',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AppSettings' as any],
    }),
    getCommissionSettings: builder.query<any, void>({
      query: () => '/admin/commission/settings',
      providesTags: ['AppSettings' as any],
    }),
    updateCommissionSettings: builder.mutation<any, any>({
      query: (data) => ({
        url: '/admin/commission/settings',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AppSettings' as any, 'Earnings' as any],
    }),
  }),
});

export const {
  useGetAppSettingsQuery,
  useUpdateAppSettingsMutation,
  useGetCommissionSettingsQuery,
  useUpdateCommissionSettingsMutation,
} = adminSettingApiSlice;
