import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meeting Notes Distiller",
  description: "Extract meeting summaries, decisions, actions, and issues."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
