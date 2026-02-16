"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  Star,
  Clock,
  Users,
  Award,
  Sparkles,
  ExternalLink,
  BookOpen,
  Target,
  Plus,
  DollarSign,
  Play,
  FileText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CourseRecommendationsView = ({ courses: initialCourses }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const router = useRouter();

  const categories = ["All", "Web Development", "AI & ML", "Cloud Computing", "DevOps", "Programming", "Design", "Data Science", "Mobile Development"];

  const filteredCourses = selectedCategory === "all"
    ? initialCourses
    : initialCourses.filter(course => course.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-2 flex-1 mr-4">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Browse & Create Courses</h3>
                <p className="text-sm text-muted-foreground">
                  Explore courses from community or create your own to share knowledge.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Link href="/create-course">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Course
          </Button>
        </Link>
      </div>

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

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <Badge variant={course.isPremium ? "default" : "secondary"}>
                  {course.isPremium ? `$${course.price}` : "Free"}
                </Badge>
                <Badge variant="outline">{course.level}</Badge>
              </div>
              <CardTitle className="line-clamp-2">{course.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {course.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{course._count?.enrollments || 0} enrolled</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GraduationCap className="h-4 w-4" />
                <span>{course.platform}</span>
              </div>

              {course.duration && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-1 mt-2">
                {course.skills.slice(0, 3).map((skill, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {course.skills.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{course.skills.length - 3}
                  </Badge>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                asChild
              >
                <Link href={`/course-recommendations/${course.id}`}>
                  View Details
                </Link>
              </Button>
              {course.courseUrl && (
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <a href={course.courseUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    External
                  </a>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No courses found in this category.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CourseRecommendationsView;
