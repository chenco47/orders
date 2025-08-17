import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "שופרסל אונליין",
  description: "קניות אונליין משופרסל - מוצרי מזון, פירות וירקות, מוצרי חלב ועוד",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
