import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { logOut, updateToken } from '../features/auth/authSlice';
import type { RootState } from '../index';

// Get token from localStorage (assuming this is where AuthProvider stores it)
const getToken = () => {
    return localStorage.getItem('auth_token') || localStorage.getItem('token');
};

const baseQuery = fetchBaseQuery({
    baseUrl: `/api/v1`,
    prepareHeaders: (headers, { getState }) => {
        // Try to get token from state first, then localStorage
        const token = (getState() as RootState).auth.token || getToken();
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  if (result.error && result.error.status === 401) {
    // try to get a new token
    const refreshResult = await baseQuery(
      {
        url: '/auth/refresh',
        method: 'POST',
      },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      const data = (refreshResult.data as any).data;
      const newToken = data.token;
      const newExpiresAt = data.expires_at;

      // store the new token
      api.dispatch(updateToken({ token: newToken, expiresAt: newExpiresAt }));

      // retry the initial query
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh failed, log out
      api.dispatch(logOut());
    }
  }
  return result;
};

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['User', 'Course', 'Class', 'InstructorCourses', 'Category', 'Students', 'Submissions', 'AppSettings', 'Earnings', 'Payouts', 'Users', 'Roles', 'Instructors', 'Courses', 'Transactions', 'TransactionStats', 'Lesson'],
    endpoints: (_builder) => ({}),
});
