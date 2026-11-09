import TrackChecklist from '@/components/roadmap/TrackChecklist';
import { cvTrack } from '@/lib/career-learning-tracks';

export const metadata = {
  title: 'Computer Vision & OpenCV Interview Topics | ManuOS',
  description: '199 numbered topics in a separate Computer Vision track: Python, NumPy, OpenCV, image processing, PyTorch, biometrics and ONNX.',
};

export default function CvInterviewPage() {
  return <TrackChecklist track={cvTrack} />;
}
