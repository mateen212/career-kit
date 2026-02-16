import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import RecruiterToolsView from "./_components/recruiter-tools-view";
import { getMyPostedJobs } from "@/actions/jobs";

export const metadata = {
  title: "Recruiter Tools - Find Top Talent",
  description: "AI-powered tools for recruiters to filter and shortlist the best candidates efficiently.",
};

export default async function RecruiterToolsPage() {
  const { isOnboarded } = await getUserOnboardingStatus();

  if (!isOnboarded) {
    redirect("/onboarding");
  }

  const postedJobs = await getMyPostedJobs();

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-6xl font-bold gradient-title">
          Recruiter Tools
        </h1>
      </div>
      <RecruiterToolsView postedJobs={postedJobs} />
    </div>
  );
}
