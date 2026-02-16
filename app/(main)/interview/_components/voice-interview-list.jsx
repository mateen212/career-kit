"use client";

import React, { useState } from "react";
import { Mic, Play, CheckCircle, Clock, TrendingUp, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { createVoiceInterview } from "@/actions/voice-interview";


const VoiceInterviewList = ({ voiceInterviews }) => {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateInterview = async () => {
    setIsCreating(true);
    try {
      const interview = await createVoiceInterview();
      router.push(`/interview/voice/${interview.id}`);
    } catch (error) {
      console.error("Error creating interview:", error);
      alert("Failed to create interview. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusColor = (status) => {
    return status === "completed" ? "bg-green-500/10 text-green-500" : "bg-blue-500/10 text-blue-500";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Voice Interview Practice
          </CardTitle>
          <Button onClick={handleCreateInterview} disabled={isCreating}>
            <Plus className="h-4 w-4 mr-2" />
            {isCreating ? "Creating..." : "Start Voice Interview"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {voiceInterviews.length === 0 ? (
          <div className="text-center py-12">
            <Mic className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No voice interviews yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start your first voice interview to practice with questions tailored to your industry
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {voiceInterviews.map((interview) => (
              <div
                key={interview.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Mic className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{interview.category} Interview</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDate(interview.createdAt)}
                      </p>
                      {interview.status === "completed" && interview.overallScore && (
                        <p className="text-sm flex items-center gap-1 text-green-500">
                          <TrendingUp className="h-4 w-4" />
                          Score: {interview.overallScore.toFixed(0)}%
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(interview.status)}>
                    {interview.status === "completed" ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </>
                    ) : (
                      "In Progress"
                    )}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/interview/voice/${interview.id}`)}
                  >
                    {interview.status === "completed" ? (
                      <>
                        <Play className="h-4 w-4 mr-1" />
                        View
                      </>
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceInterviewList;
