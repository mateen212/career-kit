"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Fetch user using Clerk ID
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found in DB");

  try {
    // Start a transaction to handle both operations: user update and industry insight creation
    const result = await db.$transaction(
      async (tx) => {
        // First check if industry insight exists
        let industryInsight = await tx.industryInsight.findUnique({
          where: {
            industry: data.industry,
          },
        });

        // If industry doesn't exist, generate insights and create it
        if (!industryInsight) {
          // Note: generateAIInsights is NOT a DB operation, so it can use the global client if needed,
          // but calling it outside tx is safer or ensuring it handles the AI call cleanly.
          const insights = await generateAIInsights(data.industry);

          // FIX: Use the transaction client (tx) for the create operation
          industryInsight = await tx.industryInsight.create({
            data: {
              industry: data.industry,
              ...insights,
              // Calculate next update time (7 days from now)
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        }

        // Now update the user
        const updatedUser = await tx.user.update({
          where: {
            id: user.id, // Use the internal database ID
          },
          data: {
            industry: data.industry,
            experience: data.experience,
            bio: data.bio,
            skills: data.skills,
          },
        });

        // The transaction successfully commits here
        return { updatedUser, industryInsight };
      },
      {
        timeout: 25000, // Increased timeout to 25s for AI generation
      }
    );

    revalidatePath("/");
    // FIX: Return the correct field name (updatedUser) from the result object
    return result.updatedUser; 
  } catch (error) {
    console.error("Error updating user and industry:", error.message);
    // Re-throw the specific error message to the client
    throw new Error("Failed to update profile"); 
  }
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Fetch user using Clerk ID
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
      select: {
        industry: true,
      },
    });

    return {
      // Check if industry field exists to determine onboarding status
      isOnboarded: !!user?.industry, 
    };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    throw new Error("Failed to check onboarding status");
  }
}