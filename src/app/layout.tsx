import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "FF Giveaway — Free Fire Hadiah Gratis",
    template: "%s | FF Giveaway",
  },
  description:
    "Ikuti giveaway Free Fire dan menangkan Diamond, Elite Pass, Bundle Evo Gun, dan hadiah eksklusif lainnya! Daftar sekarang dan rebut hadiahmu.",
  keywords: ["free fire", "giveaway", "diamond", "elite pass", "bundle", "ff"],
  openGraph: {
    title: "FF Giveaway — Free Fire Hadiah Gratis",
    description: "Ikuti giveaway Free Fire dan menangkan hadiah eksklusif!",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FF Giveaway — Free Fire Hadiah Gratis",
    description: "Ikuti giveaway Free Fire dan menangkan hadiah eksklusif!",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              border: "3px solid #0A0A0A",
              padding: "12px 16px",
              color: "#0A0A0A",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: "600",
              boxShadow: "4px 4px 0px 0px #0A0A0A",
              borderRadius: "0px",
            },
            success: {
              style: {
                background: "#FFE600",
              },
              iconTheme: {
                primary: "#0A0A0A",
                secondary: "#FFE600",
              },
            },
            error: {
              style: {
                background: "#FF1744",
                color: "#FAFAFA",
                border: "3px solid #0A0A0A",
              },
              iconTheme: {
                primary: "#FAFAFA",
                secondary: "#FF1744",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
