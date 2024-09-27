import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "@/app/globals.css";
import Header from "@/app/components/header";
import AuthWrapper from "@/app/components/authwrapper";
import {ActiveSectionProvider} from "@/app/context/activesectioncontext";

const rubik = Rubik({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ByteNosh - A Restaurant Management System",
  description: "ByteNosh is a restaurant management system for small businesses.",
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={rubik.className}>
      <ActiveSectionProvider>
      <AuthWrapper>
      <Header/>
      {children}
      </AuthWrapper>
      </ActiveSectionProvider>
      </body>
    </html>
  );
}
