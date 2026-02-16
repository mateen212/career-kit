"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  Star,
  Clock,
  Users,
  TrendingUp,
  Award,
  Sparkles,
  ExternalLink,
  BookOpen,
  Target,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CourseRecommendationsView = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Mock data - Replace with actual API call
  const courses = [
    {
      id: 1,
      title: "Advanced React & Next.js Development",
      platform: "Udemy",
      instructor: "Maximilian Schwarzmüller",
      rating: 4.8,
      students: 45000,
      duration: "40 hours",
      level: "Intermediate",
      category: "Web Development",
      price: "$89.99",
      skills: ["React", "Next.js", "TypeScript"],
      relevance: 95,
      description: "Master modern web development with React and Next.js",
      url: "#"
    },
    {
      id: 2,
      title: "Machine Learning A-Z: AI, Python & R",
      platform: "Coursera",
      instructor: "Andrew Ng",
      rating: 4.9,
      students: 120000,
      duration: "60 hours",
      level: "Beginner",
      category: "AI & ML",
      price: "$129.99",
      skills: ["Python", "ML", "AI"],
      relevance: 88,
      description: "Learn machine learning from scratch with practical examples",
      url: "#"
    },
    {
      id: 3,
      title: "AWS Certified Solutions Architect",
      platform: "A Cloud Guru",
      instructor: "Ryan Kroonenburg",
      rating: 4.7,
      students: 89000,
      duration: "25 hours",
      level: "Intermediate",
      category: "Cloud Computing",
      price: "$99.99",
      skills: ["AWS", "Cloud", "DevOps"],
      relevance: 92,
      description: "Prepare for AWS certification and master cloud architecture",
      url: "#"
    },
    {
      id: 4,
      title: "Complete Docker & Kubernetes Course",
      platform: "Udemy",
      instructor: "Bret Fisher",
      rating: 4.8,
      students: 67000,
      duration: "18 hours",
      level: "Intermediate",
      category: "DevOps",
      price: "$79.99",
      skills: ["Docker", "Kubernetes", "DevOps"],
      relevance: 85,
      description: "Master containerization and orchestration with Docker and Kubernetes",
      url: "#"
    },
    {
      id: 5,
      title: "Data Structures & Algorithms Masterclass",
      platform: "LeetCode",
      instructor: "Abdul Bari",
      rating: 4.9,
      students: 95000,
      duration: "35 hours",
      level: "Beginner",
      category: "Programming",
      price: "$69.99",
      skills: ["DSA", "Problem Solving", "Coding"],
      relevance: 90,
      description: "Master data structures and algorithms for technical interviews",
      url: "#"
    },
    {
      id: 6,
      title: "UI/UX Design Fundamentals",
      platform: "Interaction Design Foundation",
      instructor: "Don Norman",
      rating: 4.7,
      students: 43000,
      duration: "22 hours",
      level: "Beginner",
      category: "Design",
      price: "$59.99",
      skills: ["UI/UX", "Figma", "Design Thinking"],
      relevance: 78,
      description: "Learn the principles of user-centered design",
      url: "#"
    },
  ];

  const categories = ["All", "Web Development", "AI & ML", "Cloud Computing", "DevOps", "Programming", "Design"];

  const filteredCourses = selectedCategory === "all"
    ? courses
    : courses.filter(course => course.category.toLowerCase() === selectedCategory.toLowerCase());

  const sortedCourses = [...filteredCourses].sort((a, b) => b.relevance - a.relevance);

  const getRelevanceColor = (relevance) => {
    if (relevance >= 90) return "text-green-500";
    if (relevance >= 80) return "text-blue-500";
    return "text-yellow-500";
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-2">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">AI-Powered Recommendations</h3>
              <p className="text-sm text-muted-foreground">
                These courses are personalized based on your profile, skills, and career goals. 
                Relevance scores show how well each course matches your needs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Filter by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category.toLowerCase() ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.toLowerCase())}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recommended Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sortedCourses.length}</div>
            <p className="text-xs text-muted-foreground">
              Tailored to your profile
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Learning Hours
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sortedCourses.reduce((acc, course) => acc + parseInt(course.duration), 0)}h
            </div>
            <p className="text-xs text-muted-foreground">
              Across all courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Relevance Score
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(sortedCourses.reduce((acc, course) => acc + course.relevance, 0) / sortedCourses.length)}%
            </div>
            <p className="text-xs text-muted-foreground">
              AI match quality
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sortedCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{course.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 flex-wrap">
                    <span>{course.platform}</span>
                    <span>•</span>
                    <span>{course.instructor}</span>
                  </CardDescription>
                </div>
                <Badge className={getRelevanceColor(course.relevance)}>
                  {course.relevance}% Match
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{course.description}</p>

              {/* Course Stats */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span className="font-medium">{course.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{course.students.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{course.duration}</span>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-2">
                {course.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>

              {/* Level and Price */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{course.level}</Badge>
                  <Badge variant="outline" className="font-semibold">
                    {course.price}
                  </Badge>
                </div>
                <Button size="sm">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Course
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Learning Path Suggestion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Suggested Learning Path
          </CardTitle>
          <CardDescription>
            Follow this sequence to maximize your career growth
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedCourses.slice(0, 3).map((course, index) => (
              <div
                key={course.id}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-primary">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">{course.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {course.duration} • {course.level}
                  </p>
                </div>
                <Badge className={getRelevanceColor(course.relevance)}>
                  {course.relevance}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseRecommendationsView;
