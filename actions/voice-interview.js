"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Create a new voice interview session
export async function createVoiceInterview() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: {
        id: true,
        industry: true,
        skills: true,
        experience: true,
      },
    });

    if (!user) throw new Error("User not found");

    // Generate interview questions using AI based on user's industry and experience
    const questions = await generateInterviewQuestions(user.industry, user.skills, user.experience);

    const voiceInterview = await db.voiceInterview.create({
      data: {
        userId: user.id,
        category: `${user.industry || 'General'} Interview`,
        questions,
        userResponses: [],
        language: "en",
        status: "in-progress",
      },
    });

    return voiceInterview;
  } catch (error) {
    console.error("Error creating voice interview:", error);
    throw new Error("Failed to create voice interview");
  }
}

// Get user's voice interviews
export async function getVoiceInterviews() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const voiceInterviews = await db.voiceInterview.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return voiceInterviews;
  } catch (error) {
    console.error("Error fetching voice interviews:", error);
    throw new Error("Failed to fetch voice interviews");
  }
}

// Update voice interview with user response
export async function updateVoiceInterviewResponse(interviewId, questionIndex, response) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const interview = await db.voiceInterview.findUnique({
      where: { id: interviewId },
    });

    if (!interview) throw new Error("Interview not found");

    const updatedResponses = [...interview.userResponses];
    updatedResponses[questionIndex] = response;

    const updatedInterview = await db.voiceInterview.update({
      where: { id: interviewId },
      data: {
        userResponses: updatedResponses,
      },
    });

    return updatedInterview;
  } catch (error) {
    console.error("Error updating voice interview:", error);
    throw new Error("Failed to update voice interview");
  }
}

// Complete voice interview and get AI feedback
export async function completeVoiceInterview(interviewId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const interview = await db.voiceInterview.findUnique({
      where: { id: interviewId },
    });

    if (!interview) throw new Error("Interview not found");

    // Generate feedback using AI
    const { score, feedback } = await evaluateVoiceInterview(
      interview.questions,
      interview.userResponses
    );

    const completedInterview = await db.voiceInterview.update({
      where: { id: interviewId },
      data: {
        overallScore: score,
        feedback,
        status: "completed",
      },
    });

    return completedInterview;
  } catch (error) {
    console.error("Error completing voice interview:", error);
    throw new Error("Failed to complete voice interview");
  }
}

// Generate interview questions using AI
async function generateInterviewQuestions(industry, skills, experience) {
  try {
    // Determine difficulty level
    const experienceLevel = !experience || experience < 2 
      ? "entry-level (0-2 years)" 
      : experience < 5 
      ? "mid-level (2-5 years)" 
      : "senior-level (5+ years)";

    const prompt = `
      You are a friendly, professional interviewer conducting a 2-5 minute conversational voice interview for a ${experienceLevel} professional in the ${industry || "general"} industry${skills?.length ? ` with skills in ${skills.join(", ")}` : ""}.
      
      Generate EXACTLY 5 questions that create a natural, human-like conversation flow:
      
      1. GREETING & INTRODUCTION (30 seconds):
         - Warm, friendly opening question
         - Make them comfortable
         - Get basic introduction
         - Very easy and conversational
      
      2. BACKGROUND & EXPERIENCE (45 seconds):
         - Ask about their professional background
         - Current role or recent experience
         - What they've been working on
         - Easy, open-ended question
      
      3. SKILLS & INTERESTS (1 minute):
         - Explore their technical skills or expertise
         - What they enjoy working on
         - Their strongest areas
         - Easy to medium difficulty
      
      4. PRACTICAL APPLICATION (1 minute):
         - Simple scenario or problem-solving question
         - Keep it practical and relevant
         - Not too technical or complex
         - Medium difficulty (but still approachable)
      
      5. GROWTH & ASPIRATIONS (45 seconds):
         - Future goals and learning interests
         - Where they want to grow
         - Positive, forward-looking
         - Easy closing question
      
      CRITICAL REQUIREMENTS:
      - Start with VERY BASIC, friendly questions
      - Gradually build difficulty but keep it conversational
      - For entry-level: Focus on learning, basics, and enthusiasm
      - For mid-level: Balance technical knowledge with practical experience
      - For senior-level: Include strategy and leadership, but still approachable
      - Each question should feel like a natural conversation, not an exam
      - Total interview time: 2-5 minutes (short responses expected)
      - AVOID overly technical jargon or complex scenarios
      
      Return ONLY a valid JSON array (no markdown, no explanation):
      [
        {
          "question": "Your friendly, conversational question here",
          "expectedPoints": ["Key point 1", "Key point 2"],
          "difficulty": "Easy|Medium",
          "estimatedTime": "30-60 seconds"
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().replace(/```(?:json)?\n?/g, "").trim();

    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating questions:", error);
    // Return conversational default questions if AI fails
    return [
      {
        question: "Hi there! Thanks for joining me today. To start off, could you tell me a little about yourself and what you do?",
        expectedPoints: ["Name/Background", "Current role or studies", "Brief introduction"],
        difficulty: "Easy",
        estimatedTime: "30 seconds",
      },
      {
        question: "That's great! So, can you share a bit about your professional journey? How did you get to where you are now?",
        expectedPoints: ["Career path", "Key experiences", "What brought them here"],
        difficulty: "Easy",
        estimatedTime: "45 seconds",
      },
      {
        question: "Interesting! What are some of the skills or technologies you enjoy working with the most?",
        expectedPoints: ["Technical skills", "Areas of interest", "What they're good at"],
        difficulty: "Easy",
        estimatedTime: "1 minute",
      },
      {
        question: "Nice! Let's say you're working on a project and you encounter a bug you can't solve immediately. What would you do?",
        expectedPoints: ["Problem-solving approach", "Resources used", "Collaboration"],
        difficulty: "Medium",
        estimatedTime: "1 minute",
      },
      {
        question: "Almost done! Where do you see yourself growing professionally? What new skills would you like to learn?",
        expectedPoints: ["Career goals", "Learning interests", "Future aspirations"],
        difficulty: "Easy",
        estimatedTime: "45 seconds",
      },
    ];
  }
}

// Evaluate voice interview responses using AI
async function evaluateVoiceInterview(questions, responses) {
  try {
    const prompt = `
      Evaluate this voice interview performance. Return ONLY a JSON object:
      {
        "score": 85,
        "feedback": "Detailed feedback here"
      }
      
      Questions and Responses:
      ${questions.map((q, i) => `
        Q${i + 1}: ${q.question}
        Expected Points: ${q.expectedPoints.join(", ")}
        User Response: ${responses[i]?.transcript || "No response"}
      `).join("\n")}
      
      Score should be 0-100. Provide constructive feedback. Return ONLY the JSON object.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().replace(/```(?:json)?\n?/g, "").trim();

    return JSON.parse(text);
  } catch (error) {
    console.error("Error evaluating interview:", error);
    return {
      score: 50,
      feedback: "Unable to generate feedback. Please try again.",
    };
  }
}
