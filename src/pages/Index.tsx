
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import StatisticsSection from "@/components/home/StatisticsSection";
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
        <FeaturesSection />
        <StatisticsSection />
        <FeaturedCoursesSection />
        <ExploreCategoriesSection />
        <StudentSuccessStoriesSection />
        <HowSwitchToTechWorksSection />
      </div>
    </Layout>
  );
};

export default Index;
