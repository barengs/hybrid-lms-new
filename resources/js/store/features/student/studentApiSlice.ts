import { apiSlice } from '../../api/apiSlice';
import type { Course } from '@/types';
// Re-triggering Vite export scan

export interface StudentLearningSummary {
  total_courses: number;
  total_batches: number;
  total_classes: number;
}

export interface EnrolledCourse {
  type: 'course' | 'batch' | 'class';
  id: number;
  title: string;
  slug: string;
  thumbnail: string;
  progress: number;
  enrolled_at: string;
  instructor?: string;
}

export interface MyLearningResponse {
  success: boolean;
  data: {
    courses: EnrolledCourse[];
    batches: EnrolledCourse[];
    classes: EnrolledCourse[];
  };
}

export interface MyLearningData {
  courses: EnrolledCourse[];
  batches: EnrolledCourse[];
  classes: EnrolledCourse[];
  all: EnrolledCourse[];
}

export interface StudentApiSlice {
  getMyLearning: any;
  getCourseContent: any;
  getLessonDetail: any;
  markLessonComplete: any;
}

export interface LearningLesson {
  id: number;
  title: string;
  type: 'video' | 'article' | 'quiz' | 'assignment';
  duration: number;
  is_completed: boolean;
  is_locked: boolean;
  sort_order: number;
}

export interface LearningSection {
  id: number;
  title: string;
  sort_order: number;
  lessons: LearningLesson[];
}

export interface CourseContentData {
  id: number;
  title: string;
  slug: string;
  thumbnail: string;
  instructor_name: string;
  instructor_avatar?: string;
  progress: number;
  total_lessons: number;
  completed_lessons: number;
  sections: LearningSection[];
}

export interface CourseContentResponse {
  success: boolean;
  data: CourseContentData;
}

export interface LessonAttachment {
  id: number;
  title: string;
  file_path: string;
  file_name: string;
  file_size: number;
  file_type: string;
}

export interface LessonDetail {
  id: number;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  content: string | null;
  video_url: string | null;
  duration: number;
  is_completed: boolean;
  attachments: LessonAttachment[];
  next_lesson_id?: number | null;
  prev_lesson_id?: number | null;
}

export interface LessonDetailResponse {
  success: boolean;
  data: LessonDetail;
}

// -------------------------------------------------------
// Assignment Types
// -------------------------------------------------------
export interface SubmissionData {
  id: number;
  status: 'submitted' | 'graded' | 'late' | 'pending';
  content: string | null;
  files: { path: string; name: string; size: number; mime: string }[];
  points_awarded: number | null;
  instructor_feedback: string | null;
  ai_score: number | null;
  ai_feedback: string | null;
  ai_status: 'pending' | 'processing' | 'completed' | 'failed' | 'not_applicable';
  submitted_at: string;
  graded_at: string | null;
}

export interface AssignmentDetailData {
  id: number;
  title: string;
  description: string | null;
  instructions: string | null;
  type: 'assignment' | 'quiz' | 'project';
  due_date: string | null;
  max_points: number;
  gradable: boolean;
  allow_multiple_submissions: boolean;
  my_submission: SubmissionData | null;
}

export interface AssignmentDetailResponse {
  success: boolean;
  data: AssignmentDetailData;
}

export interface SubmitAssignmentArgs {
  assignmentId: number;
  formData: FormData;
}

export interface SubmitAssignmentResponse {
  success: boolean;
  message: string;
  data: SubmissionData;
  meta: {
    submission_status: string;
    ai_status: string;
    is_first_submission: boolean;
    submitted_at: string;
  };
}

export interface AssignmentListItem {
  id: number;
  title: string;
  description: string | null;
  type: 'assignment' | 'quiz' | 'project';
  due_date: string | null;
  max_points: number;
  is_published: boolean;
  batch_id: number;
  batch?: { id: number; name: string };
  my_submission: SubmissionData | null;
}

export interface OnboardingOption {
  value: string;
  label: string;
  icon: string;
}

export interface OnboardingQuestion {
  id: string;
  question: string;
  options: OnboardingOption[];
}

export interface AssignmentListResponse {
  success: boolean;
  data: {
    data: AssignmentListItem[];
    total: number;
    current_page: number;
    last_page: number;
  };
}

export const studentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStudentDashboard: builder.query<{ stats: any; upcoming_assignments: any[] }, void>({
      query: () => '/student/dashboard',
      transformResponse: (response: { data: any }) => response.data,
    }),
    getMyLearning: builder.query<MyLearningData, void>({
      query: () => '/student/my-learning',
      transformResponse: (response: MyLearningResponse) => {
        const { courses = [], batches = [], classes = [] } = response.data || {};
        
        const mapAndSort = (items: EnrolledCourse[], type?: 'batch' | 'class') => {
          return items.map(item => ({ 
            ...item, 
            type: type || item.type || 'course' 
          })).sort((a, b) => {
            const timeA = a.enrolled_at ? new Date(a.enrolled_at).getTime() : 0;
            const timeB = b.enrolled_at ? new Date(b.enrolled_at).getTime() : 0;
            return timeB - timeA;
          });
        };

        const mappedCourses = mapAndSort(courses);
        const mappedBatches = mapAndSort(batches, 'batch');
        const mappedClasses = mapAndSort(classes, 'class');

        return {
          courses: mappedCourses,
          batches: mappedBatches,
          classes: mappedClasses,
          all: [...mappedCourses, ...mappedBatches, ...mappedClasses].sort((a, b) => {
            const timeA = a.enrolled_at ? new Date(a.enrolled_at).getTime() : 0;
            const timeB = b.enrolled_at ? new Date(b.enrolled_at).getTime() : 0;
            return timeB - timeA;
          })
        };
      },
      providesTags: ['Course', 'Class'],
    }),
    getCourseContent: builder.query<CourseContentData, string>({
      query: (slug) => `/student/courses/${slug}/learning`,
      transformResponse: (response: CourseContentResponse) => response.data,
      providesTags: (_result, _error, slug) => [{ type: 'Course', id: slug }],
    }),
    getLessonDetail: builder.query<LessonDetail, { slug: string; lessonId: number }>({
      query: ({ slug, lessonId }) => `/student/courses/${slug}/lessons/${lessonId}`,
      transformResponse: (response: LessonDetailResponse) => response.data,
      providesTags: (_result, _error, { lessonId }) => [{ type: 'Lesson', id: lessonId }],
    }),
    markLessonComplete: builder.mutation<{ success: boolean; progress: number }, { slug: string; lessonId: number }>({
      query: ({ slug, lessonId }) => ({
        url: `/student/courses/${slug}/lessons/${lessonId}/complete`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { slug, lessonId }) => [
        { type: 'Course', id: slug },
        { type: 'Lesson', id: lessonId }
      ],
    }),
    getAssignments: builder.query<AssignmentListResponse['data'], { batch_id?: number; per_page?: number } | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params && typeof params === 'object') {
          if (params.batch_id) queryParams.set('batch_id', String(params.batch_id));
          if (params.per_page) queryParams.set('per_page', String(params.per_page));
        }
        const qs = queryParams.toString();
        return `/student/assignments${qs ? `?${qs}` : ''}`;
      },
      transformResponse: (response: AssignmentListResponse) => response.data,
      providesTags: ['Submissions'],
    }),
    getAssignmentDetail: builder.query<AssignmentDetailData, number>({

      query: (assignmentId) => `/student/assignments/${assignmentId}`,
      transformResponse: (response: AssignmentDetailResponse) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Submissions', id }],
    }),
    submitAssignment: builder.mutation<SubmitAssignmentResponse, SubmitAssignmentArgs>({
      query: ({ assignmentId, formData }) => ({
        url: `/student/assignments/${assignmentId}/submit`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (_result, _error, { assignmentId }) => [
        { type: 'Submissions', id: assignmentId },
      ],
    }),
    getOnboardingQuestions: builder.query<OnboardingQuestion[], void>({
      query: () => '/student/onboarding/questions',
      transformResponse: (response: { data: OnboardingQuestion[] }) => response.data,
    }),
    submitOnboardingInterests: builder.mutation<{ success: boolean; data: any }, { answers: { id: string; value: string }[] }>({
      query: (body) => ({
        url: '/student/onboarding/submit',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'], // Invalidate user to refresh profile.onboarding_completed status
    }),
    getRecommendations: builder.query<Course[], void>({
      query: () => '/student/recommendations',
      transformResponse: (response: { data: Course[] }) => response.data,
    }),
    toggleActivityComplete: builder.mutation<{ success: boolean; completed: boolean }, string | number>({
      query: (id) => ({
        url: `/classes/activities/${id}/toggle-complete`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => ['Class'],
    }),
  }),
});

export const {
  useGetStudentDashboardQuery,
  useGetMyLearningQuery,
  useGetCourseContentQuery,
  useGetLessonDetailQuery,
  useMarkLessonCompleteMutation,
  useGetAssignmentsQuery,
  useGetAssignmentDetailQuery,
  useSubmitAssignmentMutation,
  useGetOnboardingQuestionsQuery,
  useSubmitOnboardingInterestsMutation,
  useGetRecommendationsQuery,
  useToggleActivityCompleteMutation,
} = studentApiSlice;
