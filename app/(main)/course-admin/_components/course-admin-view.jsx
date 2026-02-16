"use client";

import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  DollarSign,
  Users,
  BookOpen,
  Loader2,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { updateEnrollmentStatus } from "@/actions/courses";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

const CourseAdminView = ({ enrollments: initialEnrollments, courses }) => {
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const router = useRouter();

  const handleApprove = async () => {
    if (!selectedEnrollment) return;
    setIsLoading(true);

    try {
      await updateEnrollmentStatus(selectedEnrollment.id, "approved", notes);
      toast.success("Enrollment approved successfully!");
      setIsReviewDialogOpen(false);
      setNotes("");
      setSelectedEnrollment(null);
      router.refresh();
    } catch (error) {
      console.error("Error approving enrollment:", error);
      toast.error("Failed to approve enrollment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedEnrollment) return;
    if (!notes.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }
    setIsLoading(true);

    try {
      await updateEnrollmentStatus(selectedEnrollment.id, "rejected", notes);
      toast.success("Enrollment rejected.");
      setIsReviewDialogOpen(false);
      setNotes("");
      setSelectedEnrollment(null);
      router.refresh();
    } catch (error) {
      console.error("Error rejecting enrollment:", error);
      toast.error("Failed to reject enrollment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approvals
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{initialEnrollments.length}</div>
            <p className="text-xs text-muted-foreground">
              Waiting for your review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Your Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground">
              Active courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses.reduce((sum, course) => sum + (course._count?.enrollments || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all courses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Enrollments */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Enrollment Requests</CardTitle>
          <CardDescription>
            Review and approve student enrollment requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {initialEnrollments.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No pending enrollments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {initialEnrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{enrollment.user.name}</p>
                          <p className="text-sm text-muted-foreground">{enrollment.user.email}</p>
                        </div>
                      </div>

                      <div className="ml-13 space-y-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{enrollment.course.title}</span>
                          <Badge variant="outline">
                            <DollarSign className="h-3 w-3 mr-1" />
                            ${enrollment.course.price}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Transaction ID:</span>
                            <p className="font-mono">{enrollment.transactionId || "N/A"}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Payment Method:</span>
                            <p>{enrollment.paymentMethod || "N/A"}</p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Enrolled:</span>
                            <p>{format(new Date(enrollment.enrolledAt), "PPpp")}</p>
                          </div>
                          {enrollment.paymentProof && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Payment Proof:</span>
                              <a
                                href={enrollment.paymentProof}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                View Screenshot
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedEnrollment(enrollment);
                        setIsReviewDialogOpen(true);
                      }}
                    >
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Your Courses Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Your Courses</CardTitle>
          <CardDescription>
            Overview of your created courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">You haven't created any courses yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{course.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {course._count?.enrollments || 0} students enrolled
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={course.isPremium ? "default" : "secondary"}>
                      {course.isPremium ? `$${course.price}` : "Free"}
                    </Badge>
                    <Badge variant="outline">{course.category}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Enrollment Request</DialogTitle>
            <DialogDescription>
              Review the student's enrollment request and payment details
            </DialogDescription>
          </DialogHeader>

          {selectedEnrollment && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">Student</Label>
                <p className="text-sm">{selectedEnrollment.user.name}</p>
                <p className="text-xs text-muted-foreground">{selectedEnrollment.user.email}</p>
              </div>

              <div>
                <Label className="text-sm font-semibold">Course</Label>
                <p className="text-sm">{selectedEnrollment.course.title}</p>
                <p className="text-xs text-muted-foreground">Price: ${selectedEnrollment.course.price}</p>
              </div>

              {selectedEnrollment.paymentProof && (
                <div>
                  <Label className="text-sm font-semibold">Payment Proof</Label>
                  <a
                    href={selectedEnrollment.paymentProof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1 text-sm"
                  >
                    <Eye className="h-3 w-3" />
                    View Payment Screenshot
                  </a>
                </div>
              )}

              <div>
                <Label className="text-sm font-semibold">Transaction Details</Label>
                <p className="text-sm">ID: {selectedEnrollment.transactionId || "N/A"}</p>
                <p className="text-sm">Method: {selectedEnrollment.paymentMethod || "N/A"}</p>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional for approval, Required for rejection)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes or feedback..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsReviewDialogOpen(false);
                setNotes("");
                setSelectedEnrollment(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseAdminView;
