import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TaskEcho",
  description: "Simple task tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "sans-serif", maxWidth: 600, margin: "40px auto", padding: "0 16px" }}>
        {children}
      </body>
    </html>
  );
}
