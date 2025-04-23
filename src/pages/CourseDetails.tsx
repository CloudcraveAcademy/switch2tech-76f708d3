
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { getCourseById } from "@/utils/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle, Clock, File, Play, Star, Users, Video } from "lucide-react";

const CourseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const course = getCourseById(id as string);
  const [selectedTab, setSelectedTab] = useState("overview");

  if (!course) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Course not found</h1>
          <p className="mb-8">The course you're looking for doesn't exist or has been removed.</p>
          <Link to="/courses">
            <Button>Back to Courses</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', { 
      style: 'currency', 
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const levelColor = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800",
    advanced: "bg-red-100 text-red-800",
  }[course.level];

  const modeColor = {
    "self-paced": "bg-blue-100 text-blue-800",
    "virtual": "bg-purple-100 text-purple-800",
    "live": "bg-pink-100 text-pink-800",
  }[course.mode];

  const curriculum = [
    {
      id: "section-1",
      title: "Getting Started",
      lessons: [
        { id: "lesson-1", title: "Introduction to the Course", duration: "10:00", type: "video" },
        { id: "lesson-2", title: "Setting up Your Environment", duration: "15:30", type: "video" },
        { id: "lesson-3", title: "Course Resources", duration: "5:15", type: "document" },
      ]
    },
    {
      id: "section-2",
      title: "Core Concepts",
      lessons: [
        { id: "lesson-4", title: "Understanding the Basics", duration: "20:45", type: "video" },
        { id: "lesson-5", title: "Key Terminology", duration: "18:20", type: "video" },
        { id: "lesson-6", title: "Practice Exercise", duration: "30:00", type: "exercise" },
        { id: "lesson-7", title: "Review and Quiz", duration: "15:00", type: "quiz" },
      ]
    },
    {
      id: "section-3",
      title: "Advanced Techniques",
      lessons: [
        { id: "lesson-8", title: "Deep Dive into Advanced Topics", duration: "25:10", type: "video" },
        { id: "lesson-9", title: "Case Study", duration: "22:30", type: "video" },
        { id: "lesson-10", title: "Hands-on Lab", duration: "45:00", type: "exercise" },
      ]
    },
    {
      id: "section-4",
      title: "Real-world Applications",
      lessons: [
        { id: "lesson-11", title: "Industry Examples", duration: "18:20", type: "video" },
        { id: "lesson-12", title: "Final Project", duration: "60:00", type: "project" },
        { id: "lesson-13", title: "Conclusion and Next Steps", duration: "10:45", type: "video" },
      ]
    }
  ];

  const requirements = [
    "Basic knowledge of computer operations",
    course.level !== "beginner" ? "Prior programming experience" : "No prior programming experience needed",
    "A computer with internet access",
    "Willingness to learn and practice",
  ];

  return (
    <Layout>
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
              <Badge className="mb-4">{course.category}</Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
              
              <p className="text-lg text-gray-700 mb-6">
                {course.description}
              </p>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <Badge className={levelColor}>{course.level}</Badge>
                <Badge className={modeColor}>
                  {course.mode === "self-paced" ? "Self-paced" : course.mode === "virtual" ? "Virtual" : "Live"}
                </Badge>
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="ml-1 font-medium">{course.rating}</span>
                  <span className="text-gray-500 ml-1">({course.reviews} reviews)</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <Users className="w-5 h-5 mr-1" />
                  <span>{course.enrolledStudents} students</span>
                </div>
              </div>
              
              <div className="flex items-center mb-8">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={course.instructor.avatar} />
                  <AvatarFallback>{course.instructor.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="font-medium">{course.instructor.name}</p>
                  <p className="text-sm text-gray-500">Course Instructor</p>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/3">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="relative mb-6 rounded-lg overflow-hidden">
                  <img 
                    src={course.image} 
                    alt={course.title} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <button className="bg-white bg-opacity-90 rounded-full p-4">
                      <Play className="h-8 w-8 text-brand-600" />
                    </button>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-3xl font-bold text-brand-600 mb-4">
                    {formatPrice(course.price)}
                  </p>
                  
                  <Button className="w-full mb-4">Enroll Now</Button>
                  
                  <Button variant="outline" className="w-full">Add to Wishlist</Button>
                </div>
                
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center">
                      <Clock className="h-5 w-5 mr-2" /> Course Duration
                    </span>
                    <span className="font-medium">{course.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center">
                      <Video className="h-5 w-5 mr-2" /> Total Lessons
                    </span>
                    <span className="font-medium">{course.lessons}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center">
                      <File className="h-5 w-5 mr-2" /> Certificate
                    </span>
                    <span className="font-medium">Yes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="instructor">Instructor</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Course Description</h3>
              <p className="text-gray-700">
                {course.description} This comprehensive course is designed to give you hands-on experience and practical skills 
                that you can immediately apply to real-world projects. Whether you're a beginner looking to enter the tech industry 
                or a professional wanting to upgrade your skills, this course is tailored to help you achieve your goals.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">What You'll Learn</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      {i === 0 && "Master the core concepts and principles"}
                      {i === 1 && "Build real-world projects from scratch"}
                      {i === 2 && "Learn best practices and industry standards"}
                      {i === 3 && "Troubleshoot common issues effectively"}
                      {i === 4 && "Apply advanced techniques to solve complex problems"}
                      {i === 5 && "Prepare for certification and job interviews"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Requirements</h3>
              <ul className="list-disc pl-5 space-y-2">
                {requirements.map((req, i) => (
                  <li key={i} className="text-gray-700">{req}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Who This Course is For</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li className="text-gray-700">
                  {course.level === "beginner" 
                    ? "Complete beginners with no prior experience" 
                    : "Individuals with some background knowledge seeking to advance their skills"}
                </li>
                <li className="text-gray-700">Professionals looking to transition into a tech career</li>
                <li className="text-gray-700">Students who want to supplement their academic learning with practical skills</li>
                <li className="text-gray-700">Tech enthusiasts who want to expand their knowledge base</li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="curriculum">
            <div>
              <h3 className="text-xl font-bold mb-4">Course Content</h3>
              <div className="mb-4 flex flex-wrap gap-3 text-sm text-gray-600">
                <div>{curriculum.reduce((acc, section) => acc + section.lessons.length, 0)} lessons</div>
                <div>•</div>
                <div>{course.duration} total length</div>
                <div>•</div>
                <div>{curriculum.length} sections</div>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                {curriculum.map((section, idx) => (
                  <AccordionItem key={section.id} value={section.id}>
                    <AccordionTrigger className="hover:bg-gray-50 px-4">
                      <div className="flex justify-between w-full pr-4">
                        <div className="font-medium">
                          Section {idx + 1}: {section.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {section.lessons.length} lessons
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 px-4">
                        {section.lessons.map((lesson) => (
                          <div 
                            key={lesson.id} 
                            className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-md"
                          >
                            <div className="flex items-center">
                              {lesson.type === "video" && <Play className="h-4 w-4 text-brand-600 mr-3" />}
                              {lesson.type === "document" && <File className="h-4 w-4 text-blue-600 mr-3" />}
                              {lesson.type === "exercise" && <CheckCircle className="h-4 w-4 text-green-600 mr-3" />}
                              {lesson.type === "quiz" && <CheckCircle className="h-4 w-4 text-yellow-600 mr-3" />}
                              {lesson.type === "project" && <CheckCircle className="h-4 w-4 text-purple-600 mr-3" />}
                              <span>{lesson.title}</span>
                              {lesson.type === "quiz" && (
                                <Badge className="ml-2 bg-yellow-100 text-yellow-800">Quiz</Badge>
                              )}
                              {lesson.type === "exercise" && (
                                <Badge className="ml-2 bg-green-100 text-green-800">Exercise</Badge>
                              )}
                              {lesson.type === "project" && (
                                <Badge className="ml-2 bg-purple-100 text-purple-800">Project</Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {lesson.duration}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </TabsContent>
          
          <TabsContent value="instructor">
            <div className="space-y-6">
              <div className="flex items-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={course.instructor.avatar} />
                  <AvatarFallback>{course.instructor.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="ml-6">
                  <h3 className="text-2xl font-bold">{course.instructor.name}</h3>
                  <p className="text-gray-600">Senior {course.category} Expert</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-bold text-xl">{Math.floor(Math.random() * 50) + 5}</p>
                  <p className="text-gray-600">Courses</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-bold text-xl">{Math.floor(Math.random() * 10000) + 1000}</p>
                  <p className="text-gray-600">Students</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-bold text-xl">{(Math.random() * 1 + 4).toFixed(1)}</p>
                  <p className="text-gray-600">Average Rating</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-xl font-bold mb-3">About the Instructor</h4>
                <p className="text-gray-700 mb-4">
                  With over 10 years of industry experience, {course.instructor.name} is a renowned expert in {course.category}.
                  They have worked with leading companies in the field and bring real-world insights into their teaching.
                </p>
                <p className="text-gray-700">
                  Their teaching methodology focuses on practical skills development, ensuring students gain not just theoretical
                  knowledge but also the ability to apply concepts to real-world scenarios. Many of their former students are now
                  working at top tech companies around the world.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews">
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3 bg-gray-50 p-6 rounded-lg text-center">
                  <p className="text-5xl font-bold text-brand-600 mb-2">{course.rating}</p>
                  <div className="flex justify-center mb-2">
                    {Array(5).fill(0).map((_, i) => (
                      <Star 
                        key={i}
                        className={`h-5 w-5 ${i < Math.floor(course.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-600">{course.reviews} reviews</p>
                  
                  <div className="mt-6 space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const percentage = star === 5 ? 70 :
                                        star === 4 ? 20 :
                                        star === 3 ? 7 :
                                        star === 2 ? 2 : 1;
                      return (
                        <div key={star} className="flex items-center">
                          <span className="text-sm mr-2">{star}</span>
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-2" />
                          <Progress value={percentage} className="h-2 flex-grow" />
                          <span className="text-sm ml-2">{percentage}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="md:w-2/3 space-y-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border-b pb-6 last:border-0">
                      <div className="flex justify-between mb-2">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=review${i}`} />
                            <AvatarFallback>U{i}</AvatarFallback>
                          </Avatar>
                          <div className="ml-4">
                            <p className="font-medium">
                              {i === 0 ? "Michael O." : i === 1 ? "Sarah J." : "David T."}
                            </p>
                            <p className="text-xs text-gray-500">
                              {i === 0 ? "2 weeks ago" : i === 1 ? "1 month ago" : "3 months ago"}
                            </p>
                          </div>
                        </div>
                        <div className="flex">
                          {Array(5).fill(0).map((_, j) => (
                            <Star 
                              key={j}
                              className={`h-4 w-4 ${j < (i === 0 ? 5 : i === 1 ? 4 : 5) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700">
                        {i === 0 ? 
                          "This course exceeded my expectations. The instructor explains complex concepts in a simple way, and the practical exercises helped me apply what I learned. Highly recommended!" :
                        i === 1 ?
                          "Great course for anyone looking to advance in this field. The content is well-structured and the instructor is knowledgeable. I would have liked more practice exercises though." :
                          "Excellent course that helped me transition into a new role. The real-world projects were especially valuable and gave me portfolio pieces to show potential employers."
                        }
                      </p>
                    </div>
                  ))}
                  
                  <div className="text-center mt-4">
                    <Button variant="outline">Load More Reviews</Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-16 bg-gray-50 rounded-lg p-8 border border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Ready to start learning?</h3>
              <p className="text-gray-600 mb-4 md:mb-0">Enroll now to get access to all course materials and instructor support.</p>
            </div>
            <div className="flex gap-4">
              <Button size="lg">Enroll Now</Button>
              <Button variant="outline" size="lg">View Similar Courses</Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CourseDetails;
