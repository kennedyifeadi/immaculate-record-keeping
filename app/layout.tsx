// @ts-expect-error: missing type declarations for CSS side-effect import
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Imaculate Sales Logger',
  description: 'Vendor Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <div className="flex min-h-screen">
          <Sidebar />
          {/* Main Content Wrapper - Pushes content to the right of sidebar */}
          <main className="flex-1 ml-64 p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}