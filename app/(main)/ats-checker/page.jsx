import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import ATSCheckerView from "./_components/ats-checker-view";

export const metadata = {
  title: "ATS Checker - Check Your Resume Score",
  description: "Upload your resume and get AI-powered feedback to improve your ATS score and job application success.",
};

export default async function ATSCheckerPage() {
  const { isOnboarded } = await getUserOnboardingStatus();

  if (!isOnboarded) {
    redirect("/onboarding");
  }

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-6xl font-bold gradient-title">
          ATS Score Checker
        </h1>
      </div>
      <ATSCheckerView />
    </div>
  );
}
