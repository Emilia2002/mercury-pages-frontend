import './globals.css';
import { DM_Sans, Playfair_Display } from 'next/font/google';
import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', weight: ['400', '500', '600', '700'] });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', weight: ['500', '600', '700'] });

const CLIENT_ID = "26856400342-efo7b6dbhtfktefstohcqs9he4kg707k.apps.googleusercontent.com"

export const metadata = {
  title: 'Mercury Pages | Adaptive ecommerce creative',
  description: 'Turn product links into distinctive storefronts and launch-ready creative with Mercury Pages.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${playfair.variable} bg-[#fcfafd] text-[#21182b] antialiased`}>
        <AuthProvider>
          <GoogleOAuthProvider clientId={CLIENT_ID}>{children}</GoogleOAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
