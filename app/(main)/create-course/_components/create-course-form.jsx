"use client";

import React, { useState } from "react";
import {
  Plus,
  Loader2,
  X,
  Upload,
  FileText,
  Image as ImageIcon,
  Video,
  ArrowLeft,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createCourse } from "@/actions/courses";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CreateCourseForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const categories = ["Web Development", "AI & ML", "Cloud Computing", "DevOps", "Programming", "Design", "Data Science", "Mobile Development"];
  const levels = ["Beginner", "Intermediate", "Advanced"];

  const [courseData, setCourseData] = useState({
    title: "",
    platform: "",
    instructor: "",
    description: "",
    category: "",
    jobRole: "",
    level: "",
    duration: "",
    isPremium: false,
    price: 0,
    paymentDetails: "",
    skills: [],
    thumbnailUrl: "",
    videos: [],
    documents: [],
    courseUrl: "",
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoInput, setVideoInput] = useState({ title: "", url: "", duration: "" });
  const [documentFile, setDocumentFile] = useState(null);
  const [documentTitle, setDocumentTitle] = useState("");

  // Handle thumbnail upload
  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setCourseData({ ...courseData, thumbnailUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle adding video
  const handleAddVideo = () => {
    if (videoInput.title && videoInput.url) {
      setCourseData({
        ...courseData,
        videos: [...courseData.videos, { ...videoInput }],
      });
      setVideoInput({ title: "", url: "", duration: "" });
    } else {
      toast.error("Please fill in video title and URL");
    }
  };

  // Handle document upload
  const handleDocumentUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && documentTitle) {
      setDocumentFile(file);
      // Convert to base64 for storage
      const reader = new FileReader();
      reader.onloadend = () => {
        setCourseData({
          ...courseData,
          documents: [
            ...courseData.documents,
            {
              title: documentTitle,
              url: reader.result,
              type: file.type,
              name: file.name,
            },
          ],
        });
        setDocumentTitle("");
        setDocumentFile(null);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("Please provide a title for the document");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createCourse({
        ...courseData,
        skills: courseData.skills.filter(s => s.trim() !== ""),
      });

      toast.success("Course created successfully!");
      router.push("/course-admin");
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error("Failed to create course. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/course-recommendations">
        <Button variant="outline" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
      </Link>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Core details about your course</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  required
                  value={courseData.title}
                  onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                  placeholder="e.g., Complete React Development"
                />
              </div>

              <div>
                <Label htmlFor="platform">Platform *</Label>
                <Input
                  id="platform"
                  required
                  value={courseData.platform}
                  onChange={(e) => setCourseData({ ...courseData, platform: e.target.value })}
                  placeholder="e.g., YouTube, Udemy"
                />
              </div>

              <div>
                <Label htmlFor="instructor">Instructor *</Label>
                <Input
                  id="instructor"
                  required
                  value={courseData.instructor}
                  onChange={(e) => setCourseData({ ...courseData, instructor: e.target.value })}
                  placeholder="Your name or instructor name"
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={courseData.category} onValueChange={(value) => setCourseData({ ...courseData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="level">Level *</Label>
                <Select value={courseData.level} onValueChange={(value) => setCourseData({ ...courseData, level: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={courseData.duration}
                  onChange={(e) => setCourseData({ ...courseData, duration: e.target.value })}
                  placeholder="e.g., 40 hours"
                />
              </div>

              <div>
                <Label htmlFor="jobRole">Target Job Role</Label>
                <Input
                  id="jobRole"
                  value={courseData.jobRole}
                  onChange={(e) => setCourseData({ ...courseData, jobRole: e.target.value })}
                  placeholder="e.g., Frontend Developer"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  required
                  value={courseData.description}
                  onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                  placeholder="Describe what students will learn..."
                  rows={4}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  value={courseData.skills.join(", ")}
                  onChange={(e) => setCourseData({ ...courseData, skills: e.target.value.split(",").map(s => s.trim()) })}
                  placeholder="e.g., React, JavaScript, TypeScript"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="courseUrl">External Course URL (optional)</Label>
                <Input
                  id="courseUrl"
                  type="url"
                  value={courseData.courseUrl}
                  onChange={(e) => setCourseData({ ...courseData, courseUrl: e.target.value })}
                  placeholder="https://youtube.com/playlist/..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Thumbnail Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Course Thumbnail
            </CardTitle>
            <CardDescription>Upload a thumbnail image for your course</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Label htmlFor="thumbnail">Thumbnail Image</Label>
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="cursor-pointer"
              />
              {courseData.thumbnailUrl && (
                <div className="mt-3">
                  <img
                    src={courseData.thumbnailUrl}
                    alt="Thumbnail preview"
                    className="max-w-xs rounded-lg border"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Videos Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Course Videos
            </CardTitle>
            <CardDescription>Add video lectures for your course</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Input
                placeholder="Video title"
                value={videoInput.title}
                onChange={(e) => setVideoInput({ ...videoInput, title: e.target.value })}
              />
              <Input
                placeholder="Video URL (YouTube, etc.)"
                value={videoInput.url}
                onChange={(e) => setVideoInput({ ...videoInput, url: e.target.value })}
              />
              <div className="flex gap-2">
                <Input
                  placeholder="Duration"
                  value={videoInput.duration}
                  onChange={(e) => setVideoInput({ ...videoInput, duration: e.target.value })}
                />
                <Button type="button" onClick={handleAddVideo} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {courseData.videos.length > 0 && (
              <div className="space-y-2">
                {courseData.videos.map((video, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{video.title}</p>
                      <p className="text-sm text-muted-foreground">{video.duration}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCourseData({
                        ...courseData,
                        videos: courseData.videos.filter((_, i) => i !== index)
                      })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Course Documents
            </CardTitle>
            <CardDescription>Upload PDFs, slides, and other materials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Document title"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
              />
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                  onChange={handleDocumentUpload}
                  className="cursor-pointer"
                />
              </div>
            </div>

            {courseData.documents.length > 0 && (
              <div className="space-y-2">
                {courseData.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <div>
                        <p className="font-medium">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">{doc.name}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCourseData({
                        ...courseData,
                        documents: courseData.documents.filter((_, i) => i !== index)
                      })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
            <CardDescription>Set your course pricing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPremium"
                checked={courseData.isPremium}
                onChange={(e) => setCourseData({ ...courseData, isPremium: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="isPremium">This is a premium course</Label>
            </div>

            {courseData.isPremium && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    required={courseData.isPremium}
                    value={courseData.price}
                    onChange={(e) => setCourseData({ ...courseData, price: parseFloat(e.target.value) })}
                    placeholder="99.99"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="paymentDetails">Payment Details *</Label>
                  <Textarea
                    id="paymentDetails"
                    value={courseData.paymentDetails}
                    onChange={(e) => setCourseData({ ...courseData, paymentDetails: e.target.value })}
                    placeholder="e.g., Pay via PayPal to email@example.com or +1234567890"
                    rows={3}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/course-recommendations")}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Course
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateCourseForm;
