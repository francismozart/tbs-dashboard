import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "The Brevio Sync — Content Dashboard",
  description: "Acompanhe, copie e publique o conteúdo do flywheel.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={spaceGrotesk.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
