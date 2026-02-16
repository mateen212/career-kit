import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import JobMatchesView from "./_components/job-matches-view";
import { getJobs, getMyApplications } from "@/actions/jobs";

export const metadata = {
  title: "Job Matches - Find Your Perfect Job",
  description: "AI-powered job recommendations tailored to your skills and preferences.",
};

export default async function JobMatchesPage() {
  const { isOnboarded } = await getUserOnboardingStatus();

  if (!isOnboarded) {
    redirect("/onboarding");
  }

  const jobs = await getJobs();
  const myApplications = await getMyApplications();

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-6xl font-bold gradient-title">
          Job Matches
        </h1>
      </div>
      <JobMatchesView jobs={jobs} myApplications={myApplications} />
    </div>
  );
}
