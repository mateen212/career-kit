"use client";

import React, { useState } from "react";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  Heart,
  ExternalLink,
  Filter,
  Sparkles,
  TrendingUp,
  Users,
  BookmarkPlus,
  Send,
  CheckCircle,
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
import { applyForJob } from "@/actions/jobs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const JobMatchesView = ({ jobs, myApplications }) => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [applyingTo, setApplyingTo] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const appliedJobIds = myApplications.map((app) => app.jobId);

  const toggleSaveJob = (jobId) => {
    setSavedJobs((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  const handleApply = async () => {
    if (!applyingTo || !coverLetter.trim()) return;

    setIsSubmitting(true);
    try {
      await applyForJob(applyingTo.id, coverLetter);
      alert("Application submitted successfully!");
      setApplyingTo(null);
      setCoverLetter("");
      window.location.reload();
    } catch (error) {
      console.error("Error applying:", error);
      alert("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMatchColor = (applications) => {
    if (!applications || applications.length === 0) return "text-gray-500";
    const avgScore =
      applications.reduce((sum, app) => sum + (app.matchScore || 0), 0) /
      applications.length;
    if (avgScore >= 90) return "text-green-500";
    if (avgScore >= 80) return "text-blue-500";
    return "text-yellow-500";
  };

  const getMatchBg = (applications) => {
    if (!applications || applications.length === 0) return "bg-gray-500/10";
    const avgScore =
      applications.reduce((sum, app) => sum + (app.matchScore || 0), 0) /
      applications.length;
    if (avgScore >= 90) return "bg-green-500/10";
    if (avgScore >= 80) return "bg-blue-500/10";
    return "bg-yellow-500/10";
  };

  const formatDate = (date) => {
    const now = new Date();
    const posted = new Date(date);
    const diffTime = Math.abs(now - posted);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-2">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">
                AI-Powered Job Matching
              </h3>
              <p className="text-sm text-muted-foreground">
                These jobs are personalized based on your skills, experience,
                and preferences. Match scores indicate how well each position
                aligns with your profile.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Jobs</p>
                <p className="text-2xl font-bold">{jobs.length}</p>
              </div>
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Applications</p>
                <p className="text-2xl font-bold">{myApplications.length}</p>
              </div>
              <Send className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saved Jobs</p>
                <p className="text-2xl font-bold">{savedJobs.length}</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">
            All Jobs ({jobs.length})
          </TabsTrigger>
          <TabsTrigger value="applied">
            Applied ({myApplications.length})
          </TabsTrigger>
          <TabsTrigger value="saved">
            Saved ({savedJobs.length})
          </TabsTrigger>
        </TabsList>

        {/* All Jobs */}
        <TabsContent value="all" className="space-y-4 mt-6">
          {jobs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No jobs available at the moment. Check back later!
                </p>
              </CardContent>
            </Card>
          ) : (
            jobs.map((job) => {
              const hasApplied = appliedJobIds.includes(job.id);
              const myApplication = myApplications.find(
                (app) => app.jobId === job.id
              );

              return (
                <Card
                  key={job.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {job.title}
                            </h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              {job.company}
                            </p>
                          </div>
                          {myApplication && (
                            <Badge
                              className={`${getMatchBg([myApplication])} ${getMatchColor([myApplication])} border-0`}
                            >
                              {myApplication.matchScore}% Match
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {job.type}
                          </span>
                          {job.salaryRange && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {job.salaryRange}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDate(job.createdAt)}
                          </span>
                        </div>

                        <p className="text-sm mb-3 line-clamp-2">
                          {job.description}
                        </p>

                        {job.requiredSkills && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {job.requiredSkills
                              .split(",")
                              .slice(0, 5)
                              .map((skill, idx) => (
                                <Badge key={idx} variant="secondary">
                                  {skill.trim()}
                                </Badge>
                              ))}
                            {job.requiredSkills.split(",").length > 5 && (
                              <Badge variant="outline">
                                +{job.requiredSkills.split(",").length - 5} more
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="flex gap-2">
                          {hasApplied ? (
                            <Button variant="outline" disabled>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Applied ({myApplication.status})
                            </Button>
                          ) : (
                            <Button onClick={() => setApplyingTo(job)}>
                              <Send className="h-4 w-4 mr-2" />
                              Apply Now
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            onClick={() => toggleSaveJob(job.id)}
                          >
                            <Heart
                              className={`h-4 w-4 ${savedJobs.includes(job.id) ? "fill-current text-red-500" : ""}`}
                            />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Applied Jobs */}
        <TabsContent value="applied" className="space-y-4 mt-6">
          {myApplications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Send className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  You haven't applied to any jobs yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            myApplications.map((application) => (
              <Card
                key={application.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {application.job.title}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {application.job.company}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge
                            className={`${getMatchBg([application])} ${getMatchColor([application])} border-0`}
                          >
                            {application.matchScore}% Match
                          </Badge>
                          <Badge
                            variant={
                              application.status === "ACCEPTED"
                                ? "success"
                                : application.status === "REJECTED"
                                  ? "destructive"
                                  : "default"
                            }
                          >
                            {application.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {application.job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Applied {formatDate(application.createdAt)}
                        </span>
                      </div>

                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm font-medium mb-1">
                          Your Cover Letter:
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {application.coverLetter}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Saved Jobs */}
        <TabsContent value="saved" className="space-y-4 mt-6">
          {savedJobs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No saved jobs yet. Save jobs to apply later!
                </p>
              </CardContent>
            </Card>
          ) : (
            jobs
              .filter((job) => savedJobs.includes(job.id))
              .map((job) => {
                const hasApplied = appliedJobIds.includes(job.id);
                const myApplication = myApplications.find(
                  (app) => app.jobId === job.id
                );

                return (
                  <Card
                    key={job.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {job.title}
                              </h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                {job.company}
                              </p>
                            </div>
                          </div>

                          <p className="text-sm mb-3">{job.description}</p>

                          <div className="flex gap-2">
                            {hasApplied ? (
                              <Button variant="outline" disabled>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Applied
                              </Button>
                            ) : (
                              <Button onClick={() => setApplyingTo(job)}>
                                <Send className="h-4 w-4 mr-2" />
                                Apply Now
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              onClick={() => toggleSaveJob(job.id)}
                            >
                              <Heart className="h-4 w-4 fill-current text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
          )}
        </TabsContent>
      </Tabs>

      {/* Apply Dialog */}
      <Dialog open={!!applyingTo} onOpenChange={() => setApplyingTo(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Apply for {applyingTo?.title}</DialogTitle>
            <DialogDescription>
              Write a cover letter to explain why you're a great fit for this
              position.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Dear Hiring Manager,&#10;&#10;I am writing to express my interest in the position..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={10}
              className="resize-none"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setApplyingTo(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApply}
                disabled={!coverLetter.trim() || isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobMatchesView;
