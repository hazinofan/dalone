import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  MessageSquareDot,
  MoreHorizontal,
  Search,
  User,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { X, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Join } from "@/component/Join";
import { SignIn } from "@/component/SignIn";
import Link from "next/link";
import { useRouter } from "next/router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getProfile, getUserById } from "../../core/services/auth.service";
import { Inter } from "next/font/google";
import {
  getMyNotifications,
  markNotificationAsRead,
} from "../../core/services/notifications.service";
const fira = Inter({ subsets: ["latin"], weight: ["300", "400", "700"] });

const Navbar = () => {
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLLIElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const router = useRouter();
  const [userRole, setUserRole] = useState("");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const serviceOptions = ["Coiffure", "Plomberie", "Électricité", "Jardinage"];

  const loadCurrentUser = useCallback(async () => {
    const token = localStorage.getItem("dalone:token");
    if (!token) {
      setUser(null);
      return;
    }
    try {
      // 1) Get “me” (to know user.id and user.role)
      const meRes = await fetch("http://localhost:3001/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!meRes.ok) throw new Error("Not authenticated");
      const me = await meRes.json();

      // 2) Fetch full user payload (with clientProfile / professionalProfile)
      const fullUser = await getUserById(me.id);
      setUser(fullUser);

      // 3) Also store the role in lowercase for convenience
      setUserRole(me.role.toLowerCase());
      setUserInfo(me);
    } catch (err) {
      console.warn("Failed to load user:", err);
      localStorage.removeItem("dalone:token");
      setUser(null);
    }
  }, []);

  // On mount (and every time the route changes), re‐load the user:
  useEffect(() => {
    loadCurrentUser();
  }, [router.pathname, loadCurrentUser]);

  // ALSO listen for our custom “user‐logged‐in” event so we can re‐load immediately
  useEffect(() => {
    window.addEventListener("user‐logged‐in", loadCurrentUser);
    return () => {
      window.removeEventListener("user‐logged‐in", loadCurrentUser);
    };
  }, [loadCurrentUser]);

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
      .then(async (me) => {
        const res = await getUserById(me.id);
        console.log("User info:", res);
        setUser(res);
      })
      .catch((err) => {
        console.warn("Failed to load user:", err);
        localStorage.removeItem("dalone:token");
        setUser(null);
      });
  }, [router.pathname]);

  const handleSignOut = () => {
    localStorage.removeItem("dalone:token");
    setUser(null);
    router.push("/");
  };

  // Get user infos
  useEffect(() => {
    getMyNotifications().then(setNotifications).catch(console.error);
    getProfile()
      .then((me) => {
        console.log("Logged-in user:", me);

        // If getProfile() returned null or an object without `role`, bail out
        if (!me || typeof me.role !== "string") {
          console.warn("No role found on the profile object:", me);
          return;
        }

        setUserRole(me.role.toLowerCase());
        setUserInfo(me);
      })
      .catch((err) => {
        console.error("Could not load profile:", err);
      });
  }, []);

  function formatTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} minute(s) ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hour(s) ago`;
    if (diffSec < 172800) return "Yesterday";
    return `${Math.floor(diffSec / 86400)} day(s) ago`;
  }

  return (
    <header className="bg-white rounded-2xl fixed top-3 left-0 right-0 z-30 shadow px-2 md:py-4 pt-4 mx-16">
      <div className=" px-2 md:px-16 mx-auto flex items-center justify-between">
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
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="relative p-2 rounded-full hover:bg-gray-100 transition"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full px-1">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl z-50 border border-gray-100 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="font-semibold text-gray-800">
                        Notifications
                      </h3>
                      <button
                        onClick={() => setShowDropdown(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-6 text-center">
                          <BellOff className="h-8 w-8 text-gray-300 mb-2" />
                          <p className="text-gray-500 text-sm">
                            No new notifications
                          </p>
                        </div>
                      ) : (
                        <ul className="divide-y divide-gray-100">
                          {notifications.map((notif) => (
                            <motion.li
                              key={notif.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.2 }}
                              onClick={async () => {
                                // 1) Mark this notification as read
                                await markNotificationAsRead(notif.id);
                                setNotifications((prev) =>
                                  prev.map((n) =>
                                    n.id === notif.id
                                      ? { ...n, isRead: true }
                                      : n
                                  )
                                );

                                // 2) If it's a "message" notification, navigate to /messages
                                if (notif.type === "message") {
                                  router.push("/messages");
                                }

                                // 3) Close dropdown in any case
                                setShowDropdown(false);
                              }}
                              className={`px-4 py-3 cursor-pointer transition-colors ${
                                notif.isRead ? "bg-white" : "bg-blue-50"
                              } hover:bg-gray-50`}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`mt-0.5 flex-shrink-0 h-2 w-2 rounded-full ${
                                    notif.isRead
                                      ? "bg-transparent"
                                      : "bg-blue-500"
                                  }`}
                                />
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`text-sm ${
                                      notif.isRead
                                        ? "text-gray-600"
                                        : "text-gray-900 font-medium"
                                    } truncate`}
                                  >
                                    {notif.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {formatTimeAgo(notif.createdAt)}
                                  </p>
                                </div>
                                {!notif.isRead && (
                                  <span className="flex-shrink-0 bg-blue-100 text-blue-950 text-xs px-2 py-0.5 rounded-full">
                                    New
                                  </span>
                                )}
                              </div>
                            </motion.li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {notifications.length > 0 && (
                      <div className="border-t border-gray-100 p-2 bg-gray-50">
                        <button
                          onClick={() => {
                            // Implement mark all as read functionality
                            notifications.forEach(async (notif) => {
                              if (!notif.isRead) {
                                await markNotificationAsRead(notif.id);
                              }
                            });
                            setNotifications((prev) =>
                              prev.map((n) => ({ ...n, isRead: true }))
                            );
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 w-full text-center py-2 transition-colors"
                        >
                          Mark all as read
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* User info with avatar and name */}
              <div className="flex items-center gap-3 group">
                <Avatar className="h-9 w-9 border-2 border-white shadow">
                  <AvatarImage
                    src={`${API_BASE_URL}/public/${user.avatar}`}
                    alt={user.email}
                  />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    {
                      user.email
                        ? user.email.charAt(0).toUpperCase()
                        : "" /* or “?” or any placeholder */
                    }
                  </AvatarFallback>
                </Avatar>

                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user.role === "client"
                      ? user.clientProfile?.username ?? ""
                      : user.professionalProfile?.username ?? ""}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-[160px]">
                    {user.email ?? ""}
                  </p>
                </div>
              </div>

              {/* Dropdown menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className=" cursor-pointer h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 "
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className={`${fira.className}`}>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.email ? user.email.split("@")[0] : ""}
                      </p>
                      <p className="text-xs leading-none text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* Professional Profile button */}
                  {userRole === "professional" && (
                    <DropdownMenuItem
                      onClick={() => {
                        router.push(`/profile/professional/${userInfo.id}`);
                      }}
                      className="cursor-pointer text-md font-semibold text-blue-900 focus:text-blue-950 focus:bg-[#f1e6ff]"
                    >
                      <User className="mr-2 h-12 w-12" />
                      Public Profile
                    </DropdownMenuItem>
                  )}
                  {userRole === "client" && (
                    <DropdownMenuItem
                      onClick={() => {
                        router.push(`/profile/${userInfo.id}`);
                      }}
                      className="cursor-pointer text-md font-semibold text-blue-900 focus:text-blue-950 focus:bg-[#f1e6ff]"
                    >
                      <User className="mr-2 h-12 w-12" />
                      My Profile
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    onClick={() => {
                      router.push(`/messages`);
                    }}
                    className="cursor-pointer text-md font-semibold text-blue-900 focus:text-blue-950 focus:bg-[#f1e6ff]"
                  >
                    <MessageSquareDot className="mr-2 h-12 w-12" />
                    Inbox
                  </DropdownMenuItem>

                  {/* Sign out Button */}
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-md font-semibold text-red-600 focus:text-red-700 focus:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
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
        className={`md:hidden mt-4 transform transition-all duration-300 ease-out ${
          mobileOpen
            ? "opacity-100 scale-100 max-h-[1000px]"
            : "opacity-0 scale-95 max-h-0 overflow-hidden"
        }`}
      >
        {/* Nav links */}
        <nav className="space-y-3 pb-4 border-b border-gray-200">
          <ul className="flex flex-col space-y-1">
            <li>
              <a
                href="#"
                className="block px-4 py-3 rounded-lg font-medium text-gray-800 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Accueil
              </a>
            </li>

            {/* Services mobile */}
            <li className="relative">
              <button
                onClick={() => setServicesOpen((o) => !o)}
                className="flex items-center justify-between w-full px-4 py-3 rounded-lg font-medium text-gray-800 hover:bg-gray-100 active:bg-gray-200 transition-colors"
              >
                <span>Services</span>
                <ChevronDown
                  className={`ml-2 transition-transform duration-200 ${
                    servicesOpen ? "rotate-180" : ""
                  }`}
                  size={18}
                />
              </button>
              <ul
                className={`pl-4 mt-1 space-y-1 transition-all duration-300 ease-in-out ${
                  servicesOpen
                    ? "opacity-100 max-h-[500px]"
                    : "opacity-0 max-h-0 overflow-hidden"
                }`}
              >
                {serviceOptions.map((name) => (
                  <li key={name}>
                    <a
                      href="#"
                      className="block px-4 py-2.5 text-gray-700 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
                      onClick={() => {
                        setServicesOpen(false);
                        setMobileOpen(false);
                      }}
                    >
                      {name}
                    </a>
                  </li>
                ))}
              </ul>
            </li>

            <li>
              <a
                href="#"
                className="block px-4 py-3 rounded-lg font-medium text-gray-800 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                À propos
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block px-4 py-3 rounded-lg font-medium text-gray-800 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Blog
              </a>
            </li>
          </ul>
        </nav>

        {/* Search mobile */}
        <div className="relative w-full px-2 py-4 border-b border-gray-200">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"
              size={20}
            />
            <Input
              type="text"
              placeholder="Try 'Lotus GT 430'"
              className="pl-12 pr-4 py-3 w-full rounded-full bg-gray-100 border-none
                   focus:bg-white focus:ring-2 focus:ring-indigo-500 transition
                   placeholder-gray-500 text-gray-800"
            />
          </div>
        </div>

        {/* Login mobile */}
        <div className="px-4 py-4 md:pt-4 space-y-3">
          <SignIn
            className="block w-full text-center font-medium px-4 py-3 
               text-gray-800 hover:bg-gray-100 rounded-lg 
               transition-colors active:bg-gray-200 
               border border-gray-300"
          />
          <Join
            className="block w-full text-center font-medium px-4 py-3 
               bg-gradient-to-r from-blue-500 to-purple-500 text-white 
               rounded-lg hover:from-blue-600 hover:to-purple-600 
               transition-colors shadow-sm active:scale-[0.98]"
          />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
