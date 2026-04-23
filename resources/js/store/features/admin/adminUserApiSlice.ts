import { apiSlice } from '../../api/apiSlice';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'suspended';
  created_at: string;
  last_login_at: string | null;
  deleted_at: string | null;
  roles: Array<{ id: number; name: string }>;
  profile?: {
    bio: string | null;
    address: string | null;
    avatar: string | null;
  };
}

export interface AdminUserStats {
  total: number;
  students: number;
  instructors: number;
  admins: number;
  active: number;
  suspended: number;
  newThisMonth: number;
}

export interface GetUsersParams {
  page?: number;
  per_page?: number;
  search?: string;
  role?: string;
  status?: string;
}

export interface AdminRole {
  id: number;
  name: string;
}

export const adminUserApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<{ data: AdminUser[]; total: number; current_page: number; last_page: number }, GetUsersParams>({
      query: (params) => ({
        url: '/admin/users',
        params,
      }),
      transformResponse: (response: { data: any }) => response.data,
      providesTags: ['Users' as any],
    }),
    getUserStats: builder.query<AdminUserStats, void>({
      query: () => '/admin/users/stats',
      transformResponse: (response: { data: AdminUserStats }) => response.data,
      providesTags: ['Users' as any],
    }),
    getRoles: builder.query<AdminRole[], void>({
      query: () => '/admin/roles',
      transformResponse: (response: { data: AdminRole[] }) => response.data,
    }),
    createUser: builder.mutation<any, any>({
      query: (body) => ({
        url: '/admin/users',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Users' as any],
    }),
    updateUser: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/admin/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Users' as any],
    }),
    toggleUserStatus: builder.mutation<any, string>({
      query: (id) => ({
        url: `/admin/users/${id}/toggle-status`,
        method: 'POST',
      }),
      invalidatesTags: ['Users' as any],
    }),
    deleteUser: builder.mutation<any, string>({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users' as any],
    }),
    restoreUser: builder.mutation<any, string>({
      query: (id) => ({
        url: `/admin/users/${id}/restore`,
        method: 'POST',
      }),
      invalidatesTags: ['Users' as any],
    }),
    bulkUserAction: builder.mutation<any, { ids: string[]; action: string }>({
      query: (body) => ({
        url: '/admin/users/bulk',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Users' as any],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserStatsQuery,
  useGetRolesQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useToggleUserStatusMutation,
  useDeleteUserMutation,
  useRestoreUserMutation,
  useBulkUserActionMutation,
} = adminUserApiSlice;
