import type { Metadata } from "next";
import "./globals.css";
import "./brand.css";

export const metadata: Metadata = {
  title: "Hyväksyntäpaketit · YhetPuheet",
  description: "YhetPuheet Median yhteinen työtila käsikirjoitusten ja videoiden hyväksyntään.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fi">
      <body className="antialiased">{children}</body>
    </html>
  );
}

