import { apiSlice } from '../../api/apiSlice';
import type { MenuItem } from '../../api/menuApiSlice';

export interface AdminPermission {
  id: number;
  name: string;
  guard_name: string;
}

export interface AdminRole {
  id: number;
  name: string;
  guard_name: string;
  permissions: AdminPermission[];
}

export const adminRoleApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query<AdminRole[], void>({
      query: () => '/admin/roles',
      transformResponse: (response: { data: AdminRole[] }) => response.data,
      providesTags: ['Roles' as any],
    }),
    getPermissions: builder.query<AdminPermission[], void>({
      query: () => '/admin/permissions',
      transformResponse: (response: { data: AdminPermission[] }) => response.data,
    }),
    getMatrix: builder.query<{ data: MenuItem[] }, void>({
      query: () => '/admin/roles/matrix',
    }),
    createRole: builder.mutation<AdminRole, { name: string; permissions: string[] }>({
      query: (body) => ({
        url: '/admin/roles',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Roles' as any],
    }),
    updateRole: builder.mutation<AdminRole, { id: number; name?: string; permissions?: string[] }>({
      query: ({ id, ...body }) => ({
        url: `/admin/roles/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Roles' as any, 'Users' as any],
    }),
    deleteRole: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admin/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Roles' as any, 'Users' as any],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetPermissionsQuery,
  useGetMatrixQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = adminRoleApiSlice;
