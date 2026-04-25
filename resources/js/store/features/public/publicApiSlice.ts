import { apiSlice } from '../../api/apiSlice';

export interface PublicCourse {
  id: number;
  title: string;
  slug: string;
  thumbnail: string;
  price: number;
  discount_price: number | null;
  level: 'beginner' | 'intermediate' | 'advanced';
  type: 'self_paced' | 'structured';
  instructor: {
    id: number;
    name: string;
    avatar: string | null;
  };
  category: {
    id: number;
    name: string;
    slug: string;
  };
  total_students: number;
  average_rating: number;
  total_reviews: number;
  duration?: number;
  lessons_count?: number;
}

export interface PublicBatch {
  id: number;
  name: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  type: 'classroom' | 'structured';
  status: string;
  start_date: string;
  end_date: string;
  instructor: {
    id: number;
    name: string;
  };
  courses: Array<{
    id: number;
    title: string;
    thumbnail: string;
  }>;
}

export interface PublicCategory {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  courses_count: number;
}

export const publicApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPublicCourses: builder.query<PublicCourse[], any>({
      query: (params) => ({
        url: '/public/courses',
        params,
      }),
      transformResponse: (response: { data: PublicCourse[] }) => response.data,
      providesTags: ['Courses'],
    }),
    getPublicCategories: builder.query<PublicCategory[], void>({
      query: () => '/public/categories',
      transformResponse: (response: { data: PublicCategory[] }) => response.data,
      providesTags: ['Category'],
    }),
    getPublicBatches: builder.query<PublicBatch[], void>({
      query: () => '/public/batches',
      transformResponse: (response: { data: PublicBatch[] }) => response.data,
      providesTags: ['Class'],
    }),
  }),
});

export const {
  useGetPublicCoursesQuery,
  useGetPublicCategoriesQuery,
  useGetPublicBatchesQuery,
} = publicApiSlice;
