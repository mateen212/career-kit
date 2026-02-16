"use client";

import React, { useState } from "react";
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ATSCheckerView = () => {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setResults(null);
    }
  };

  const analyzeResume = async () => {
    if (!file) return;

    setAnalyzing(true);
    
    // Simulate AI analysis - Replace with actual API call
    setTimeout(() => {
      setResults({
        score: 78,
        strengths: [
          "Clear professional summary",
          "Quantified achievements",
          "Relevant keywords present",
          "Proper formatting and structure"
        ],
        improvements: [
          "Add more industry-specific keywords",
          "Include metrics for recent projects",
          "Expand technical skills section",
          "Add LinkedIn profile URL"
        ],
        keywords: {
          found: ["JavaScript", "React", "Node.js", "Python", "AWS"],
          missing: ["Docker", "Kubernetes", "CI/CD", "Microservices"]
        }
      });
      setAnalyzing(false);
    }, 3000);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBg = (score) => {
    if (score >= 80) return "bg-green-500/10";
    if (score >= 60) return "bg-yellow-500/10";
    return "bg-red-500/10";
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Your Resume
          </CardTitle>
          <CardDescription>
            Upload your resume in PDF format to get an instant ATS score and detailed feedback
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="resume-upload"
            />
            <label
              htmlFor="resume-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <FileText className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm font-medium">
                {file ? file.name : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-muted-foreground">PDF (MAX. 10MB)</p>
            </label>
          </div>

          {file && (
            <Button
              onClick={analyzeResume}
              disabled={analyzing}
              className="w-full"
            >
              {analyzing ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Analyze Resume
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {results && (
        <div className="space-y-4">
          {/* Score Card */}
          <Card className={getScoreBg(results.score)}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Your ATS Score</span>
                <Badge variant="outline" className="text-lg">
                  <Sparkles className="w-4 h-4 mr-1" />
                  AI-Powered
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className={`text-6xl font-bold ${getScoreColor(results.score)}`}>
                  {results.score}
                </div>
                <div className="flex-1">
                  <Progress value={results.score} className="h-4" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {results.score >= 80 && "Excellent! Your resume is well-optimized for ATS."}
                    {results.score >= 60 && results.score < 80 && "Good, but there's room for improvement."}
                    {results.score < 60 && "Needs improvement to pass ATS screening."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-500">
                  <CheckCircle className="h-5 w-5" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {results.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-500">
                  <AlertCircle className="h-5 w-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {results.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Keywords Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Keyword Analysis</CardTitle>
              <CardDescription>
                Keywords are crucial for passing ATS screening
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Found Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                  {results.keywords.found.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-500/10">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  Missing Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                  {results.keywords.missing.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="bg-red-500/10">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              Want to improve your resume? Use our <a href="/resume" className="font-medium underline">Resume Builder</a> to create an ATS-optimized resume.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

export default ATSCheckerView;
