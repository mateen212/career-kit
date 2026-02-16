"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  Clock,
  Users,
  Award,
  ExternalLink,
  Play,
  FileText,
  CheckCircle,
  Loader2,
  ArrowLeft,
  DollarSign,
  User,
  Upload,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { enrollInCourse } from "@/actions/courses";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CourseDetailView = ({ course, enrollmentStatus }) => {
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const router = useRouter();

  const [enrollmentData, setEnrollmentData] = useState({
    paymentProof: "",
    transactionId: "",
    paymentMethod: "",
  });

  const isEnrolled = enrollmentStatus?.status === "approved";
  const isPending = enrollmentStatus?.status === "pending";
  const canEnroll = !enrollmentStatus || enrollmentStatus.status === "rejected";

  // Handle payment proof file upload
  const handlePaymentProofChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentProofFile(file);
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setEnrollmentData({ ...enrollmentData, paymentProof: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await enrollInCourse(
        course.id,
        enrollmentData.paymentProof,
        enrollmentData.transactionId,
        enrollmentData.paymentMethod
      );

      const message = course.isPremium
        ? "Enrollment request submitted! Waiting for approval."
        : "Successfully enrolled in the course!";

      toast.success(message);
      setIsEnrollDialogOpen(false);
      setEnrollmentData({
        paymentProof: "",
        transactionId: "",
        paymentMethod: "",
      });
      router.refresh();
    } catch (error) {
      console.error("Error enrolling:", error);
      toast.error(error.message || "Failed to enroll. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/course-recommendations">
        <Button variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
      </Link>

      {/* Course Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex gap-2 mb-2">
                <Badge variant={course.isPremium ? "default" : "secondary"}>
                  {course.isPremium ? `$${course.price}` : "Free"}
                </Badge>
                <Badge variant="outline">{course.level}</Badge>
                <Badge>{course.category}</Badge>
              </div>
              <CardTitle className="text-3xl mb-2">{course.title}</CardTitle>
              <CardDescription className="text-base">
                by {course.instructor} • {course.platform}
              </CardDescription>
            </div>
          </div>

          <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{course._count?.enrollments || 0} enrolled</span>
            </div>
            {course.duration && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{course.duration}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">About this course</h3>
              <p className="text-muted-foreground">{course.description}</p>
            </div>

            {course.skills.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Skills you'll learn</h3>
                <div className="flex flex-wrap gap-2">
                  {course.skills.map((skill, i) => (
                    <Badge key={i} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {course.jobRole && (
              <div>
                <h3 className="font-semibold mb-2">Target Role</h3>
                <p className="text-muted-foreground">{course.jobRole}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enrollment Status */}
      {isPending && (
        <Card className="border-yellow-500 bg-yellow-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
              <div>
                <p className="font-semibold">Enrollment Pending</p>
                <p className="text-sm text-muted-foreground">
                  Your enrollment is under review. You'll be notified once approved.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isEnrolled && (
        <Card className="border-green-500 bg-green-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-semibold">You're Enrolled!</p>
                <p className="text-sm text-muted-foreground">
                  You have full access to all course materials below.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Content - Show preview or full based on enrollment */}
      {!isEnrolled ? (
        <Card>
          <CardHeader>
            <CardTitle>Course Preview</CardTitle>
            <CardDescription>
              Enroll to get full access to all videos, documents, and materials
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-12">
            <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              {course.isPremium
                ? "This is a premium course. Enroll to access all content."
                : "Enroll for free to access all course materials."}
            </p>
            {canEnroll && (
              <Button onClick={() => setIsEnrollDialogOpen(true)} size="lg">
                <Award className="h-4 w-4 mr-2" />
                Enroll Now
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Videos Section */}
          {course.videos && course.videos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Course Videos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {course.videos.map((video, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Play className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{video.title}</p>
                          {video.duration && (
                            <p className="text-sm text-muted-foreground">{video.duration}</p>
                          )}
                        </div>
                      </div>
                      <Button size="sm" asChild variant="outline">
                        <a href={video.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents Section */}
          {course.documents && course.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Course Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {course.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium">{doc.title}</p>
                          {doc.type && (
                            <p className="text-sm text-muted-foreground">{doc.type}</p>
                          )}
                        </div>
                      </div>
                      <Button size="sm" asChild variant="outline">
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          Download
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* External Course Link */}
          {course.courseUrl && (
            <Card>
              <CardHeader>
                <CardTitle>External Course</CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" size="lg">
                  <a href={course.courseUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Course
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Instructor Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Course Creator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{course.creator.name}</p>
              <p className="text-sm text-muted-foreground">{course.creator.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrollment Dialog */}
      <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll in {course.title}</DialogTitle>
            <DialogDescription>
              {course.isPremium
                ? "This is a premium course. Please provide payment details."
                : "This is a free course. Click enroll to get started!"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEnroll} className="space-y-4">
            {course.isPremium && (
              <>
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Payment Instructions:</Label>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    {course.paymentDetails || `Price: $${course.price}`}
                  </p>
                </div>

                <div>
                  <Label htmlFor="paymentProof">Payment Proof (Upload Image) *</Label>
                  <Input
                    id="paymentProof"
                    type="file"
                    accept="image/*"
                    required
                    onChange={handlePaymentProofChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload a screenshot or photo of your payment receipt
                  </p>
                  {paymentProofFile && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      File selected: {paymentProofFile.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="transactionId">Transaction ID *</Label>
                  <Input
                    id="transactionId"
                    required
                    value={enrollmentData.transactionId}
                    onChange={(e) => setEnrollmentData({ ...enrollmentData, transactionId: e.target.value })}
                    placeholder="TXN123456"
                  />
                </div>

                <div>
                  <Label htmlFor="paymentMethod">Payment Method *</Label>
                  <Select
                    value={enrollmentData.paymentMethod}
                    onValueChange={(value) => setEnrollmentData({ ...enrollmentData, paymentMethod: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PayPal">PayPal</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Cryptocurrency">Cryptocurrency</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEnrollDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {course.isPremium ? "Submit for Approval" : "Enroll Now"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseDetailView;
