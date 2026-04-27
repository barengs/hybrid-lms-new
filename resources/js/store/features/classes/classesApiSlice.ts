import { apiSlice } from '../../api/apiSlice';

export interface ClassInstructor {
  id: string | number;
  name: string;
  email: string;
  avatar?: string;
}

export interface ClassSchedule {
  day: string;
  time: string;
  location: string;
}

export interface ClassNotifications {
  newMaterials: number;
  newAssignments: number;
  upcomingDeadlines: number;
}

export interface ClassMaterial {
  id: number | string;
  title: string;
  type: 'video' | 'document' | 'link' | 'image' | string;
  file_size?: string;
  file_name?: string;
  url?: string;
}

export interface ClassTopic {
  id: number | string;
  title: string;
  materials_count: number;
  materials: ClassMaterial[];
  description?: string;
}

export interface ClassCourse {
  id: number | string;
  title: string;
  topics: ClassTopic[];
}

export interface ClassAssignment {
  id: number | string;
  title: string;
  description?: string;
  due_date?: string;
  status: 'pending' | 'submitted' | 'graded' | string;
  grade?: number;
  totalPoints?: number;
}

export interface ClassSession {
  id: number | string;
  title: string;
  type?: 'material' | 'online_class' | string;
  description?: string;
  sessionDate: string;
  duration?: string;
  recordingUrl?: string;
  meetingUrl?: string;
  status: 'upcoming' | 'completed' | 'canceled' | string;
  materials?: any[];
  comments?: {
    id: number;
    comment: string;
    created_at: string;
    user: {
      name: string;
      avatar: string | null;
    };
    replies?: any[];
  }[];
}

export interface ClassAdditionalMaterial {
  id: number | string;
  title: string;
  type: string;
  size: string;
  uploadedAt: string;
  url: string;
}

export interface ClassAssessmentStats {
  assignments_count: string | number;
  ungraded_submissions_count: number;
  class_average_score: string | number;
  achieving_students_count: string | number;
  needs_attention_count: string | number;
}

export interface ClassStudent {
  id: string | number;
  name: string;
  email: string;
  avatar?: string;
  joined_at: string;
  progress: number;
  grade_score?: number;
  assignments_completed: number;
  assignments_total: number;
}

export interface ClassItem {
  id: number | string;
  name: string;
  slug: string;
  description?: string;
  class_code: string;
  type: string;
  instructor?: ClassInstructor;
  courses: ClassCourse[];
  assignments?: ClassAssignment[];
  sessions?: ClassSession[];
  additionalMaterials?: ClassAdditionalMaterial[];
  students_count: string | number;
  students?: ClassStudent[];
  created_at: string;
  updated_at?: string;
  is_open_for_enrollment: string | boolean;
  is_enrolled: string | boolean;
  assessment_stats?: ClassAssessmentStats;
  course?: { id: number | string; title: string; slug: string; thumbnail?: string };
  topicsCount?: number;
  materialsCount?: number;
  averageGrade?: number;
  status?: 'open' | 'in_progress' | 'completed' | 'closed' | 'archived' | 'active'; 
  thumbnail?: string; 
  schedule?: ClassSchedule;
  start_date?: string;
  end_date?: string;
  progress?: number;
  max_students?: number;
  notifications?: ClassNotifications;
  nextSession?: string;
  recentStudents?: { id: string; name: string; avatar?: string }[];
  lastActivityAt?: string;
  classwork_topics?: any[];
}

export interface ClassesResponse {
  success: boolean;
  message: string;
  data: {
    items: ClassItem[];
    meta: {
      statistics: {
        total_batches: number;
        active_batches: number;
        published_batches: number;
        archived_batches: number;
        total_students: number;
        average_grade: number;
      };
      filters: {
        all: number;
        active: number;
        archived: number;
      };
    };
  };
}

export interface ClassDetailResponse {
  success: boolean;
  message: string;
  data: ClassItem;
}

export interface CreateClassRequest {
  name: string;
  code: string;
  description?: string;
  courseId?: string | number;
}

export interface UpdateClassRequest extends Partial<CreateClassRequest> {
  id: string | number;
  status?: 'active' | 'archived';
}

export const classesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getClasses: builder.query<ClassesResponse, void>({
      query: () => 'classes',
      providesTags: ['Class'],
    }),
    getClass: builder.query<ClassDetailResponse, string | number>({
        query: (id) => `classes/${id}`,
        providesTags: (_result, _error, id) => [{ type: 'Class', id }],
    }),
    createClass: builder.mutation<void, FormData | CreateClassRequest>({
      query: (body) => ({
        url: 'classes',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Class'],
    }),
    updateClass: builder.mutation<void, UpdateClassRequest>({
      query: ({ id, ...body }) => ({
        url: `classes/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => ['Class', { type: 'Class', id }],
    }),
    deleteClass: builder.mutation<void, string | number>({
      query: (id) => ({
        url: `classes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Class'],
    }),
    postSessionComment: builder.mutation<void, { sessionId: number | string; comment: string; parentId?: number }>({
      query: ({ sessionId, ...body }) => ({
        url: `classes/sessions/${sessionId}/comments`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { sessionId }) => [{ type: 'Class' }],
    }),
    joinClass: builder.mutation<ClassDetailResponse, { class_code: string }>({
      query: (body) => ({
        url: 'classes/join',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Class'],
    }),
    createTopic: builder.mutation<void, { classId: string | number; title: string }>({
      query: ({ classId, title }) => ({
        url: `classes/${classId}/topics`,
        method: 'POST',
        body: { title },
      }),
      invalidatesTags: (_result, _error, { classId }) => [{ type: 'Class', id: classId }],
    }),
    updateTopic: builder.mutation<void, { classId: string | number; topicId: string | number; title: string }>({
      query: ({ classId, topicId, title }) => ({
        url: `classes/${classId}/topics/${topicId}`,
        method: 'PUT',
        body: { title },
      }),
      invalidatesTags: (_result, _error, { classId }) => [{ type: 'Class', id: classId }],
    }),
    deleteTopic: builder.mutation<void, { classId: string | number; topicId: string | number }>({
      query: ({ classId, topicId }) => ({
        url: `classes/${classId}/topics/${topicId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { classId }) => [{ type: 'Class', id: classId }],
    }),
    createSession: builder.mutation<void, { classId: string | number; data: any }>({
      query: ({ classId, data }) => {
        const isFormData = data instanceof FormData;
        return {
          url: `classes/${classId}/sessions`,
          method: 'POST',
          body: data,
          formData: isFormData,
        };
      },
      invalidatesTags: (_result, _error, { classId }) => [{ type: 'Class', id: classId }],
    }),
    updateSession: builder.mutation<void, { classId: string | number; sessionId: string | number; data: any }>({
      query: ({ classId, sessionId, data }) => {
        const isFormData = data instanceof FormData;
        return {
          url: `classes/${classId}/sessions/${sessionId}`,
          method: isFormData ? 'POST' : 'PUT', // For FormData in Laravel update, we often use POST with _method=PUT, handled below or via body
          body: data,
          formData: isFormData,
        };
      },
      invalidatesTags: (_result, _error, { classId }) => [{ type: 'Class', id: classId }],
    }),
    deleteSession: builder.mutation<void, { classId: string | number; sessionId: string | number }>({
      query: ({ classId, sessionId }) => ({
        url: `classes/${classId}/sessions/${sessionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { classId }) => [{ type: 'Class', id: classId }],
    }),
    createAssignment: builder.mutation<void, { data: any }>({
      query: (data) => ({
        url: 'instructor/assignments',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Class'],
    }),
    updateAssignment: builder.mutation<void, { assignmentId: string | number; data: any }>({
      query: ({ assignmentId, data }) => ({
        url: `instructor/assignments/${assignmentId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Class'],
    }),
    deleteAssignment: builder.mutation<void, string | number>({
      query: (id) => ({
        url: `instructor/assignments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Class'],
    }),
  }),
});

export const { 
  useGetClassesQuery, 
  useGetClassQuery, 
  useCreateClassMutation, 
  useUpdateClassMutation, 
  useDeleteClassMutation,
  usePostSessionCommentMutation,
  useJoinClassMutation,
  useCreateSessionMutation,
  useUpdateSessionMutation,
  useDeleteSessionMutation,
  useCreateTopicMutation,
  useUpdateTopicMutation,
  useDeleteTopicMutation,
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation
} = classesApiSlice;
