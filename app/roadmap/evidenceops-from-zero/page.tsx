import TrackChecklist from '@/components/roadmap/TrackChecklist';
import { ragTrack } from '@/lib/career-learning-tracks';

export const metadata = {
  title: 'EvidenceOps Project 2 | LLM, RAG & MCP From Zero to Interview | ManuOS',
  description: '100 sequential beginner lessons in 12 stages, with understanding, mechanism, worked examples, mistakes, independent practice and interview checks. Separate from the dorsal-hand CV roadmap.',
};

export default function EvidenceOpsFromZero() {
  return <TrackChecklist track={ragTrack} />;
}
