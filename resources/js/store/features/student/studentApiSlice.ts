import { apiSlice } from '../../api/apiSlice';
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
  message: string;
  data: {
    courses: EnrolledCourse[];
    batches: any[];
    classes: any[];
    summary: StudentLearningSummary;
  };
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

export const studentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyLearning: builder.query<EnrolledCourse[], void>({
      query: () => '/student/my-learning',
      transformResponse: (response: MyLearningResponse) => {
        const { courses, batches, classes } = response.data;
        // Unify for main view, mapping batches/classes to compatible structure if needed
        const unified = [
          ...courses,
          ...batches.map(b => ({ ...b, type: 'batch' as const })),
          ...classes.map(c => ({ ...c, type: 'class' as const }))
        ];
        return unified;
      },
      providesTags: ['Course'],
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
  }),
});

export const {
  useGetMyLearningQuery,
  useGetCourseContentQuery,
  useGetLessonDetailQuery,
  useMarkLessonCompleteMutation,
} = studentApiSlice;
