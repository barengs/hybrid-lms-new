import { apiSlice } from '../../api/apiSlice';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  parent_id: number | null;
  sort_order: number;
  is_active: boolean;
  active: boolean; // For compat if API returns 'active' or 'is_active'
  courses_count?: number;
  created_at?: string;
  updated_at?: string;
  children?: Category[];
  parent?: Category;
}

export interface CreateCategoryPayload {
  name: string;
  slug: string;
  description: string;
  icon: string;
  parent_id: number | null | ''; // Handle form empty string
  sort_order: number;
  is_active: boolean;
}

export interface UpdateCategoryPayload extends CreateCategoryPayload {
  id: number;
}

export interface CategoriesResponse {
  success: boolean;
  message: string;
  data: Category[];
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  data: Category;
}

export const categoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      query: () => '/v1/admin/categories',
      transformResponse: (response: CategoriesResponse) => response.data,
      providesTags: ['Category'],
    }),
    createCategory: builder.mutation<void, CreateCategoryPayload>({
      query: (body) => ({
        url: '/v1/admin/categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation<void, UpdateCategoryPayload>({
      query: ({ id, ...body }) => ({
        url: `/v1/admin/categories/${id}?_method=PUT`, // Using method override as common in Laravel for FormData/API consistency, or just PUT
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: `/v1/admin/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApiSlice;
