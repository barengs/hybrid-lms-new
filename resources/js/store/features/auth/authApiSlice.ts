import { apiSlice } from '../../api/apiSlice';

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/v1/auth/login',
        method: 'POST',
        body: { ...credentials },
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: 'v1/auth/logout',
        method: 'POST',
      }),
    }),
    register: builder.mutation({
      query: (credentials) => ({
        url: '/v1/auth/register',
        method: 'POST',
        body: { ...credentials },
      }),
    }),
    refresh: builder.mutation<any, void>({
      query: () => ({
        url: '/v1/auth/refresh',
        method: 'POST',
      }),
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useRegisterMutation, useRefreshMutation } = authApiSlice;
