import TrackChecklist from '@/components/roadmap/TrackChecklist';
import { ragTrack } from '@/lib/career-learning-tracks';

export const metadata = {
  title: 'EvidenceOps RAG & Agent Interview Topics | ManuOS',
  description: '262 numbered EvidenceOps topics mapped file by file: Python, RAG, embeddings, FastAPI, MCP, agents, SQL and reliability.',
};

export default function RagInterviewPage() {
  return <TrackChecklist track={ragTrack} />;
}
