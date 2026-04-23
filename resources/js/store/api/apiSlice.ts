import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Get token from localStorage (assuming this is where AuthProvider stores it)
const getToken = () => {
    return localStorage.getItem('auth_token') || localStorage.getItem('token');
};

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: `/api/v1`,
        prepareHeaders: (headers) => {
            const token = getToken();
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['User', 'Course', 'Class', 'InstructorCourses', 'Category', 'Students', 'AppSettings', 'Earnings', 'Payouts', 'Users', 'Roles', 'Instructors', 'Courses', 'Transactions', 'TransactionStats', 'Lesson'],
    endpoints: (_builder) => ({}),
});
