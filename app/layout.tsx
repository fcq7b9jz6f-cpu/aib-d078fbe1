import { Tajawal } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';

const tajawal = Tajawal({ 
  subsets: ['arabic'], 
  weight: ['400', '500', '700'] 
});

export const metadata: Metadata = {
  title: 'مساعد الذكاء الاصطناعي',
  description: 'تطبيق دردشة مع الذكاء الاصطناعي مبني بتقنيات الويب الحديثة.',
};

export default function RootLayout({
  children,
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={tajawal.className}>{children}</body>
    </html>
  );
}