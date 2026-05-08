import { apiSlice } from '../../api/apiSlice';

export const cartApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query<any, void>({
      query: () => '/cart',
      providesTags: ['Transactions'],
    }),
    addToCartBackend: builder.mutation<{ success: boolean; message: string; data: any }, number>({
      query: (courseId) => ({
        url: '/cart',
        method: 'POST',
        body: { course_id: courseId },
      }),
      invalidatesTags: ['Transactions'],
    }),
    removeFromCartBackend: builder.mutation<{ success: boolean; message: string }, number>({
      query: (itemId) => ({
        url: `/cart/items/${itemId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Transactions'],
    }),
    clearCartBackend: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: '/cart',
        method: 'DELETE',
      }),
      invalidatesTags: ['Transactions'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartBackendMutation,
  useRemoveFromCartBackendMutation,
  useClearCartBackendMutation,
} = cartApiSlice;
