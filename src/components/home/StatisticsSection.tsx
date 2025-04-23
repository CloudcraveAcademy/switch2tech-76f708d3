
import { Card, CardContent } from "@/components/ui/card";
import { Book, Users, Award, Circle } from "lucide-react";

const stats = [
  {
    icon: <Book className="h-6 w-6 text-blue-600" />,
    value: "50+",
    label: "Courses",
    bgColor: "bg-blue-100"
  },
  {
    icon: <Users className="h-6 w-6 text-green-600" />,
    value: "1,000+",
    label: "Students",
    bgColor: "bg-green-100"
  },
  {
    icon: <Award className="h-6 w-6 text-purple-600" />,
    value: "30+",
    label: "Expert Instructors",
    bgColor: "bg-purple-100"
  },
  {
    icon: <Circle className="h-6 w-6 text-yellow-600" />,
    value: "95%",
    label: "Success Rate",
    bgColor: "bg-yellow-100"
  }
];

const StatisticsSection = () => {
  return (
    <div className="py-24">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Our Impact in Numbers</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className={`h-12 w-12 rounded-full ${stat.bgColor} mx-auto flex items-center justify-center mb-4`}>
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatisticsSection;
