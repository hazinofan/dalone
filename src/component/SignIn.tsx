// components/LoginModal.tsx
import React, { useState } from 'react'
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Check } from 'lucide-react'
import { Fira_Sans } from "next/font/google";
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
const fira = Fira_Sans({ subsets: ["latin"], weight: ["300", "400", "700"] });

export function SignIn() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [accountType, setAccountType] = useState<any>("user")

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="cursor-pointer text-gray-600 hover:text-blue-950 hover:underline" variant="outline">Sign in</Button>
            </DialogTrigger>
            <DialogContent className={`${fira.className} max-w-5xl p-0 overflow-hidden w-[900px] h-[600px] max-h-[90vh] rounded-xl`}>
                <div className="flex h-full">
                    {/* Left marketing panel */}
                    <div className="hidden md:flex flex-col justify-between w-1/2 bg-[url('/assets/login-bg.png')]  /* set your image path */ bg-cover bg-centertext-white p-8">
                        <div>
                            <h2 className="text-4xl pt-5 font-semibold mb-6" >Success starts here</h2>
                            <ul className="space-y-4 text-lg font-semibold pt-5">
                                {[
                                    'Over 700 categories',
                                    'Quality work done faster',
                                    'Access to talent and businesses across the globe',
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
                        <h1 className=' text-4xl text-blue-950 font-semibold pt-6 mb-5 self-center'> DALONE </h1>
                        <div className="mb-5">
                            <DialogHeader>
                                <DialogTitle className="text-2xl self-center">Sign in to your account</DialogTitle>
                                <DialogDescription className="mb-6 self-center">
                                    Don’t have an account?{' '}
                                    <a href="/register" className="text-blue-900 pb-5 hover:underline">
                                        Join here
                                    </a>
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        <RadioGroup
                            value={accountType}
                            onValueChange={(v) => setAccountType(v as "user" | "pro")}
                            className="flex items-center space-x-8 mb-5"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem id="type-user" value="user" />
                                <Label
                                    htmlFor="type-user"
                                    className="inline-block"
                                >
                                    Compte Utilisateur
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <RadioGroupItem id="type-pro" value="pro" />
                                <Label
                                    htmlFor="type-pro"
                                    className="inline-block"
                                >
                                    Compte Professionnel
                                </Label>
                            </div>
                        </RadioGroup>


                        {/* Google button */}
                        <Button variant="outline" className="w-full mb-4 justify-center py-3 text-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="150" height="150" viewBox="0 0 48 48">
                                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                            </svg>
                            Continue with Google
                        </Button>

                        {/* Email separator */}
                        <div className="flex items-center mb-4">
                            <Separator className="flex-1" />
                            <span className="px-2 text-sm text-gray-500">OR</span>
                            <Separator className="flex-1" />
                        </div>

                        {/* Email / password form */}
                        <form className="flex-1 flex flex-col" onSubmit={(e) => e.preventDefault()}>
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
                                <Button type="submit" className="w-full py-3 mb-3 bg-blue-950 hover:bg-[#121d3a] transition-colors">
                                    Continue with Email
                                </Button>
                            </DialogFooter>
                        </form>
                        <div className="text-xs">
                            By joining, you agree to the Dalone Terms of Service and to occasionally receive emails from us. Please read our Privacy Policy to learn how we use your personal data
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
