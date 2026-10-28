import type { Metadata } from 'next';
import { AseFinalDayPrep } from '@/components/ase-final-day-prep';

export const metadata: Metadata = {
  title: 'ASE Final-Day Interview Prep — MANU OS',
  description: 'One-day ASE PTE interview revision with 113 concise answers, Chinese survival and research defense.',
};

export default function AseFinalDayPage() {
  return <AseFinalDayPrep />;
}
