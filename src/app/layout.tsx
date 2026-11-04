import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PicsLive · by CreatifPics",
  description: "Système de récupération de photos d'événement par reconnaissance faciale en direct.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className="min-h-screen bg-night text-chalk antialiased selection:bg-gold selection:text-night">
        {children}
      </body>
    </html>
  );
}

