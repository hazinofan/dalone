import React, { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  LogOut,
  Menu,
  MoreHorizontal,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Join } from "@/component/Join";
import { SignIn } from "@/component/SignIn";
import Link from "next/link";
import { useRouter } from "next/router";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLLIElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  const serviceOptions = ["Coiffure", "Plomberie", "Électricité", "Jardinage"];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        servicesRef.current &&
        !servicesRef.current.contains(e.target as Node)
      ) {
        setServicesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("dalone:token");
    if (!token) return;

    fetch("http://localhost:3001/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((me) => {
        console.log("User info:", me);
        setUser(me);
      })
      .catch((err) => {
        console.warn("Failed to load user:", err);
        localStorage.removeItem("dalone:token");
        setUser(null);
      });
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("dalone:token");
    setUser(null);
    router.push("/");
  };

  return (
    <header className="bg-white rounded-2xl shadow px-6 pt-4 mx-4 my-6 md:py-4">
      <div className="px-16 mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-12">
          <Link href="/" className="text-2xl font-bold text-blue-950">
            DALONE
          </Link>

          <nav className="hidden md:block">
            <ul className="flex items-center space-x-8 text-gray-600">
              <li className="hover:text-gray-900 cursor-pointer">Accueil</li>

              {/* Services desktop */}
              <li ref={servicesRef} className="relative">
                <button
                  onClick={() => setServicesOpen((o) => !o)}
                  className="flex items-center hover:text-gray-900 cursor-pointer focus:outline-none"
                >
                  Services
                  <ChevronDown className="ml-1" size={16} />
                </button>
                <ul
                  className={` absolute left-0 top-full mt-2 w-40 bg-white rounded-md shadow-lg transform transition-all duration-200 origin-top ${
                    servicesOpen
                      ? "opacity-100 scale-100 pointer-events-auto"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  {serviceOptions.map((name) => (
                    <li
                      key={name}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer whitespace-nowrap"
                      onClick={() => setServicesOpen(false)}
                    >
                      {name}
                    </li>
                  ))}
                </ul>
              </li>

              <li className="hover:text-gray-900 cursor-pointer">À propos</li>
              <li className="hover:text-gray-900 cursor-pointer">Blog</li>
            </ul>
          </nav>
        </div>

        {/* Center: Search (hidden on mobile) */}
        <div className="hidden md:block relative w-full max-w-md">
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <Input
            type="text"
            placeholder="Try ‘Lotus GT 430’"
            className="pl-12 pr-4 py-2 w-full rounded-full bg-gray-100
                       focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        {/* Right: Login + Hamburger */}
        <div className="flex items-center space-x-2">
          {/* Login button (desktop only) */}
          {user ? (
            <div className="flex items-center gap-4">
              {/* User info with avatar and name */}
              <div className="flex items-center gap-3 group">
                <Avatar className="h-9 w-9 border-2 border-white shadow">
                  <AvatarImage src={user.avatar} alt={user.email} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    {user.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user.email.split("@")[0]}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-[160px]">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Dropdown menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.email.split("@")[0]}
                      </p>
                      <p className="text-xs leading-none text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-red-600 focus:text-red-700 focus:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <SignIn className="text-sm font-medium px-4 py-2 hover:bg-gray-100 rounded-md transition-colors" />
              <Join className="text-sm font-medium px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-md hover:from-blue-600 hover:to-purple-600 transition-colors shadow-sm" />
            </div>
          )}

          {/* Hamburger (mobile only) */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={` md:hidden mt-4 space-y-4 transform transition-all duration-200 origin-top ${
          mobileOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 h-0 overflow-hidden"
        } `}
      >
        {/* Nav links */}
        <nav>
          <ul className="flex flex-col space-y-2 text-gray-600">
            <li className="hover:text-gray-900 cursor-pointer">Accueil</li>

            {/* Services mobile */}
            <li ref={servicesRef} className="relative">
              <button
                onClick={() => setServicesOpen((o) => !o)}
                className="flex items-center hover:text-gray-900 cursor-pointer focus:outline-none"
              >
                Services
                <ChevronDown className="ml-1" size={16} />
              </button>
              <ul
                className={` pl-4 mt-1 flex flex-col space-y-1 transform transition-all duration-200 origin-top ${
                  servicesOpen
                    ? "opacity-100 scale-100 pointer-events-auto"
                    : "opacity-0 scale-95 pointer-events-none"
                } transition-all duration-150 origin-top ${
                  servicesOpen ? "block" : "hidden"
                }`}
              >
                {serviceOptions.map((name) => (
                  <li
                    key={name}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer whitespace-nowrap"
                    onClick={() => {
                      setServicesOpen(false);
                      setMobileOpen(false);
                    }}
                  >
                    {name}
                  </li>
                ))}
              </ul>
            </li>

            <li className="hover:text-gray-900 cursor-pointer">À propos</li>
            <li className="hover:text-gray-900 cursor-pointer">Blog</li>
          </ul>
        </nav>

        {/* Search mobile */}
        <div className="relative w-full">
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <Input
            type="text"
            placeholder="Try ‘Lotus GT 430’"
            className="pl-12 pr-4 py-2 w-full rounded-full bg-gray-100
                       focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        {/* Login mobile */}
        <Button
          className="flex w-full justify-center items-center space-x-2 bg-blue-900 hover:bg-blue-950 text-white rounded-full px-6 py-2"
          onClick={() => setMobileOpen(false)}
        >
          <span>Login</span>
        </Button>
      </div>
    </header>
  );
};

export default Navbar;
