
import { User } from "@/contexts/AuthContext";

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  instructor: User;
  price: number;
  duration: string;
  lessons: number;
  rating: number;
  reviews: number;
  enrolledStudents: number;
  image: string;
  mode: "self-paced" | "virtual" | "live";
  featured: boolean;
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  courses: number;
  icon: string;
}

export const generateMockCourses = (count = 10): Course[] => {
  const categories = [
    "Web Development",
    "Testing",
    "Cybersecurity",
    "DevOps",
    "UI/UX Design",
    "Mobile Development",
    "Data Science",
    "Cloud Computing",
    "Blockchain",
  ];
  
  const tags = [
    "programming",
    "coding",
    "javascript",
    "python",
    "react",
    "vue",
    "angular",
    "responsive",
    "frontend",
    "backend",
    "fullstack",
    "testing",
    "security",
    "devops",
    "cloud",
  ];
  
  const levels = ["beginner", "intermediate", "advanced"] as const;
  const modes = ["self-paced", "virtual", "live"] as const;
  
  // Placeholder images for courses
  const placeholderImages = [
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80", // tech/laptop
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80", // code screen
    "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80", // circuit board
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1172&q=80", // person with laptop
    "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80", // woman with laptop
  ];
  
  const randomTags = () => {
    const shuffled = [...tags].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.floor(Math.random() * 5) + 2);
  };
  
  return Array.from({ length: count }, (_, i) => {
    const id = `course-${i + 1}`;
    const category = categories[Math.floor(Math.random() * categories.length)];
    const level = levels[Math.floor(Math.random() * levels.length)];
    const mode = modes[Math.floor(Math.random() * modes.length)];
    const title = `${category} ${level.charAt(0).toUpperCase() + level.slice(1)}: Complete Guide`;
    const price = Math.floor(Math.random() * 30000) + 15000; // Price in NGN (15,000 - 45,000)
    const rating = (Math.random() * 2 + 3).toFixed(1); // Rating between 3.0 and 5.0
    const reviews = Math.floor(Math.random() * 500) + 10;
    const enrolledStudents = Math.floor(Math.random() * 2000) + 100;
    const lessons = Math.floor(Math.random() * 30) + 10;
    const duration = `${Math.floor(Math.random() * 20) + 5} hours`;
    const featured = Math.random() > 0.8; // 20% chance to be featured
    
    // Select a random placeholder image
    const image = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
    
    return {
      id,
      title,
      description: `Master ${category} with this comprehensive ${level} course. Learn practical skills that employers are looking for and build real-world projects for your portfolio.`,
      category,
      level,
      instructor: {
        id: `instructor-${i}`,
        name: `John Doe ${i}`,
        email: `instructor${i}@example.com`,
        role: "instructor",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=instructor${i}`,
      },
      price,
      duration,
      lessons,
      rating: parseFloat(rating),
      reviews,
      enrolledStudents,
      image,
      mode,
      featured,
      tags: randomTags(),
    };
  });
};

export const generateMockCategories = (): Category[] => {
  return [
    {
      id: "web-development",
      name: "Web Development",
      description: "Learn to build modern, responsive websites and web applications",
      courses: 24,
      icon: "code",
    },
    {
      id: "testing",
      name: "Testing",
      description: "Master software testing, QA, and test automation",
      courses: 18,
      icon: "clipboard-check",
    },
    {
      id: "cybersecurity",
      name: "Cybersecurity",
      description: "Protect systems and networks from digital attacks",
      courses: 15,
      icon: "shield",
    },
    {
      id: "devops",
      name: "DevOps",
      description: "Combine software development and IT operations",
      courses: 12,
      icon: "settings",
    },
    {
      id: "ui-ux",
      name: "UI/UX Design",
      description: "Create beautiful, intuitive user interfaces and experiences",
      courses: 10,
      icon: "pen",
    },
    {
      id: "mobile-dev",
      name: "Mobile Development",
      description: "Build native and cross-platform mobile applications",
      courses: 14,
      icon: "smartphone",
    },
    {
      id: "data-science",
      name: "Data Science",
      description: "Extract insights and knowledge from data",
      courses: 20,
      icon: "bar-chart",
    },
    {
      id: "cloud-computing",
      name: "Cloud Computing",
      description: "Master cloud platforms, services, and infrastructure",
      courses: 16,
      icon: "cloud",
    },
  ];
};

export const mockCourses = generateMockCourses(24);
export const mockCategories = generateMockCategories();

export const getFeaturedCourses = (): Course[] => {
  return mockCourses.filter((course) => course.featured);
};

export const getCoursesByCategory = (category: string): Course[] => {
  if (category === "all") return mockCourses;
  return mockCourses.filter((course) => course.category === category);
};

export const getCourseById = (id: string): Course | undefined => {
  return mockCourses.find((course) => course.id === id);
};

export const getCoursesByLevel = (level: string): Course[] => {
  if (level === "all") return mockCourses;
  return mockCourses.filter((course) => course.level === level);
};
