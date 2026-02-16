import { getCourse, getUserEnrollmentStatus } from "@/actions/courses";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import CourseDetailView from "./_components/course-detail-view";

export default async function CourseDetailPage({ params }) {
  const { isOnboarded } = await getUserOnboardingStatus();

  if (!isOnboarded) {
    redirect("/onboarding");
  }

  const { id } = await params;
  const course = await getCourse(id);
  const enrollmentStatus = await getUserEnrollmentStatus(id);

  if (!course) {
    redirect("/course-recommendations");
  }

  return (
    <div className="container mx-auto">
      <CourseDetailView course={course} enrollmentStatus={enrollmentStatus} />
    </div>
  );
}
