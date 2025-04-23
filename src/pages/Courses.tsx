
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import CourseCard from "@/components/CourseCard";
import { mockCourses, mockCategories } from "@/utils/mockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useLocation } from "react-router-dom";

const Courses = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryFromURL = queryParams.get("category");
  
  const [courses, setCourses] = useState(mockCourses);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categoryFromURL || "all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedMode, setSelectedMode] = useState("all");

  useEffect(() => {
    // Filter courses based on selected filters and search term
    let filteredCourses = [...mockCourses];

    // Apply search term filter
    if (searchTerm) {
      filteredCourses = filteredCourses.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filteredCourses = filteredCourses.filter(
        (course) => course.category === mockCategories.find(cat => cat.id === selectedCategory)?.name
      );
    }

    // Apply level filter
    if (selectedLevel !== "all") {
      filteredCourses = filteredCourses.filter(
        (course) => course.level === selectedLevel
      );
    }

    // Apply mode filter
    if (selectedMode !== "all") {
      filteredCourses = filteredCourses.filter(
        (course) => course.mode === selectedMode
      );
    }

    setCourses(filteredCourses);
  }, [searchTerm, selectedCategory, selectedLevel, selectedMode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The filtering is already handled by the useEffect
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Explore Our Courses</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Find the perfect course to advance your tech skills and transform your career.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-12">
          <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4"
                />
              </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {mockCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Type</label>
                <Select value={selectedMode} onValueChange={setSelectedMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Course Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="self-paced">Self-paced</SelectItem>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6">
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium">{courses.length}</span> results
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedLevel("all");
                  setSelectedMode("all");
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Course Grid */}
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-medium mb-2">No courses found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search term</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSelectedLevel("all");
                setSelectedMode("all");
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}

        {/* Pagination - simplified for demo */}
        {courses.length > 0 && (
          <div className="mt-12 flex justify-center">
            <div className="flex items-center space-x-2">
              <Button variant="outline" disabled>Previous</Button>
              <Button variant="outline" className="bg-brand-100 text-brand-600">1</Button>
              <Button variant="outline">2</Button>
              <Button variant="outline">3</Button>
              <Button variant="outline">Next</Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Courses;
