import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Check } from "lucide-react";
import { Fira_Sans } from "next/font/google";
import { GoogleButton } from "./GoogleOauthButton";
import { useRouter } from "next/router";
import { Toaster } from "@/components/ui/toaster";
const fira = Fira_Sans({ subsets: ["latin"], weight: ["300", "400", "700"] });

interface JoiningProps {
  className?: string;
}

export function Join({ className }: JoiningProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL

  function handleAuthSuccess(payload: {
    access_token: string;
    user: { sub: number; email: string; role: string };
    isNew: boolean;
  }) {
    localStorage.setItem("dalone:token", payload.access_token);
    setOpen(false);

    const { role, sub } = payload.user;

    if (role === "pending") {
      router.replace(`/finish-joining?token=${encodeURIComponent(payload.access_token)}`);
    } else if (role === "client") {
      router.replace(`/profile/${sub}`);
    } else if (role === "professional") {
      router.replace(`/profile/professional/${sub}`);
    } else {
      router.replace("/");
    }
  }

  const handleSignUp = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json();
      const token = body.access_token.access_token;
      if (!res.ok) throw new Error(body.message);

      localStorage.setItem("dalone:token", token);
      router.replace(`/finish-joining?token=${encodeURIComponent(token)}`);
    } catch (error) {
      console.error(error, " Error while authentificating !");
    }
  };

  useEffect(() => {
    if (router.pathname === "/finish-joining") {
      setOpen(false);
    }
  }, [router.pathname]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => setOpen(isOpen)}>
      <Toaster />
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          className="md:flex items-center space-x-2 bg-blue-900 hover:bg-blue-950 text-white hover:text-white rounded-full px-10 py-2"
          variant="outline"
        >
          Join
        </Button>
      </DialogTrigger>
      <DialogContent
        className={`${fira.className} p-0 overflow-hidden rounded-xl w-[95vw] max-w-[900px] h-[95vh] max-h-[600px] md:h-[600px] md:max-h-[90vh]`}
      >
        <div className="flex flex-col md:flex-row h-full">
          {/* Left marketing panel - hidden on mobile */}
          <div className="hidden md:flex flex-col justify-between w-1/2 bg-[url('/assets/login-bg.png')] bg-cover bg-center text-white p-8">
            <div>
              <h2 className="text-4xl pt-5 font-semibold mb-6 text-black">
                Success starts here
              </h2>
              <ul className="space-y-4 text-lg font-semibold pt-5 text-black">
                {[
                  "Over 700 categories",
                  "Quality work done faster",
                  "Access to talent and businesses across the globe",
                ].map((line) => (
                  <li key={line} className="flex items-start">
                    <Check className="mt-1 mr-2" size={20} />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <img
              src="/assets/login-illustration.png"
              alt=""
              className="rounded-b-lg mt-4 object-cover w-full"
            />
          </div>

          {/* Right sign-in form */}
          <div className="flex flex-col w-full md:w-1/2 p-6 pb-4 overflow-y-auto">
            <h1 className="text-3xl md:text-4xl text-blue-950 font-semibold mb-5 self-center">
              DALONE
            </h1>
            
            <DialogHeader>
              <DialogTitle className="text-2xl self-center">
                Create a new account
              </DialogTitle>
              <DialogDescription className="mb-6 self-center">
                Already have an account?{" "}
                <a
                  href="/register"
                  className="text-blue-900 pb-5 hover:underline"
                >
                  Sign in
                </a>
              </DialogDescription>
            </DialogHeader>

            <div className="mb-5">
              <GoogleButton onLoginSuccess={handleAuthSuccess} />
            </div>

            {/* Email separator */}
            <div className="flex items-center mb-4">
              <Separator className="flex-1" />
              <span className="px-2 text-sm text-gray-500">OR</span>
              <Separator className="flex-1" />
            </div>

            {/* Email / password form */}
            <form
              className="flex-1 flex flex-col"
              onSubmit={(e) => {
                e.preventDefault();
                handleSignUp();
              }}
            >
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mb-4"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mb-6"
              />

              <DialogFooter className="flex flex-col">
                <Button
                  type="submit"
                  className="w-full py-3 mb-3 bg-blue-950 hover:bg-[#121d3a] transition-colors"
                >
                  Continue with Email
                </Button>
              </DialogFooter>
            </form>

            <div className="text-xs">
              By joining, you agree to the Dalone Terms of Service and to
              occasionally receive emails from us. Please read our Privacy
              Policy to learn how we use your personal data
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}