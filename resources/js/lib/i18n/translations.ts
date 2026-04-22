export type Language = 'id' | 'en';

export interface Translations {
  // Navigation
  nav: {
    home: string;
    exploreCourses: string;
    dashboard: string;
    myCourses: string;
    login: string;
    register: string;
    logout: string;
    profile: string;
    settings: string;
    cart: string;
    notifications: string;
    search: string;
    searchPlaceholder: string;
  };
  // Common
  common: {
    loading: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    view: string;
    viewAll: string;
    back: string;
    next: string;
    previous: string;
    submit: string;
    continue: string;
    start: string;
    completed: string;
    inProgress: string;
    pending: string;
    all: string;
    filter: string;
    sort: string;
    clear: string;
    apply: string;
    yes: string;
    no: string;
    or: string;
    and: string;
    free: string;
    new: string;
    popular: string;
    featured: string;
  };
  // Auth
  auth: {
    welcomeBack: string;
    loginSubtitle: string;
    createAccount: string;
    registerSubtitle: string;
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    rememberMe: string;
    forgotPassword: string;
    noAccount: string;
    hasAccount: string;
    registerAs: string;
    student: string;
    instructor: string;
    agreeTerms: string;
    termsConditions: string;
    privacyPolicy: string;
    sendResetLink: string;
    backToLogin: string;
    checkEmail: string;
    resetSent: string;
    demoAccounts: string;
  };
  // Course
  course: {
    courses: string;
    course: string;
    lessons: string;
    lesson: string;
    modules: string;
    duration: string;
    students: string;
    reviews: string;
    rating: string;
    level: string;
    beginner: string;
    intermediate: string;
    advanced: string;
    type: string;
    selfPaced: string;
    structured: string;
    category: string;
    instructor: string;
    whatYouLearn: string;
    courseContent: string;
    prerequisites: string;
    studentReviews: string;
    addToCart: string;
    buyNow: string;
    viewCart: string;
    enrolled: string;
    continueLeaning: string;
    startCourse: string;
    progress: string;
    certificate: string;
    includes: string;
    lifetimeAccess: string;
    completionCertificate: string;
  };
  // Dashboard
  dashboard: {
    welcome: string;
    continueLearning: string;
    upcomingDeadlines: string;
    recentAchievements: string;
    learningStats: string;
    hoursLearned: string;
    certificates: string;
    longestStreak: string;
    activeCourses: string;
    completedCourses: string;
    totalPoints: string;
    dayStreak: string;
    daysLeft: string;
    noDeadlines: string;
    viewAllBadges: string;
    yourRank: string;
    viewLeaderboard: string;
    pointsToNext: string;
  };
  // Instructor
  instructor: {
    instructorDashboard: string;
    coursePerformance: string;
    totalCourses: string;
    totalStudents: string;
    monthlyEarnings: string;
    avgRating: string;
    pendingQuestions: string;
    pendingSubmissions: string;
    earningSummary: string;
    totalEarnings: string;
    thisMonth: string;
    availableWithdraw: string;
    withdraw: string;
    recentActivity: string;
    topStudents: string;
    revenue6Months: string;
  };
  // Admin
  admin: {
    adminDashboard: string;
    platformOverview: string;
    totalUsers: string;
    totalCourses: string;
    totalRevenue: string;
    revenueThisMonth: string;
    pendingVerifications: string;
    pendingCourseReviews: string;
    pendingPayouts: string;
    recentTransactions: string;
    topCourses: string;
    instructorVerification: string;
    payoutSummary: string;
    platformStats: string;
    conversionRate: string;
    avgOrder: string;
    platformCommission: string;
    refundRate: string;
    processPayments: string;
    review: string;
  };
  // Gamification
  gamification: {
    leaderboard: string;
    badges: string;
    myBadges: string;
    points: string;
    rank: string;
    streak: string;
    earnedBadges: string;
    inProgressBadges: string;
    lockedBadges: string;
    earnPoints: string;
    completeLesson: string;
    completeCourse: string;
    quizPerfect: string;
    dailyStreak: string;
    perLesson: string;
    perCourse: string;
    perQuiz: string;
    perDay: string;
    fullRankings: string;
  };
  // Cart
  cart: {
    shoppingCart: string;
    emptyCart: string;
    emptyCartMessage: string;
    orderSummary: string;
    subtotal: string;
    discount: string;
    total: string;
    promoCode: string;
    checkout: string;
    securePayment: string;
    clearCart: string;
    items: string;
  };
  // Footer
  footer: {
    explore: string;
    allCourses: string;
    categories: string;
    instructors: string;
    company: string;
    aboutUs: string;
    careers: string;
    contactUs: string;
    legal: string;
    refundPolicy: string;
    allRightsReserved: string;
  };
  // Messages
  messages: {
    loginError: string;
    passwordMismatch: string;
    agreeTermsRequired: string;
    noCoursesFound: string;
    courseNotFound: string;
    noNotifications: string;
  };
}

export const translations: Record<Language, Translations> = {
  id: {
    nav: {
      home: 'Beranda',
      exploreCourses: 'Jelajahi Kursus',
      dashboard: 'Dashboard',
      myCourses: 'Kursus Saya',
      login: 'Masuk',
      register: 'Daftar',
      logout: 'Keluar',
      profile: 'Profil Saya',
      settings: 'Pengaturan',
      cart: 'Keranjang',
      notifications: 'Notifikasi',
      search: 'Cari',
      searchPlaceholder: 'Cari kursus...',
    },
    common: {
      loading: 'Memuat...',
      save: 'Simpan',
      cancel: 'Batal',
      delete: 'Hapus',
      edit: 'Edit',
      view: 'Lihat',
      viewAll: 'Lihat Semua',
      back: 'Kembali',
      next: 'Selanjutnya',
      previous: 'Sebelumnya',
      submit: 'Kirim',
      continue: 'Lanjutkan',
      start: 'Mulai',
      completed: 'Selesai',
      inProgress: 'Sedang Berjalan',
      pending: 'Menunggu',
      all: 'Semua',
      filter: 'Filter',
      sort: 'Urutkan',
      clear: 'Hapus',
      apply: 'Terapkan',
      yes: 'Ya',
      no: 'Tidak',
      or: 'Atau',
      and: 'dan',
      free: 'Gratis',
      new: 'Baru',
      popular: 'Populer',
      featured: 'Unggulan',
    },
    auth: {
      welcomeBack: 'Selamat Datang Kembali',
      loginSubtitle: 'Masuk ke akun Anda untuk melanjutkan belajar',
      createAccount: 'Buat Akun Baru',
      registerSubtitle: 'Mulai perjalanan belajar Anda bersama kami',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Konfirmasi Password',
      fullName: 'Nama Lengkap',
      rememberMe: 'Ingat saya',
      forgotPassword: 'Lupa password?',
      noAccount: 'Belum punya akun?',
      hasAccount: 'Sudah punya akun?',
      registerAs: 'Daftar Sebagai',
      student: 'Siswa / Peserta',
      instructor: 'Instruktur / Pengajar',
      agreeTerms: 'Saya menyetujui',
      termsConditions: 'Syarat & Ketentuan',
      privacyPolicy: 'Kebijakan Privasi',
      sendResetLink: 'Kirim Instruksi Reset',
      backToLogin: 'Kembali ke Login',
      checkEmail: 'Cek Email Anda',
      resetSent: 'Kami telah mengirim instruksi reset password',
      demoAccounts: 'Akun demo (password: apapun)',
    },
    course: {
      courses: 'Kursus',
      course: 'Kursus',
      lessons: 'pelajaran',
      lesson: 'pelajaran',
      modules: 'modul',
      duration: 'Durasi',
      students: 'siswa',
      reviews: 'ulasan',
      rating: 'Rating',
      level: 'Tingkat',
      beginner: 'Pemula',
      intermediate: 'Menengah',
      advanced: 'Ahli',
      type: 'Tipe',
      selfPaced: 'Belajar Mandiri',
      structured: 'Kelas Terstruktur',
      category: 'Kategori',
      instructor: 'Instruktur',
      whatYouLearn: 'Yang Akan Anda Pelajari',
      courseContent: 'Konten Kursus',
      prerequisites: 'Prasyarat',
      studentReviews: 'Ulasan Siswa',
      addToCart: 'Tambah ke Keranjang',
      buyNow: 'Beli Sekarang',
      viewCart: 'Lihat Keranjang',
      enrolled: 'Terdaftar',
      continueLeaning: 'Lanjutkan Belajar',
      startCourse: 'Mulai Kursus',
      progress: 'Progres',
      certificate: 'Sertifikat',
      includes: 'Kursus ini mencakup:',
      lifetimeAccess: 'Akses selamanya',
      completionCertificate: 'Sertifikat kelulusan',
    },
    dashboard: {
      welcome: 'Selamat datang kembali',
      continueLearning: 'Lanjutkan Belajar',
      upcomingDeadlines: 'Tenggat Waktu',
      recentAchievements: 'Pencapaian Terbaru',
      learningStats: 'Statistik Belajar',
      hoursLearned: 'Jam Belajar',
      certificates: 'Sertifikat',
      longestStreak: 'Streak Terpanjang',
      activeCourses: 'Kursus Aktif',
      completedCourses: 'Selesai',
      totalPoints: 'Total Poin',
      dayStreak: 'Hari Streak',
      daysLeft: 'hari lagi',
      noDeadlines: 'Tidak ada tenggat waktu yang mendekat',
      viewAllBadges: 'Lihat Semua Lencana',
      yourRank: 'Peringkat Anda',
      viewLeaderboard: 'Lihat Leaderboard',
      pointsToNext: 'poin lagi ke peringkat',
    },
    instructor: {
      instructorDashboard: 'Dashboard Instruktur',
      coursePerformance: 'Performa Kursus',
      totalCourses: 'Total Kursus',
      totalStudents: 'Total Siswa',
      monthlyEarnings: 'Pendapatan Bulan Ini',
      avgRating: 'Rating Rata-rata',
      pendingQuestions: 'pertanyaan menunggu jawaban',
      pendingSubmissions: 'tugas perlu dinilai',
      earningSummary: 'Ringkasan Pendapatan',
      totalEarnings: 'Total Pendapatan',
      thisMonth: 'Bulan Ini',
      availableWithdraw: 'Tersedia untuk Ditarik',
      withdraw: 'Tarik Dana',
      recentActivity: 'Aktivitas Terbaru',
      topStudents: 'Siswa Teraktif',
      revenue6Months: 'Pendapatan 6 Bulan Terakhir',
    },
    admin: {
      adminDashboard: 'Dashboard Admin',
      platformOverview: 'Pantau dan kelola platform MOLANG dari sini.',
      totalUsers: 'Total Pengguna',
      totalCourses: 'Total Kursus',
      totalRevenue: 'Pendapatan Total',
      revenueThisMonth: 'Pendapatan Bulan Ini',
      pendingVerifications: 'instruktur menunggu verifikasi',
      pendingCourseReviews: 'kursus perlu ditinjau',
      pendingPayouts: 'pembayaran menunggu',
      recentTransactions: 'Transaksi Terbaru',
      topCourses: 'Kursus Terlaris',
      instructorVerification: 'Verifikasi Instruktur',
      payoutSummary: 'Pembayaran Menunggu',
      platformStats: 'Statistik Platform',
      conversionRate: 'Tingkat Konversi',
      avgOrder: 'Rata-rata Order',
      platformCommission: 'Komisi Platform',
      refundRate: 'Tingkat Refund',
      processPayments: 'Proses Pembayaran',
      review: 'Tinjau',
    },
    gamification: {
      leaderboard: 'Leaderboard',
      badges: 'Lencana',
      myBadges: 'Lencana Saya',
      points: 'Poin',
      rank: 'Peringkat',
      streak: 'Streak',
      earnedBadges: 'Lencana yang Diraih',
      inProgressBadges: 'Sedang Dikerjakan',
      lockedBadges: 'Lencana Terkunci',
      earnPoints: 'Cara Mendapat Poin',
      completeLesson: 'Selesaikan Pelajaran',
      completeCourse: 'Selesaikan Kursus',
      quizPerfect: 'Dapatkan Nilai Quiz A',
      dailyStreak: 'Jaga Streak Harian',
      perLesson: 'poin per pelajaran',
      perCourse: 'poin per kursus',
      perQuiz: 'poin per quiz',
      perDay: 'poin per hari',
      fullRankings: 'Peringkat Lengkap',
    },
    cart: {
      shoppingCart: 'Keranjang Belanja',
      emptyCart: 'Keranjang Anda Kosong',
      emptyCartMessage: 'Jelajahi kursus-kursus menarik kami dan mulai belajar sekarang!',
      orderSummary: 'Ringkasan Pesanan',
      subtotal: 'Subtotal',
      discount: 'Diskon',
      total: 'Total',
      promoCode: 'Kode promo',
      checkout: 'Checkout',
      securePayment: 'Pembayaran aman dengan enkripsi SSL',
      clearCart: 'Kosongkan Keranjang',
      items: 'item',
    },
    footer: {
      explore: 'Jelajahi',
      allCourses: 'Semua Kursus',
      categories: 'Kategori',
      instructors: 'Instruktur',
      company: 'Perusahaan',
      aboutUs: 'Tentang Kami',
      careers: 'Karir',
      contactUs: 'Hubungi Kami',
      legal: 'Legal',
      refundPolicy: 'Kebijakan Refund',
      allRightsReserved: 'Hak cipta dilindungi.',
    },
    messages: {
      loginError: 'Email atau password salah',
      passwordMismatch: 'Password tidak cocok',
      agreeTermsRequired: 'Anda harus menyetujui syarat dan ketentuan',
      noCoursesFound: 'Tidak ada kursus ditemukan',
      courseNotFound: 'Kursus tidak ditemukan',
      noNotifications: 'Tidak ada notifikasi baru',
    },
  },
  en: {
    nav: {
      home: 'Home',
      exploreCourses: 'Explore Courses',
      dashboard: 'Dashboard',
      myCourses: 'My Courses',
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      profile: 'My Profile',
      settings: 'Settings',
      cart: 'Cart',
      notifications: 'Notifications',
      search: 'Search',
      searchPlaceholder: 'Search courses...',
    },
    common: {
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      viewAll: 'View All',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      continue: 'Continue',
      start: 'Start',
      completed: 'Completed',
      inProgress: 'In Progress',
      pending: 'Pending',
      all: 'All',
      filter: 'Filter',
      sort: 'Sort',
      clear: 'Clear',
      apply: 'Apply',
      yes: 'Yes',
      no: 'No',
      or: 'Or',
      and: 'and',
      free: 'Free',
      new: 'New',
      popular: 'Popular',
      featured: 'Featured',
    },
    auth: {
      welcomeBack: 'Welcome Back',
      loginSubtitle: 'Sign in to your account to continue learning',
      createAccount: 'Create New Account',
      registerSubtitle: 'Start your learning journey with us',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      fullName: 'Full Name',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot password?',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      registerAs: 'Register As',
      student: 'Student / Learner',
      instructor: 'Instructor / Teacher',
      agreeTerms: 'I agree to the',
      termsConditions: 'Terms & Conditions',
      privacyPolicy: 'Privacy Policy',
      sendResetLink: 'Send Reset Instructions',
      backToLogin: 'Back to Login',
      checkEmail: 'Check Your Email',
      resetSent: 'We have sent password reset instructions',
      demoAccounts: 'Demo accounts (password: anything)',
    },
    course: {
      courses: 'Courses',
      course: 'Course',
      lessons: 'lessons',
      lesson: 'lesson',
      modules: 'modules',
      duration: 'Duration',
      students: 'students',
      reviews: 'reviews',
      rating: 'Rating',
      level: 'Level',
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      type: 'Type',
      selfPaced: 'Self-Paced',
      structured: 'Structured Class',
      category: 'Category',
      instructor: 'Instructor',
      whatYouLearn: 'What You Will Learn',
      courseContent: 'Course Content',
      prerequisites: 'Prerequisites',
      studentReviews: 'Student Reviews',
      addToCart: 'Add to Cart',
      buyNow: 'Buy Now',
      viewCart: 'View Cart',
      enrolled: 'Enrolled',
      continueLeaning: 'Continue Learning',
      startCourse: 'Start Course',
      progress: 'Progress',
      certificate: 'Certificate',
      includes: 'This course includes:',
      lifetimeAccess: 'Lifetime access',
      completionCertificate: 'Certificate of completion',
    },
    dashboard: {
      welcome: 'Welcome back',
      continueLearning: 'Continue Learning',
      upcomingDeadlines: 'Upcoming Deadlines',
      recentAchievements: 'Recent Achievements',
      learningStats: 'Learning Statistics',
      hoursLearned: 'Hours Learned',
      certificates: 'Certificates',
      longestStreak: 'Longest Streak',
      activeCourses: 'Active Courses',
      completedCourses: 'Completed',
      totalPoints: 'Total Points',
      dayStreak: 'Day Streak',
      daysLeft: 'days left',
      noDeadlines: 'No upcoming deadlines',
      viewAllBadges: 'View All Badges',
      yourRank: 'Your Rank',
      viewLeaderboard: 'View Leaderboard',
      pointsToNext: 'points to rank',
    },
    instructor: {
      instructorDashboard: 'Instructor Dashboard',
      coursePerformance: 'Course Performance',
      totalCourses: 'Total Courses',
      totalStudents: 'Total Students',
      monthlyEarnings: 'Monthly Earnings',
      avgRating: 'Average Rating',
      pendingQuestions: 'questions awaiting answer',
      pendingSubmissions: 'submissions need grading',
      earningSummary: 'Earnings Summary',
      totalEarnings: 'Total Earnings',
      thisMonth: 'This Month',
      availableWithdraw: 'Available for Withdrawal',
      withdraw: 'Withdraw',
      recentActivity: 'Recent Activity',
      topStudents: 'Top Students',
      revenue6Months: 'Revenue Last 6 Months',
    },
    admin: {
      adminDashboard: 'Admin Dashboard',
      platformOverview: 'Monitor and manage the MOLANG platform from here.',
      totalUsers: 'Total Users',
      totalCourses: 'Total Courses',
      totalRevenue: 'Total Revenue',
      revenueThisMonth: 'Revenue This Month',
      pendingVerifications: 'instructors awaiting verification',
      pendingCourseReviews: 'courses need review',
      pendingPayouts: 'payments pending',
      recentTransactions: 'Recent Transactions',
      topCourses: 'Top Courses',
      instructorVerification: 'Instructor Verification',
      payoutSummary: 'Pending Payouts',
      platformStats: 'Platform Statistics',
      conversionRate: 'Conversion Rate',
      avgOrder: 'Average Order',
      platformCommission: 'Platform Commission',
      refundRate: 'Refund Rate',
      processPayments: 'Process Payments',
      review: 'Review',
    },
    gamification: {
      leaderboard: 'Leaderboard',
      badges: 'Badges',
      myBadges: 'My Badges',
      points: 'Points',
      rank: 'Rank',
      streak: 'Streak',
      earnedBadges: 'Earned Badges',
      inProgressBadges: 'In Progress',
      lockedBadges: 'Locked Badges',
      earnPoints: 'How to Earn Points',
      completeLesson: 'Complete a Lesson',
      completeCourse: 'Complete a Course',
      quizPerfect: 'Get Perfect Quiz Score',
      dailyStreak: 'Maintain Daily Streak',
      perLesson: 'points per lesson',
      perCourse: 'points per course',
      perQuiz: 'points per quiz',
      perDay: 'points per day',
      fullRankings: 'Full Rankings',
    },
    cart: {
      shoppingCart: 'Shopping Cart',
      emptyCart: 'Your Cart is Empty',
      emptyCartMessage: 'Explore our exciting courses and start learning today!',
      orderSummary: 'Order Summary',
      subtotal: 'Subtotal',
      discount: 'Discount',
      total: 'Total',
      promoCode: 'Promo code',
      checkout: 'Checkout',
      securePayment: 'Secure payment with SSL encryption',
      clearCart: 'Clear Cart',
      items: 'items',
    },
    footer: {
      explore: 'Explore',
      allCourses: 'All Courses',
      categories: 'Categories',
      instructors: 'Instructors',
      company: 'Company',
      aboutUs: 'About Us',
      careers: 'Careers',
      contactUs: 'Contact Us',
      legal: 'Legal',
      refundPolicy: 'Refund Policy',
      allRightsReserved: 'All rights reserved.',
    },
    messages: {
      loginError: 'Invalid email or password',
      passwordMismatch: 'Passwords do not match',
      agreeTermsRequired: 'You must agree to the terms and conditions',
      noCoursesFound: 'No courses found',
      courseNotFound: 'Course not found',
      noNotifications: 'No new notifications',
    },
  },
};
