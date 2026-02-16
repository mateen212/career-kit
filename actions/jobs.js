"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Get all active jobs
export async function getJobs() {
  try {
    const jobs = await db.job.findMany({
      where: { status: "active" },
      include: {
        poster: {
          select: {
            name: true,
            email: true,
          },
        },
        applications: {
          select: {
            id: true,
            applicantId: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return jobs;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw new Error("Failed to fetch jobs");
  }
}

// Get jobs posted by current user (for recruiters)
export async function getMyPostedJobs() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const jobs = await db.job.findMany({
      where: { posterId: user.id },
      include: {
        applications: {
          include: {
            applicant: {
              select: {
                name: true,
                email: true,
                skills: true,
                experience: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return jobs;
  } catch (error) {
    console.error("Error fetching posted jobs:", error);
    throw new Error("Failed to fetch posted jobs");
  }
}

// Create a new job posting
export async function createJob(jobData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const job = await db.job.create({
      data: {
        posterId: user.id,
        ...jobData,
      },
    });

    return job;
  } catch (error) {
    console.error("Error creating job:", error);
    throw new Error("Failed to create job");
  }
}

// Apply for a job
export async function applyForJob(jobId, coverLetter) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      include: {
        resume: true,
      },
    });

    if (!user) throw new Error("User not found");

    const job = await db.job.findUnique({
      where: { id: jobId },
    });

    if (!job) throw new Error("Job not found");

    // Calculate match score using AI
    const matchScore = await calculateMatchScore(user, job);

    const application = await db.jobApplication.create({
      data: {
        jobId,
        applicantId: user.id,
        coverLetter,
        matchScore,
      },
    });

    return application;
  } catch (error) {
    console.error("Error applying for job:", error);
    throw new Error("Failed to apply for job");
  }
}

// Get user's job applications
export async function getMyApplications() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const applications = await db.jobApplication.findMany({
      where: { applicantId: user.id },
      include: {
        job: {
          include: {
            poster: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return applications;
  } catch (error) {
    console.error("Error fetching applications:", error);
    throw new Error("Failed to fetch applications");
  }
}

// Update application status (for recruiters)
export async function updateApplicationStatus(applicationId, status) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const application = await db.jobApplication.update({
      where: { id: applicationId },
      data: { status },
    });

    return application;
  } catch (error) {
    console.error("Error updating application:", error);
    throw new Error("Failed to update application");
  }
}

// Calculate match score between user and job
async function calculateMatchScore(user, job) {
  try {
    const prompt = `
      Analyze the match between this candidate and job posting. Return ONLY a number between 0-100.
      
      Candidate:
      - Skills: ${user.skills.join(", ")}
      - Experience: ${user.experience || 0} years
      - Industry: ${user.industry || "Not specified"}
      
      Job:
      - Title: ${job.title}
      - Required Skills: ${job.skills.join(", ")}
      - Minimum Experience: ${job.experience || 0} years
      - Description: ${job.description.substring(0, 500)}
      
      Return ONLY a number (e.g., 85). No explanation.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();
    const score = parseInt(text.match(/\d+/)?.[0] || "50");

    return Math.min(100, Math.max(0, score));
  } catch (error) {
    console.error("Error calculating match score:", error);
    return 50; // Default score if AI fails
  }
}
