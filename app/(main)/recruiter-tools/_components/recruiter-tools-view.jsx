"use client";

import React, { useState } from "react";
import {
  Users,
  Briefcase,
  Mail,
  Sparkles,
  Award,
  Plus,
  CheckCircle,
  Search,
  Filter,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { createJob, updateApplicationStatus } from "@/actions/jobs";

const RecruiterToolsView = ({ postedJobs }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    description: "",
    location: "",
    type: "Full-time",
    remote: "Hybrid",
    salaryMin: "",
    salaryMax: "",
    skills: "",
    experience: "",
  });

  const allApplications = postedJobs.flatMap((job) =>
    job.applications.map((app) => ({
      ...app,
      jobTitle: job.title,
      company: job.company,
    }))
  );

  const filteredApplications = allApplications.filter((app) => {
    const matchesSearch =
      app.applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateJob = async () => {
    setIsCreatingJob(true);
    try {
      const jobData = {
        ...newJob,
        salaryMin: parseInt(newJob.salaryMin) || null,
        salaryMax: parseInt(newJob.salaryMax) || null,
        experience: parseInt(newJob.experience) || null,
        skills: newJob.skills.split(",").map((s) => s.trim()),
      };
      await createJob(jobData);
      alert("Job posted successfully!");
      setDialogOpen(false);
      window.location.reload();
    } catch (error) {
      alert("Failed to create job. Please try again.");
    } finally {
      setIsCreatingJob(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await updateApplicationStatus(applicationId, newStatus);
      window.location.reload();
    } catch (error) {
      alert("Failed to update status. Please try again.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "shortlisted":
        return "bg-green-500/10 text-green-500";
      case "reviewed":
        return "bg-blue-500/10 text-blue-500";
      case "rejected":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-yellow-500/10 text-yellow-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-2">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">AI-Powered Recruitment</h3>
              <p className="text-sm text-muted-foreground">
                Post jobs, review applications, and manage hiring efficiently.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posted Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{postedJobs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allApplications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {allApplications.filter((a) => a.status === "shortlisted").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Match</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allApplications.length > 0
                ? Math.round(
                    allApplications.reduce((acc, a) => acc + (a.matchScore || 0), 0) /
                      allApplications.length
                  )
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Post Job */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post a New Job</DialogTitle>
            <DialogDescription>Fill in the job details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Job Title"
              value={newJob.title}
              onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
            />
            <Input
              placeholder="Company Name"
              value={newJob.company}
              onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
            />
            <Textarea
              placeholder="Job Description"
              value={newJob.description}
              onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
              rows={5}
            />
            <Input
              placeholder="Location"
              value={newJob.location}
              onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select value={newJob.type} onValueChange={(val) => setNewJob({ ...newJob, type: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newJob.remote} onValueChange={(val) => setNewJob({ ...newJob, remote: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Remote">Remote</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                  <SelectItem value="Onsite">Onsite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Min Salary"
                type="number"
                value={newJob.salaryMin}
                onChange={(e) => setNewJob({ ...newJob, salaryMin: e.target.value })}
              />
              <Input
                placeholder="Max Salary"
                type="number"
                value={newJob.salaryMax}
                onChange={(e) => setNewJob({ ...newJob, salaryMax: e.target.value })}
              />
            </div>
            <Input
              placeholder="Required Skills (comma-separated)"
              value={newJob.skills}
              onChange={(e) => setNewJob({ ...newJob, skills: e.target.value })}
            />
            <Input
              placeholder="Minimum Years of Experience"
              type="number"
              value={newJob.experience}
              onChange={(e) => setNewJob({ ...newJob, experience: e.target.value })}
            />
            <Button onClick={handleCreateJob} disabled={isCreatingJob} className="w-full">
              {isCreatingJob ? "Posting..." : "Post Job"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Applications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Applications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No applications yet</h3>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((app) => (
            <Card key={app.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{app.applicant.name}</h3>
                    <p className="text-sm text-muted-foreground">{app.jobTitle}</p>
                    <div className="flex gap-2 mt-2">
                      {app.applicant.skills.slice(0, 3).map((skill, i) => (
                        <Badge key={i} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                      {app.matchScore && <Badge>{app.matchScore.toFixed(0)}% Match</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleStatusChange(app.id, "reviewed")}>
                      Review
                    </Button>
                    <Button size="sm" onClick={() => handleStatusChange(app.id, "shortlisted")}>
                      Shortlist
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default RecruiterToolsView;
