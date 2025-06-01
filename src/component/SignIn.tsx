// components/LoginModal.tsx
import React, { useState } from "react";
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
import { useRouter } from "next/router";
import { GoogleButton } from "./GoogleOauthButton";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
const fira = Fira_Sans({ subsets: ["latin"], weight: ["300", "400", "700"] });

export function SignIn() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false);

  function handleAuthSuccess(payload: {
    access_token: string;
    user: { sub: number; email: string; role: string };
  }) {
    // 1) store the JWT
    localStorage.setItem("dalone:token", payload.access_token);

    // 2) close the modal
    setOpen(false);

    const { role, sub } = payload.user;

    // 3) redirect based on role
    if (role === "pending") {
      router.push({
        pathname: "/finish-joining",
        query: { token: payload.access_token },
      });
    } else if (role === "client") {
      router.push(`/profile/${sub}`);
    } else if (role === "professional") {
      router.push(`/profile/professional/${sub}`);
    } else {
      // fallback
      router.push("/");
    }
  }


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.message || "Login failed");
      }

      // unpack
      const { access_token } = body as {
        access_token: string;
        user: { sub: number; email: string; role: string };
      };

      // store the raw JWT
      localStorage.setItem("dalone:token", access_token);

      // close the dialog
      setOpen(false);
      window.location.reload()
    } catch (err) {
      console.error(err);
      toast({
        title: "Error while authentificating !",
        description: { err },
      })
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Toaster />
      <DialogTrigger asChild>
        <Button
          className="cursor-pointer text-gray-600 hover:text-blue-950 hover:underline"
          variant="outline"
        >
          Sign in
        </Button>
      </DialogTrigger>
      <DialogContent
        className={`${fira.className} max-w-5xl p-0 overflow-hidden w-[900px] h-[600px] max-h-[90vh] rounded-xl`}
      >
        <div className="flex h-full">
          {/* Left marketing panel */}
          <div className="hidden md:flex flex-col justify-between w-1/2 bg-[url('/assets/login-bg.png')]  /* set your image path */ bg-cover bg-centertext-white p-8">
            <div>
              <h2 className="text-4xl pt-5 font-semibold mb-6">
                Success starts here
              </h2>
              <ul className="space-y-4 text-lg font-semibold pt-5">
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
          <div className="flex flex-col w-full md:w-1/2 p-8 pb-4">
            <h1 className=" text-4xl text-blue-950 font-semibold pt-6 mb-5 self-center">
              {" "}
              DALONE{" "}
            </h1>
            <div className="mb-5">
              <DialogHeader>
                <DialogTitle className="text-2xl self-center">
                  Sign in to your account
                </DialogTitle>
                <DialogDescription className="mb-6 self-center">
                  Don’t have an account?{" "}
                  <a
                    href="/register"
                    className="text-blue-900 pb-5 hover:underline"
                  >
                    Join here
                  </a>
                </DialogDescription>
              </DialogHeader>
            </div>

            {/* Google button */}
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
            <form className="flex-1 flex flex-col" onSubmit={handleLogin}>
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
                  className="w-full py-3 bg-blue-950 hover:bg-[#121d3a] text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Continue with Email"}
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
