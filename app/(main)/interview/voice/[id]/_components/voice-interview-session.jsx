"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  MicOff,
  Play,
  Pause,
  SkipForward,
  CheckCircle,
  Volume2,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import {
  updateVoiceInterviewResponse,
  completeVoiceInterview,
} from "@/actions/voice-interview";

const VoiceInterviewSession = ({ interview }) => {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isCompleted, setIsCompleted] = useState(interview.status === "completed");
  const [recordedAnswers, setRecordedAnswers] = useState(interview.userResponses || []);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const transcriptRef = useRef(""); // Keep track of transcript
  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);

  const questions = interview.questions;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  useEffect(() => {
    // Initialize Speech Recognition
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPiece + " ";
          } else {
            interimTranscript += transcriptPiece;
          }
        }

        if (finalTranscript) {
          transcriptRef.current += finalTranscript;
          setTranscript(transcriptRef.current);
        } else {
          setTranscript(transcriptRef.current + interimTranscript);
        }
      };
    }
  }, []);

  const startRecording = async () => {
    try {
      setTranscript("");
      transcriptRef.current = ""; // Clear transcript ref
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(blob);

        // Use the ref for the final transcript value
        const finalTranscript = transcriptRef.current.trim();
        
        // Save response with the captured transcript
        const response = {
          audioUrl,
          transcript: finalTranscript || "No transcript available",
          duration: Date.now(),
        };

        const updatedAnswers = [...recordedAnswers];
        updatedAnswers[currentQuestion] = response;
        setRecordedAnswers(updatedAnswers);

        // Update in database
        try {
          await updateVoiceInterviewResponse(interview.id, currentQuestion, response);
          console.log("Response saved:", response);
        } catch (err) {
          console.error("Failed to save response:", err);
          alert("Failed to save your response. Please try again.");
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      recognitionRef.current?.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please allow microphone permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      recognitionRef.current?.stop();
      setIsRecording(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTranscript("");
    }
  };

  const handleComplete = async () => {
    setIsProcessing(true);
    try {
      await completeVoiceInterview(interview.id);
      setIsCompleted(true);
      // Refresh the page to show results
      router.refresh();
    } catch (error) {
      console.error("Error completing interview:", error);
      alert("Failed to complete interview. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isCompleted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            Interview Completed!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8">
            <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            {interview.overallScore && (
              <div className="mb-4">
                <h3 className="text-4xl font-bold text-green-500 mb-2">
                  {interview.overallScore.toFixed(0)}%
                </h3>
                <p className="text-muted-foreground">Overall Score</p>
              </div>
            )}
            {!interview.overallScore && (
              <div className="mb-4">
                <h3 className="text-2xl font-bold mb-2">
                  Interview Submitted
                </h3>
                <p className="text-muted-foreground">Your responses have been recorded</p>
              </div>
            )}
          </div>

          {interview.feedback && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">AI Feedback</h4>
              <p className="text-sm text-muted-foreground">{interview.feedback}</p>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-semibold">Your Responses</h4>
            {questions.map((q, index) => {
              const userResponse = interview.userResponses?.[index] || recordedAnswers[index];
              return (
                <div key={index} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <p className="font-medium">Q{index + 1}: {q.question}</p>
                    <Badge variant="outline">{q.difficulty}</Badge>
                  </div>
                  
                  {userResponse ? (
                    <div className="space-y-2">
                      <div className="p-3 bg-muted/50 rounded">
                        <p className="text-sm font-medium mb-1">Your Answer:</p>
                        <p className="text-sm text-muted-foreground">
                          {userResponse.transcript || "No transcript available"}
                        </p>
                      </div>
                      
                      {q.expectedPoints && q.expectedPoints.length > 0 && (
                        <div className="p-3 bg-blue-500/5 rounded border border-blue-500/20">
                          <p className="text-sm font-medium mb-1 text-blue-600">Key Points to Cover:</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {q.expectedPoints.map((point, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-blue-500 mt-1">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No response recorded</p>
                  )}
                </div>
              );
            })}
          </div>

          <Button onClick={() => router.push("/interview")} className="w-full">
            Back to Interviews
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <Badge>{interview.category}</Badge>
          </div>
          <Progress value={progress} />
        </CardContent>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Interview Question
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 bg-muted rounded-lg">
            <p className="text-lg font-medium">{questions[currentQuestion].question}</p>
          </div>

          {/* Recording Controls */}
          <div className="text-center space-y-4">
            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto">
              {isRecording ? (
                <div className="animate-pulse">
                  <Mic className="h-16 w-16 text-purple-500" />
                </div>
              ) : (
                <MicOff className="h-16 w-16 text-muted-foreground" />
              )}
            </div>

            <div className="space-y-2">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  size="lg"
                  className="w-full max-w-xs"
                  disabled={recordedAnswers[currentQuestion]}
                >
                  <Mic className="h-5 w-5 mr-2" />
                  Start Recording
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  size="lg"
                  variant="destructive"
                  className="w-full max-w-xs"
                >
                  <Pause className="h-5 w-5 mr-2" />
                  Stop Recording
                </Button>
              )}

              {transcript && (
                <div className="p-4 bg-muted rounded-lg max-w-xl mx-auto">
                  <p className="text-sm">
                    <strong>Live Transcript:</strong> {transcript}
                  </p>
                </div>
              )}

              {recordedAnswers[currentQuestion] && (
                <p className="text-sm text-green-500 flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Answer recorded
                </p>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            {currentQuestion < questions.length - 1 ? (
              <Button
                onClick={nextQuestion}
                className="flex-1"
                disabled={!recordedAnswers[currentQuestion]}
              >
                Next Question
                <SkipForward className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                className="flex-1"
                disabled={!recordedAnswers[currentQuestion] || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Interview
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              🎤 Speak clearly in English • Take your time • Be authentic
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceInterviewSession;
