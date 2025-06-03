import { UserWithProfile, UserRole } from "@/contexts/AuthContext";

// Define Course type
export interface Course {
  id: string;
  title: string;
  instructor: {
    id?: string;
    name: string;
    avatar: string;
  };
  price: number;
  discounted_price?: number;
  level: "beginner" | "intermediate" | "advanced";
  rating: number;
  reviews: number;
  image: string;
  mode: "self-paced" | "virtual" | "live";
  enrolledStudents: number;
  lessons: number;
  category: string;
  featured: boolean;
  tags: string[];
  duration: string;
}

// Define Category type
export interface Category {
  id: string;
  name: string;
  icon?: string;
  count?: number;
}

// Mock user data
export const mockUsers: UserWithProfile[] = [
  {
    id: "1",
    email: "john.doe@example.com",
    email_confirmed_at: new Date().toISOString(),
    phone: "123-456-7890",
    phone_confirmed_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    role: "student" as UserRole,
    name: "John Doe",
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: "2",
    email: "jane.smith@example.com",
    email_confirmed_at: new Date().toISOString(),
    phone: "098-765-4321",
    phone_confirmed_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    role: "instructor" as UserRole,
    name: "Jane Smith",
    avatar: "https://i.pravatar.cc/150?img=2",
  },
  {
    id: "3",
    email: "admin@example.com",
    email_confirmed_at: new Date().toISOString(),
    phone: "111-222-3333",
    phone_confirmed_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    role: "admin" as UserRole,
    name: "Admin User",
    avatar: "https://i.pravatar.cc/150?img=3",
  },
  {
    id: "4",
    email: "superadmin@example.com",
    email_confirmed_at: new Date().toISOString(),
    phone: "444-555-6666",
    phone_confirmed_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    role: "super_admin" as UserRole,
    name: "Super Admin",
    avatar: "https://i.pravatar.cc/150?img=4",
  },
];

// Mock categories
export const mockCategories: Category[] = [
  { id: "web-dev", name: "Web Development", count: 45 },
  { id: "mobile-dev", name: "Mobile Development", count: 32 },
  { id: "data-science", name: "Data Science", count: 28 },
  { id: "ui-ux", name: "UI/UX Design", count: 24 },
  { id: "cloud", name: "Cloud Computing", count: 20 },
  { id: "devops", name: "DevOps", count: 18 },
  { id: "cyber", name: "Cybersecurity", count: 16 },
  { id: "ai-ml", name: "AI & Machine Learning", count: 14 },
];

// Mock courses data
export const mockCourses: Course[] = [
  {
    id: "1",
    title: "Complete Web Development Bootcamp",
    instructor: {
      name: "Jane Smith",
      avatar: "https://i.pravatar.cc/150?img=2",
    },
    price: 59900,
    discounted_price: 39900,
    level: "beginner",
    rating: 4.8,
    reviews: 1245,
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    mode: "self-paced",
    enrolledStudents: 12543,
    lessons: 124,
    category: "Web Development",
    featured: true,
    tags: ["HTML", "CSS", "JavaScript", "React", "Node.js"],
    duration: "42 hours"
  },
  {
    id: "2",
    title: "Advanced React and Redux",
    instructor: {
      name: "Alex Johnson",
      avatar: "https://i.pravatar.cc/150?img=8",
    },
    price: 49900,
    level: "intermediate",
    rating: 4.7,
    reviews: 892,
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee",
    mode: "virtual",
    enrolledStudents: 8742,
    lessons: 87,
    category: "Web Development",
    featured: true,
    tags: ["React", "Redux", "JavaScript", "Web Development"],
    duration: "38 hours"
  },
  {
    id: "3",
    title: "Python for Data Science and Machine Learning",
    instructor: {
      name: "Sarah Chen",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
    price: 69900,
    discounted_price: 49900,
    level: "intermediate",
    rating: 4.9,
    reviews: 1567,
    image: "https://images.unsplash.com/photo-1542903660-eedba2cda473",
    mode: "self-paced",
    enrolledStudents: 15632,
    lessons: 132,
    category: "Data Science",
    featured: true,
    tags: ["Python", "Data Science", "Machine Learning", "NumPy", "Pandas"],
    duration: "56 hours"
  },
  {
    id: "4",
    title: "Flutter & Firebase: Mobile App Development",
    instructor: {
      name: "Mike Peters",
      avatar: "https://i.pravatar.cc/150?img=9",
    },
    price: 54900,
    level: "intermediate",
    rating: 4.6,
    reviews: 723,
    image: "https://images.unsplash.com/photo-1618761714954-0b8cd0026356",
    mode: "live",
    enrolledStudents: 5423,
    lessons: 94,
    category: "Mobile Development",
    featured: false,
    tags: ["Flutter", "Firebase", "Dart", "Mobile", "iOS", "Android"],
    duration: "45 hours"
  },
  {
    id: "5",
    title: "UI/UX Design Principles",
    instructor: {
      name: "Lisa Wang",
      avatar: "https://i.pravatar.cc/150?img=4",
    },
    price: 39900,
    level: "beginner",
    rating: 4.5,
    reviews: 512,
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5",
    mode: "self-paced",
    enrolledStudents: 4231,
    lessons: 78,
    category: "UI/UX Design",
    featured: false,
    tags: ["UI", "UX", "Figma", "Design", "Prototyping"],
    duration: "32 hours"
  },
  {
    id: "6",
    title: "DevOps Engineering & CI/CD",
    instructor: {
      name: "David Kumar",
      avatar: "https://i.pravatar.cc/150?img=12",
    },
    price: 64900,
    discounted_price: 44900,
    level: "advanced",
    rating: 4.7,
    reviews: 324,
    image: "https://images.unsplash.com/photo-1537884944318-390069bb8665",
    mode: "virtual",
    enrolledStudents: 2187,
    lessons: 105,
    category: "DevOps",
    featured: false,
    tags: ["DevOps", "CI/CD", "Docker", "Kubernetes", "Jenkins"],
    duration: "48 hours"
  }
];

// Helper functions to get course data
export const getFeaturedCourses = () => {
  return mockCourses.filter(course => course.featured);
};

export const getCourseById = (id: string) => {
  return mockCourses.find(course => course.id === id);
};
