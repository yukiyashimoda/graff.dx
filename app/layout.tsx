import type { Metadata } from "next";
import { Jersey_10, Space_Grotesk, Inter, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";

const jersey10 = Jersey_10({
  weight: "400",
  variable: "--ff-jersey",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--ff-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  weight: ["400", "700"],
  variable: "--ff-inter",
  subsets: ["latin"],
  display: "swap",
});

const zenKaku = Zen_Kaku_Gothic_New({
  weight: ["400", "700"],
  variable: "--ff-zen-kaku",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GRAFF. | ARCHITECTURAL OS",
  description: "アナログな現場に、デジタルな鼓動を。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`dark ${jersey10.variable} ${spaceGrotesk.variable} ${inter.variable} ${zenKaku.variable}`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
