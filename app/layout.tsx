import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "allo-font";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Wonderstruck",
    template: "%s · Wonderstruck",
  },
  description:
    "Less doomscrolling. More wondering. Discover fascinating ideas, explore them with Mira, and remember what you learn.",
};

// Kept inline (not in globals.css) so the greeting never shows every variant, even with stale CSS.
const daypartStyle = `.daypart{display:none}:root:not([data-daypart]) .daypart-evening,:root[data-daypart=morning] .daypart-morning,:root[data-daypart=afternoon] .daypart-afternoon,:root[data-daypart=evening] .daypart-evening,:root[data-daypart=night] .daypart-night{display:inline}`;

const daypartScript = `(function(){var h=new Date().getHours();document.documentElement.dataset.daypart=h<5?"night":h<12?"morning":h<17?"afternoon":h<21?"evening":"night"})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: daypartStyle }} />
        <script dangerouslySetInnerHTML={{ __html: daypartScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
      </body>
    </html>
  );
}
