import { getIndustryInsights } from "@/actions/dashboard";
import IndustryInsightsView from "./_components/industry-insights-view";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Industry Insights - Know the Trends",
  description: "Stay updated with salary insights, market trends, and industry analysis.",
};

export default async function IndustryInsightsPage() {
  const { isOnboarded } = await getUserOnboardingStatus();

  // If not onboarded, redirect to onboarding page
  if (!isOnboarded) {
    redirect("/onboarding");
  }

  const insights = await getIndustryInsights();

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-6xl font-bold gradient-title">
          Industry Insights
        </h1>
      </div>
      <IndustryInsightsView insights={insights} />
    </div>
  );
}
