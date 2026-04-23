import { apiSlice } from '../../api/apiSlice';
import type { Discussion } from '@/types';

export interface DiscussionFilter {
  batch_id?: string | number;
  lesson_id?: string | number;
  type?: 'question' | 'discussion' | 'announcement';
  search?: string;
  per_page?: number;
  page?: number;
}

export const discussionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDiscussions: builder.query<any, DiscussionFilter>({
      query: (filter) => ({
        url: '/discussions',
        params: filter,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }: { id: string | number }) => ({ type: 'Discussion' as const, id })),
              { type: 'Discussion', id: 'LIST' },
            ]
          : [{ type: 'Discussion', id: 'LIST' }],
    }),
    getDiscussionDetail: builder.query<{ data: Discussion }, string | number>({
      query: (id) => `/discussions/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Discussion', id }],
    }),
    createDiscussion: builder.mutation<any, Partial<Discussion>>({
      query: (data) => ({
        url: '/discussions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Discussion', id: 'LIST' }],
    }),
    updateDiscussion: builder.mutation<any, { id: string | number; data: Partial<Discussion> }>({
      query: ({ id, data }) => ({
        url: `/discussions/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Discussion', id }],
    }),
    deleteDiscussion: builder.mutation<any, string | number>({
      query: (id) => ({
        url: `/discussions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Discussion', id: 'LIST' }],
    }),
    togglePinDiscussion: builder.mutation<any, string | number>({
      query: (id) => ({
        url: `/discussions/${id}/toggle-pin`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Discussion', id }],
    }),
  }),
});

export const {
  useGetDiscussionsQuery,
  useGetDiscussionDetailQuery,
  useCreateDiscussionMutation,
  useUpdateDiscussionMutation,
  useDeleteDiscussionMutation,
  useTogglePinDiscussionMutation,
} = discussionApiSlice;
