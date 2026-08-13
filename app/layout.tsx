import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "./components/Sidebar";
import { getNav } from "./lib/content";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Code Standard",
    template: "%s — Code Standard",
  },
  description: "AI কোডিং এজেন্টের জন্য imperative নিয়মের সেট।",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const sections = getNav().map((section) => ({
    name: section.name,
    docs: section.docs.map((doc) => ({ route: doc.route, title: doc.title })),
  }));

  return (
    <html
      lang="bn"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-slate-200 dark:border-slate-800">
          <div className="mx-auto flex max-w-5xl items-center px-6 py-4">
            <Link href="/" className="font-semibold">
              Code Standard
            </Link>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-10 md:flex-row">
          <aside className="md:w-56 md:shrink-0">
            <Sidebar sections={sections} />
          </aside>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
