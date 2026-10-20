import './globals.css'; import { ThemeProvider } from 'next-themes'; import { Shell } from '@/components/shell';
export const metadata={title:'MANU — Learning OS',description:'A calm operating system for learning.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" suppressHydrationWarning><body><ThemeProvider attribute="class" defaultTheme="system" enableSystem><Shell>{children}</Shell></ThemeProvider></body></html>}
