import { apiSlice } from '../../api/apiSlice';

export interface OnboardingOption {
  value: string;
  label: string;
  icon?: string;
}

export interface OnboardingQuestion {
  id: number;
  question: string;
  slug: string;
  options: OnboardingOption[];
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateOnboardingQuestionPayload {
  question: string;
  options: OnboardingOption[];
  sort_order?: number;
  is_active: boolean;
}

export interface UpdateOnboardingQuestionPayload extends CreateOnboardingQuestionPayload {
  id: number;
}

export interface ReorderOnboardingQuestionsPayload {
  questions: { id: number; sort_order: number }[];
}

export interface OnboardingQuestionsResponse {
  success: boolean;
  message: string;
  data: OnboardingQuestion[];
}

export interface OnboardingQuestionResponse {
  success: boolean;
  message: string;
  data: OnboardingQuestion;
}

export const onboardingQuestionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOnboardingQuestions: builder.query<OnboardingQuestion[], void>({
      query: () => '/admin/onboarding-questions',
      transformResponse: (response: OnboardingQuestionsResponse) => response.data,
      providesTags: ['OnboardingQuestions'],
    }),
    createOnboardingQuestion: builder.mutation<void, CreateOnboardingQuestionPayload>({
      query: (body) => ({
        url: '/admin/onboarding-questions',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['OnboardingQuestions'],
    }),
    updateOnboardingQuestion: builder.mutation<void, UpdateOnboardingQuestionPayload>({
      query: ({ id, ...body }) => ({
        url: `/admin/onboarding-questions/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['OnboardingQuestions'],
    }),
    deleteOnboardingQuestion: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admin/onboarding-questions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['OnboardingQuestions'],
    }),
    reorderOnboardingQuestions: builder.mutation<void, ReorderOnboardingQuestionsPayload>({
      query: (body) => ({
        url: '/admin/onboarding-questions/reorder',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['OnboardingQuestions'],
    }),
    toggleOnboardingQuestionActive: builder.mutation<void, { id: number, is_active: boolean }>({
      query: ({ id, is_active }) => ({
        url: `/admin/onboarding-questions/${id}/toggle-active`,
        method: 'POST',
        body: { is_active },
      }),
      invalidatesTags: ['OnboardingQuestions'],
    }),
  }),
});

export const {
  useGetOnboardingQuestionsQuery,
  useCreateOnboardingQuestionMutation,
  useUpdateOnboardingQuestionMutation,
  useDeleteOnboardingQuestionMutation,
  useReorderOnboardingQuestionsMutation,
  useToggleOnboardingQuestionActiveMutation,
} = onboardingQuestionApiSlice;
