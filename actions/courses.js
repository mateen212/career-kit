"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// Get all active courses
export async function getCourses(filters = {}) {
  const { category, jobRole, isPremium, level } = filters;

  const where = {
    status: "active",
    ...(category && { category }),
    ...(jobRole && { jobRole }),
    ...(isPremium !== undefined && { isPremium }),
    ...(level && { level }),
  };

  const courses = await db.course.findMany({
    where,
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true,
        },
      },
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return courses;
}

// Get a single course by ID
export async function getCourse(id) {
  const course = await db.course.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true,
        },
      },
      enrollments: {
        select: {
          id: true,
          status: true,
          userId: true,
        },
      },
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
  });

  return course;
}

// Create a new course
export async function createCourse(courseData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const course = await db.course.create({
    data: {
      ...courseData,
      creatorId: user.id,
    },
  });

  return course;
}

// Update a course
export async function updateCourse(id, courseData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  // Check if user is the creator
  const course = await db.course.findUnique({
    where: { id },
  });

  if (!course) throw new Error("Course not found");
  if (course.creatorId !== user.id) throw new Error("Not authorized to update this course");

  const updatedCourse = await db.course.update({
    where: { id },
    data: courseData,
  });

  return updatedCourse;
}

// Delete a course
export async function deleteCourse(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  // Check if user is the creator
  const course = await db.course.findUnique({
    where: { id },
  });

  if (!course) throw new Error("Course not found");
  if (course.creatorId !== user.id) throw new Error("Not authorized to delete this course");

  await db.course.delete({
    where: { id },
  });

  return { success: true };
}

// Enroll in a course
export async function enrollInCourse(courseId, paymentProof, transactionId, paymentMethod) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const course = await db.course.findUnique({
    where: { id: courseId },
  });

  if (!course) throw new Error("Course not found");

  // Check if already enrolled
  const existing = await db.courseEnrollment.findUnique({
    where: {
      courseId_userId: {
        courseId,
        userId: user.id,
      },
    },
  });

  if (existing) {
    if (existing.status === "pending") {
      throw new Error("Your enrollment is pending approval. Please wait for the course creator to review.");
    }
    if (existing.status === "approved") {
      throw new Error("You are already enrolled in this course.");
    }
    // If rejected, allow re-enrollment by deleting old enrollment
    if (existing.status === "rejected") {
      await db.courseEnrollment.delete({
        where: { id: existing.id },
      });
    }
  }

  const enrollment = await db.courseEnrollment.create({
    data: {
      courseId,
      userId: user.id,
      status: course.isPremium ? "pending" : "approved", // Auto-approve free courses
      paymentProof,
      transactionId,
      paymentMethod,
      ...((!course.isPremium) && { approvedAt: new Date() }),
    },
  });

  return enrollment;
}

// Get user's enrollments
export async function getUserEnrollments() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const enrollments = await db.courseEnrollment.findMany({
    where: { userId: user.id },
    include: {
      course: {
        include: {
          creator: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      enrolledAt: "desc",
    },
  });

  return enrollments;
}

// Get enrollments for courses created by the user (for approval)
export async function getCourseEnrollmentsForApproval() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const enrollments = await db.courseEnrollment.findMany({
    where: {
      course: {
        creatorId: user.id,
      },
      status: "pending",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true,
        },
      },
      course: {
        select: {
          id: true,
          title: true,
          price: true,
        },
      },
    },
    orderBy: {
      enrolledAt: "desc",
    },
  });

  return enrollments;
}

// Approve or reject enrollment
export async function updateEnrollmentStatus(enrollmentId, status, notes) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const enrollment = await db.courseEnrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      course: true,
    },
  });

  if (!enrollment) throw new Error("Enrollment not found");
  if (enrollment.course.creatorId !== user.id) {
    throw new Error("Not authorized to update this enrollment");
  }

  const updated = await db.courseEnrollment.update({
    where: { id: enrollmentId },
    data: {
      status,
      notes,
      ...(status === "approved" && { approvedAt: new Date(), approvedBy: user.id }),
    },
  });

  return updated;
}

// Get user's created courses
export async function getUserCreatedCourses() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const courses = await db.course.findMany({
    where: { creatorId: user.id },
    include: {
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return courses;
}

// Check user's enrollment status for a specific course
export async function getUserEnrollmentStatus(courseId) {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) return null;

  const enrollment = await db.courseEnrollment.findUnique({
    where: {
      courseId_userId: {
        courseId,
        userId: user.id,
      },
    },
  });

  return enrollment;
}
