// pages/_app.tsx
import Navbar from "@/layouts/Navbar";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Fira_Sans } from "next/font/google";

const ubuntu = Fira_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${ubuntu.className} font-medium`}>
      <Navbar />
      <Component {...pageProps} />
    </main>
  );
}
