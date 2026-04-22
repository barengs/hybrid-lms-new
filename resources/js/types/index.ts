// User Types
export type UserRole = 'student' | 'instructor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  bio?: string;
  createdAt: string;
  isVerified: boolean;
}

export interface Student extends User {
  role: 'student';
  enrolledCourses: string[];
  completedCourses: string[];
  points: number;
  badges: Badge[];
}

export interface Instructor extends User {
  role: 'instructor';
  courses: string[];
  totalStudents: number;
  totalEarnings: number;
  rating: number;
  bankAccount?: BankAccount;
}

export interface Admin extends User {
  role: 'admin';
  permissions: string[];
}

// Course Types
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseType = 'self-paced' | 'structured';
export type CourseStatus = 'draft' | 'pending' | 'published' | 'rejected';

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  introVideo?: string;
  instructorId: string;
  instructor?: Instructor;
  categoryId: string;
  category?: Category;
  level: CourseLevel;
  type: CourseType;
  price: number;
  discountPrice?: number;
  currency: string;
  rating: number;
  totalRatings: number;
  totalStudents: number;
  totalDuration: number;
  totalLessons: number;
  prerequisites: string[];
  objectives: string[];
  syllabus: Module[];
  isFeatured: boolean;
  status: CourseStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'article' | 'quiz' | 'assignment';
  duration: number;
  content?: string;
  videoUrl?: string;
  attachments?: Attachment[];
  order: number;
  isFree: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

// Batch (Structured Class)
export interface Batch {
  id: string;
  courseId: string;
  name: string;
  startDate: string;
  endDate: string;
  maxStudents: number;
  enrolledStudents: number;
  status: 'upcoming' | 'ongoing' | 'completed';
}

// Enrollment & Progress
export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  batchId?: string;
  progress: number;
  completedLessons: string[];
  startedAt: string;
  completedAt?: string;
  certificateUrl?: string;
}

// Assignment & Submission
export interface Assignment {
  id: string;
  courseId: string;
  batchId: string;
  title: string;
  description: string;
  instructions: string;
  attachments: Attachment[];
  dueDate: string;
  maxScore: number;
  createdAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  student?: Student;
  content: string;
  attachments: Attachment[];
  submittedAt: string;
  score?: number;
  feedback?: string;
  gradedAt?: string;
  gradedBy?: string;
}

// Quiz
export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  description?: string;
  timeLimit: number;
  passingScore: number;
  questions: Question[];
}

export interface Question {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string | string[];
  points: number;
}

// Category
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentId?: string;
  coursesCount: number;
}

// Review
export interface Review {
  id: string;
  courseId: string;
  userId: string;
  user?: User;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

// Discussion / Forum
export interface Discussion {
  id: string;
  courseId: string;
  batchId?: string;
  userId: string;
  user?: User;
  title: string;
  content: string;
  replies: Reply[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Reply {
  id: string;
  discussionId: string;
  userId: string;
  user?: User;
  content: string;
  isInstructorReply: boolean;
  createdAt: string;
}

// Announcement
export interface Announcement {
  id: string;
  courseId: string;
  batchId?: string;
  instructorId: string;
  title: string;
  content: string;
  createdAt: string;
}

// Cart & Transaction
export interface CartItem {
  courseId: string;
  course: Course;
  addedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  items: TransactionItem[];
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
  paidAt?: string;
}

export interface TransactionItem {
  courseId: string;
  course?: Course;
  price: number;
}

// Payout (Instructor)
export interface Payout {
  id: string;
  instructorId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: string;
  processedAt?: string;
}

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

// Notification
export interface Notification {
  id: string;
  userId: string;
  type: 'announcement' | 'assignment' | 'deadline' | 'reply' | 'system';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

// Gamification
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  points: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  user?: User;
  points: number;
  badges: number;
  coursesCompleted: number;
}

// Analytics
export interface CourseAnalytics {
  courseId: string;
  totalEnrollments: number;
  totalRevenue: number;
  averageProgress: number;
  averageRating: number;
  completionRate: number;
  lessonViews: { lessonId: string; views: number }[];
  dropOffPoints: { lessonId: string; dropOffs: number }[];
}

export interface PlatformAnalytics {
  totalUsers: number;
  totalCourses: number;
  totalRevenue: number;
  totalEnrollments: number;
  newUsersThisMonth: number;
  newCoursesThisMonth: number;
  revenueThisMonth: number;
  enrollmentsThisMonth: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
