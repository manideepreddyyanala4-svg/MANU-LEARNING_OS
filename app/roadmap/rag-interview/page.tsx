import TrackChecklist from '@/components/roadmap/TrackChecklist';
import { ragTrack } from '@/lib/career-learning-tracks';

export const metadata = {
  title: '34 Essentials: Beginner LLM → RAG → MCP | ManuOS',
  description: 'Learn just 34 essential AI engineering lessons, from basic Python and LLMs to RAG, MCP, testing and interviews. No unnecessary frameworks.',
};

export default function RagInterviewPage() {
  return <TrackChecklist track={ragTrack} />;
}
