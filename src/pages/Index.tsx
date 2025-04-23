import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { getFeaturedCourses, mockCategories } from "@/utils/mockData";
import CourseCard from "@/components/CourseCard";
import { Link } from "react-router-dom";
import { Book, CheckCircle, GraduationCap, Pen, Users, Star } from "lucide-react";

const Index = () => {
  const featuredCourses = getFeaturedCourses().slice(0, 3);

  return (
    <Layout withPadding={false}>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-brand-800 to-brand-600 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Learn. Build. Transform Your Career.
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-100">
              Master in-demand tech skills, get mentored by industry experts, and launch your new career with Switch2Tech Academy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/courses">
                <Button size="lg" className="bg-white text-brand-700 hover:bg-gray-100">
                  Explore Courses
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Join Now
                </Button>
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap gap-6">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 mr-2 text-brand-300" />
                <span>Expert Instructors</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 mr-2 text-brand-300" />
                <span>Job-focused Training</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 mr-2 text-brand-300" />
                <span>Internship Opportunities</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Courses</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Explore our most popular courses designed to help you build practical skills and advance your career.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/courses">
              <Button variant="outline" className="border-brand-500 text-brand-600 hover:bg-brand-50">
                View All Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Explore By Categories</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Find the perfect course by exploring our diverse range of tech categories.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mockCategories.map((category) => (
              <div 
                key={category.id} 
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-brand-200"
              >
                <div className="h-12 w-12 rounded-lg bg-brand-100 flex items-center justify-center mb-4">
                  {category.icon === "code" && <Pen className="h-6 w-6 text-brand-600" />}
                  {category.icon === "clipboard-check" && <CheckCircle className="h-6 w-6 text-brand-600" />}
                  {category.icon === "shield" && <CheckCircle className="h-6 w-6 text-brand-600" />}
                  {category.icon === "settings" && <CheckCircle className="h-6 w-6 text-brand-600" />}
                  {category.icon === "pen" && <Pen className="h-6 w-6 text-brand-600" />}
                  {category.icon === "smartphone" && <Book className="h-6 w-6 text-brand-600" />}
                  {category.icon === "bar-chart" && <Book className="h-6 w-6 text-brand-600" />}
                  {category.icon === "cloud" && <Book className="h-6 w-6 text-brand-600" />}
                </div>
                <h3 className="text-lg font-medium mb-2">{category.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{category.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-brand-600">{category.courses} courses</span>
                  <Link to={`/courses?category=${category.id}`} className="text-sm text-brand-500 hover:text-brand-700">
                    View Courses →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How Switch2Tech Academy Works</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our unique approach combines learning, mentorship, and real-world experience to ensure your successful transition into tech.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 relative">
              <div className="h-16 w-16 rounded-full bg-brand-100 flex items-center justify-center mb-6 text-brand-700 font-bold text-xl">
                1
              </div>
              <h3 className="text-xl font-bold mb-4">Learn</h3>
              <p className="text-gray-600">
                Master in-demand tech skills through structured courses taught by industry experts. Choose from self-paced, virtual, or live classes.
              </p>
              <div className="mt-6 flex items-center">
                <Book className="h-5 w-5 text-brand-600 mr-2" />
                <span className="text-sm font-medium">Comprehensive Curriculum</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 relative">
              <div className="h-16 w-16 rounded-full bg-brand-100 flex items-center justify-center mb-6 text-brand-700 font-bold text-xl">
                2
              </div>
              <h3 className="text-xl font-bold mb-4">Build</h3>
              <p className="text-gray-600">
                Apply your knowledge by working on real projects. Build a portfolio that demonstrates your abilities to potential employers.
              </p>
              <div className="mt-6 flex items-center">
                <Pen className="h-5 w-5 text-brand-600 mr-2" />
                <span className="text-sm font-medium">Practical Projects</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 relative">
              <div className="h-16 w-16 rounded-full bg-brand-100 flex items-center justify-center mb-6 text-brand-700 font-bold text-xl">
                3
              </div>
              <h3 className="text-xl font-bold mb-4">Transform</h3>
              <p className="text-gray-600">
                Get mentored, join an internship program, earn recognized certifications, and successfully transition into your new tech career.
              </p>
              <div className="mt-6 flex items-center">
                <GraduationCap className="h-5 w-5 text-brand-600 mr-2" />
                <span className="text-sm font-medium">Career Transition</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Student Success Stories</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Hear from students who have successfully transformed their careers with Switch2Tech Academy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0">
                  <img 
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=testimonial1" 
                    alt="Sarah Johnson"
                    className="h-12 w-12 rounded-full"
                  />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium">Sarah Johnson</h4>
                  <p className="text-gray-500 text-sm">Frontend Developer at TechCorp</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Switch2Tech Academy helped me transition from a customer service role to a frontend developer in just 6 months. The curriculum was practical and the mentorship was invaluable."
              </p>
              <div className="flex items-center mt-6">
                <div className="flex">
                  {Array(5).fill(0).map((_, i) => (
                    <Star 
                      key={i}
                      className="h-5 w-5 text-yellow-500 fill-yellow-500"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0">
                  <img 
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=testimonial2" 
                    alt="Michael Adegoke"
                    className="h-12 w-12 rounded-full"
                  />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium">Michael Adegoke</h4>
                  <p className="text-gray-500 text-sm">QA Engineer at FinTech Ltd</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "The Testing & QA course was exactly what I needed to launch my tech career. The instructor was knowledgeable and the hands-on projects prepared me perfectly for my current role."
              </p>
              <div className="flex items-center mt-6">
                <div className="flex">
                  {Array(5).fill(0).map((_, i) => (
                    <Star 
                      key={i}
                      className={`h-5 w-5 ${i < 4 ? 'text-yellow-500 fill-yellow-500' : 'text-yellow-500'}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0">
                  <img 
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=testimonial3" 
                    alt="Amina Okafor"
                    className="h-12 w-12 rounded-full"
                  />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium">Amina Okafor</h4>
                  <p className="text-gray-500 text-sm">DevOps Engineer at CloudSystems</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "I went from being a complete beginner to landing a DevOps role at a top company. The internship connection program was the bridge I needed to get my foot in the door."
              </p>
              <div className="flex items-center mt-6">
                <div className="flex">
                  {Array(5).fill(0).map((_, i) => (
                    <Star 
                      key={i}
                      className="h-5 w-5 text-yellow-500 fill-yellow-500"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-brand-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="lg:w-0 lg:flex-1">
              <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Career?</h2>
              <p className="text-lg text-brand-100 mb-8 lg:mb-0 max-w-2xl">
                Join thousands of students who have successfully transitioned into tech careers through our structured learning path.
              </p>
            </div>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0 gap-4">
              <Link to="/courses">
                <Button size="lg" className="bg-white text-brand-700 hover:bg-gray-100">
                  Explore Courses
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Sign Up Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-brand-600">50+</p>
              <p className="mt-2 text-lg text-gray-600">Expert Instructors</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-brand-600">100+</p>
              <p className="mt-2 text-lg text-gray-600">Courses Available</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-brand-600">5,000+</p>
              <p className="mt-2 text-lg text-gray-600">Successful Students</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-brand-600">90%</p>
              <p className="mt-2 text-lg text-gray-600">Job Placement Rate</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
