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
      <body className="min-h-screen bg-picslive-dark text-picslive-chalk antialiased selection:bg-picslive-gold selection:text-picslive-dark">
        {children}
      </body>
    </html>
  );
}

