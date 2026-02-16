import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import CourseRecommendationsView from "./_components/course-recommendations-view";
import { getCourses } from "@/actions/courses";

export const metadata = {
  title: "Course Recommendations - Enhance Your Skills",
  description: "Get AI-powered course recommendations tailored to your career goals and skill gaps.",
};

export default async function CourseRecommendationsPage() {
  const { isOnboarded } = await getUserOnboardingStatus();

  if (!isOnboarded) {
    redirect("/onboarding");
  }

  // Fetch all active courses
  const courses = await getCourses();

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-6xl font-bold gradient-title">
          Course Recommendations
        </h1>
      </div>
      <CourseRecommendationsView courses={courses} />
    </div>
  );
}
