
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
// Using dynamic Course interface that matches Supabase structure
interface Course {
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
  image: string;
  mode: "self-paced" | "virtual" | "live";
  enrolledStudents: number;
  lessons: number;
  category: string;
  featured: boolean;
}
import { Book, Star, Users } from "lucide-react";
import { useCourseRating } from "@/hooks/useCourseRating";

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const {
    id,
    title,
    instructor,
    price,
    discounted_price,
    level,
    image,
    mode,
    enrolledStudents,
    lessons,
    category,
    featured,
  } = course;

  // Get dynamic rating data
  const { data: ratingData } = useCourseRating(id);

  const levelColor = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800",
    advanced: "bg-red-100 text-red-800",
  }[level];

  const modeColor = {
    "self-paced": "bg-blue-100 text-blue-800",
    "virtual": "bg-purple-100 text-purple-800",
    "live": "bg-pink-100 text-pink-800",
  }[mode];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getDisplayPrice = () => {
    if (discounted_price !== undefined && discounted_price !== null && discounted_price > 0) {
      return discounted_price;
    }
    return price;
  };

  const getOriginalPrice = () => {
    return price;
  };

  const hasDiscount = () => {
    return discounted_price !== undefined && 
           discounted_price !== null &&
           discounted_price > 0 &&
           discounted_price < price;
  };

  return (
    <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-lg flex flex-col">
      <div className="relative">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-48 object-cover"
        />
        {featured && (
          <div className="absolute top-0 right-0 m-2">
            <Badge className="bg-brand-500 text-white">Featured</Badge>
          </div>
        )}
        {hasDiscount() && (
          <div className="absolute top-0 left-0 m-2">
            <Badge className="bg-red-500 text-white">
              {Math.round(((getOriginalPrice() - getDisplayPrice()) / getOriginalPrice()) * 100)}% OFF
            </Badge>
          </div>
        )}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-3">
          <Badge className={`${levelColor} mb-1 mr-1`}>{level}</Badge>
          <Badge className={`${modeColor} mb-1`}>
            {mode === "self-paced" ? "Self-paced" : mode === "virtual" ? "Virtual" : "Live"}
          </Badge>
        </div>
      </div>

      <CardContent className="flex-grow p-5">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className="bg-gray-100 text-gray-700 font-normal">
            {category}
          </Badge>
          {ratingData && ratingData.total_ratings > 0 ? (
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium ml-1">{ratingData.average_rating.toFixed(1)}</span>
              <span className="text-xs text-gray-500 ml-1">({ratingData.total_ratings})</span>
            </div>
          ) : (
            <div className="flex items-center">
              <Star className="w-4 h-4 text-gray-300" />
              <span className="text-xs text-gray-500 ml-1">No ratings yet</span>
            </div>
          )}
        </div>

        <Link to={`/courses/${id}`} className="hover:text-brand-600">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{title}</h3>
        </Link>

        <div className="flex items-center mt-2 text-sm text-gray-600">
          <Book className="w-4 h-4 mr-1" />
          <span>{lessons} lessons</span>
          <Users className="w-4 h-4 ml-3 mr-1" />
          <span>{enrolledStudents} students</span>
        </div>

        <div className="flex items-center mt-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src={instructor.avatar} />
            <AvatarFallback>{instructor.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <span className="ml-2 text-sm font-medium">{instructor.name}</span>
        </div>
      </CardContent>

      <CardFooter className="border-t p-5 flex items-center justify-between">
        <div className="flex flex-col">
          {hasDiscount() ? (
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl text-brand-600">{formatPrice(getDisplayPrice())}</span>
              <span className="text-sm line-through text-gray-500">{formatPrice(getOriginalPrice())}</span>
            </div>
          ) : (
            <span className="font-bold text-xl text-brand-600">{formatPrice(getDisplayPrice())}</span>
          )}
        </div>
        <Link 
          to={`/courses/${id}`}
          className="px-4 py-2 rounded-md bg-brand-500 text-white hover:bg-brand-600 transition-colors text-sm font-medium"
        >
          View Course
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
