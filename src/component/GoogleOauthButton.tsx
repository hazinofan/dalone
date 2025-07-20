// components/GoogleButton.tsx
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

declare global {
  interface Window {
    google: any;
  }
}

// Shape of what our backend returns from POST /auth/google
interface GoogleAuthResponse {
  access_token: string;
  user: {
    sub: number;
    email: string;
    role: string;
  };
  isNew: boolean;
}

// Props for GoogleButton: a function to call on success
interface GoogleButtonProps {
  onLoginSuccess: (data: {
    access_token: string;
    user: { sub: number; email: string; role: string };
    isNew: boolean;
  }) => void;
}

export function GoogleButton({ onLoginSuccess }: GoogleButtonProps) {
  const router = useRouter();
  const container = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState(false);
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    // Guard: only run once, and only when `window.google` is loaded
    if (rendered || typeof window === "undefined" || !window.google) return;
    if (!container.current) return;

    // 1) Initialize the Google Identity services library
    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      callback: async (resp: { credential: string }) => {
        const idToken = resp.credential;
        try {
          const r = await fetch(`${BACKEND_URL}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });

          console.log("[back] status:", r.status);
          const data: GoogleAuthResponse = await r.json();
          console.log("[back] json:", data);

          if (!r.ok) {
            throw new Error((data as any).message || "Error from backend");
          }

          // 2) Instead of doing router.push here, call onLoginSuccess:
          onLoginSuccess({
            access_token: data.access_token,
            user: data.user,
            isNew: data.isNew,
          });
        } catch (err) {
          console.error("Google login failed:", err);
          alert("Google login failed: " + (err as Error).message);
        }
      },
    });

    // 3) Render the official “Sign in with Google” button into our container
    window.google.accounts.id.renderButton(container.current, {
      theme: "outline",
      size: "large",
      width: "100%",
    });

    setRendered(true);
  }, [rendered, onLoginSuccess, router]);

  return (
    <div
      ref={container}
      style={{ width: "100%", marginTop: 16, borderRadius: "10px" }}
    />
  );
}
