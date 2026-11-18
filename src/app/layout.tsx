import type { Metadata, Viewport } from "next";
import { Caveat, Onest, Unbounded } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800"],
});

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "latin-ext"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin", "latin-ext"],
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "Nihol — maktab uçun eng yaxşi SI‑yordamçi",
  description:
    "Öqituvçi, öquvçi va ota‑ona uçun eng yaxşi SI asosidagi taʼlim vositasi: dars materialidan bir zumda test tuzadi, har bir xatoning ildizini topadi va bilimni niholdek östiradi.",
};

export const viewport: Viewport = {
  themeColor: "#fbfaf5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uz" className={`${unbounded.variable} ${onest.variable} ${caveat.variable} h-full antialiased`}>
      <body className="bg-katak flex min-h-full flex-col">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
