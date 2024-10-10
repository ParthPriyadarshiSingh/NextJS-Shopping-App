// layout.tsx - Stays as Server Component

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping - Upload",
  description: "Upload your files easily using app",
  alternates: {
    canonical: `/products/upload`,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    // Do what you need to do
    <>{children}</>
  );
}
