import type { Metadata } from 'next';
import { AseQuickPrep } from '@/components/ase-quick-prep';

export const metadata: Metadata = {
  title: 'ASE Semiconductor Quick Prep — MANU OS',
  description: 'Fast interview revision for semiconductor flow, ASE packaging and test, CP vs FT, and Product Test Engineer basics.',
};

export default function AseQuickPrepPage() {
  return <AseQuickPrep />;
}
