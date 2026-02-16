import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import CreateCourseForm from "./_components/create-course-form";

export const metadata = {
  title: "Create Course - Share Your Knowledge",
  description: "Create and share your course with the community.",
};

export default async function CreateCoursePage() {
  const { isOnboarded } = await getUserOnboardingStatus();

  if (!isOnboarded) {
    redirect("/onboarding");
  }

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-6xl font-bold gradient-title">
          Create New Course
        </h1>
      </div>
      <CreateCourseForm />
    </div>
  );
}
