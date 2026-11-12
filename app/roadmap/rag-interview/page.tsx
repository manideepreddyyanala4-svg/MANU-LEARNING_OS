import TrackChecklist from '@/components/roadmap/TrackChecklist';
import { ragTrack } from '@/lib/career-learning-tracks';

export const metadata = {
  title: 'Beginner LLM → RAG → MCP Learning Path | ManuOS',
  description: 'Learn 262 LLM/RAG/MCP topics in 19 beginner-to-interview stages, with easy explanations, tiny practice examples, and saved progress.',
};

export default function RagInterviewPage() {
  return <TrackChecklist track={ragTrack} />;
}
