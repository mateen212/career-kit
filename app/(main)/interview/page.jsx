import { getAssessments } from "@/actions/interview";
import { getVoiceInterviews } from "@/actions/voice-interview";
import StatsCards from "./_components/stats-cards";
import PerformanceChart from "./_components/performace-chart";
import QuizList from "./_components/quiz-list";
import VoiceInterviewList from "./_components/voice-interview-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function InterviewPrepPage() {
  const assessments = await getAssessments();
  const voiceInterviews = await getVoiceInterviews();

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-6xl font-bold gradient-title">
          Interview Preparation
        </h1>
      </div>
      <div className="space-y-6">
        <StatsCards assessments={assessments} voiceInterviews={voiceInterviews} />
        <PerformanceChart assessments={assessments} />
        
        <Tabs defaultValue="quiz" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quiz">MCQ Interviews</TabsTrigger>
            <TabsTrigger value="voice">Voice Interviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="quiz">
            <QuizList assessments={assessments} />
          </TabsContent>
          
          <TabsContent value="voice">
            <VoiceInterviewList voiceInterviews={voiceInterviews} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
