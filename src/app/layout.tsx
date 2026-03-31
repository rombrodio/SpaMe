import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SpaMe - Spa Management',
  description: 'Spa management system for scheduling, payments, and customer communication',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased font-sans">{children}</body>
    </html>
  );
}
