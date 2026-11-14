import TrackChecklist from '@/components/roadmap/TrackChecklist';
import { ragTrack } from '@/lib/career-learning-tracks';

export const metadata = {
  title: 'Project 2: 100 Sequential EvidenceOps Topics | ManuOS',
  description: 'Study 100 EvidenceOps topics from LLM and Python foundations through retrieval, RAG verification, APIs, MCP agents, evaluation and interviews.',
};

export default function RagInterviewPage() {
  return <TrackChecklist track={ragTrack} />;
}
