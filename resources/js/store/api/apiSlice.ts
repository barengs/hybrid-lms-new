import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Get token from localStorage (assuming this is where AuthProvider stores it)
// Note: This logic might need adjustment based on the actual AuthContext implementation
const getToken = () => {
    // Check if we can access the token from storage
    // The key 'token' is a placeholder, need to verify what key existing AuthContext uses.
    // Based on standard practices, we'll try 'auth_token' or 'token'.
    return localStorage.getItem('auth_token') || localStorage.getItem('token');
};

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: `/api`,
        prepareHeaders: (headers) => {
            const token = getToken();
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['User', 'Course', 'Class', 'InstructorCourses', 'Category', 'Students'], // Define initial tags for caching invalidation
    endpoints: (_builder) => ({}), // Endpoints will be injected via injectEndpoints in feature slices
});
