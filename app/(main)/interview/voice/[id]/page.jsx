import { getVoiceInterviews } from "@/actions/voice-interview";
import { redirect } from "next/navigation";
import VoiceInterviewSession from "./_components/voice-interview-session";

export default async function VoiceInterviewPage({ params }) {
  const { id } = await params;
  const voiceInterviews = await getVoiceInterviews();
  const interview = voiceInterviews.find((i) => i.id === id);

  if (!interview) {
    redirect("/interview");
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <VoiceInterviewSession interview={interview} />
    </div>
  );
}
