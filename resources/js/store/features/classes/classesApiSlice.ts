import { apiSlice } from '../../api/apiSlice';

export interface ClassInstructor {
  id: string | number;
  name: string;
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
  description?: string; // Kept for compatibility if backend adds it later or UI needs it
}

export interface ClassCourse {
  id: number | string;
  title: string;
  topics: ClassTopic[];
}

export interface ClassAssessmentStats {
  assignments_count: string | number;
  ungraded_submissions_count: number;
  class_average_score: string | number;
  achieving_students_count: string | number;
  needs_attention_count: string | number;
}

export interface ClassItem {
  id: number | string;
  name: string;
  slug: string;
  description?: string;
  class_code: string;
  type: string;
  
  // Relationships
  instructor?: ClassInstructor;
  courses: ClassCourse[];
  
  // Stats & Status
  students_count: string | number;
  created_at: string;
  updated_at?: string;
  is_open_for_enrollment: string | boolean; // API says string, UI might expect boolean. safely type as both or string.
  is_enrolled: string | boolean;
  
  // Detailed Stats
  assessment_stats?: ClassAssessmentStats;
  
  // Optional/Legacy fields (cleanup if confirmed unused, but keeping for safety during refactor)
  status?: 'active' | 'archived'; 
  thumbnail?: string; 
  schedule?: ClassSchedule;
  start_date?: string;
  end_date?: string;
  progress?: number;
  max_students?: number;
  
  // UI helpers (mapped)
  recentStudents?: { id: string; name: string; avatar?: string }[];
  lastActivityAt?: string;
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
      query: () => 'v1/classes', // URL matches v1/classes via baseURL config
      providesTags: ['Class'],
    }),
    getClass: builder.query<ClassDetailResponse, string | number>({
        query: (id) => `v1/classes/${id}`,
        providesTags: (_result, _error, id) => [{ type: 'Class', id }],
    }),
    createClass: builder.mutation<void, CreateClassRequest>({
      query: (body) => ({
        url: 'v1/classes',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Class'],
    }),
    updateClass: builder.mutation<void, UpdateClassRequest>({
      query: ({ id, ...body }) => ({
        url: `v1/classes/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => ['Class', { type: 'Class', id }],
    }),
    deleteClass: builder.mutation<void, string | number>({
      query: (id) => ({
        url: `v1/classes/${id}`,
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
  useDeleteClassMutation 
} = classesApiSlice;

