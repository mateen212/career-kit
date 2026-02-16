import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import { getCourseEnrollmentsForApproval, getUserCreatedCourses } from "@/actions/courses";
import CourseAdminView from "./_components/course-admin-view";

export const metadata = {
  title: "Course Admin - Manage Enrollments",
  description: "Manage your course enrollments and approve student requests.",
};

export default async function CourseAdminPage() {
  const { isOnboarded } = await getUserOnboardingStatus();

  if (!isOnboarded) {
    redirect("/onboarding");
  }

  const enrollments = await getCourseEnrollmentsForApproval();
  const courses = await getUserCreatedCourses();

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-6xl font-bold gradient-title">
          Course Admin
        </h1>
      </div>
      <CourseAdminView enrollments={enrollments} courses={courses} />
    </div>
  );
}
