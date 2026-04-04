import type { Metadata } from "next";
import { Pacifico, DM_Sans, Fredoka, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/features/cart/cart-context";

const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pacifico",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-fredoka",
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["500", "600"],
  variable: "--font-noto-devanagari",
});

export const metadata: Metadata = {
  title: "Ad Pizza Hub Saifai",
  description: "आपका अपना रेस्टोरेंट सैफई — pizzas, burgers & more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${pacifico.variable} ${dmSans.variable} ${fredoka.variable} ${notoDevanagari.variable} h-full antialiased`}
    >
      <body className="min-h-dvh font-body">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
