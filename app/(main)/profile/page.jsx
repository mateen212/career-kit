import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import { industries } from "@/data/industries";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import ProfileEditForm from "./_components/profile-edit-form";

export const metadata = {
  title: "Profile Settings - Update Your Information",
  description: "Update your profile information and career preferences.",
};

export default async function ProfilePage() {
  const { isOnboarded } = await getUserOnboardingStatus();

  if (!isOnboarded) {
    redirect("/onboarding");
  }

  const { userId } = await auth();
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      industry: true,
      experience: true,
      bio: true,
      skills: true,
      name: true,
      email: true,
    },
  });

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-6xl font-bold gradient-title">
          Profile Settings
        </h1>
      </div>
      <ProfileEditForm industries={industries} currentUser={user} />
    </div>
  );
}
