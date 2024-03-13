import type {Metadata} from "next";
import { Rubik } from "next/font/google";
import Sidebar from "@/app/components/sidebar";
import "@/app/globals.css";

const rubik = Rubik({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "ByteNosh - A Restaurant Management System",
  description: "ByteNosh is a restaurant management system for small businesses.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <html lang="en">
      <body className={`${rubik.className} flex flex-col`}>
      <Sidebar/>
      <main className="flex-1">
          {children}
      </main>
      </body>
      </html>
  )
}
