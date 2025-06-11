// pages/_app.tsx
import Navbar from "@/layouts/Navbar";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import Head from 'next/head'

const ubuntu = Inter({
  subsets: ["latin"],
  weight: ["500", "700"],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${ubuntu.className} font-medium`}>
      <Head>
        <script
          src="https://accounts.google.com/gsi/client"
          async
          defer
        />
      </Head>
      <Navbar />
      <Component {...pageProps} />
    </main>
  );
}
