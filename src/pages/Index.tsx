
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import Layout from "@/components/Layout";
import FeaturedCoursesSection from "@/components/home/FeaturedCoursesSection";
import ExploreCategoriesSection from "@/components/home/ExploreCategoriesSection";
import StudentSuccessStoriesSection from "@/components/home/StudentSuccessStoriesSection";
import HowSwitchToTechWorksSection from "@/components/home/HowSwitchToTechWorksSection";

const Index = () => {
  return (
    <Layout>
      <div className="min-h-screen">
        <HeroSection />
        <FeaturedCoursesSection />
        <FeaturesSection />
        <ExploreCategoriesSection />
        <StudentSuccessStoriesSection />
        <HowSwitchToTechWorksSection />
      </div>
    </Layout>
  );
};

export default Index;
