import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import axios from '../../../lib/axios'
import { Message } from "../../../core/types/messages.types";
import { getProfile, getUserById } from "../../../core/services/auth.service";
import { ConversationPreview, getConversationsForUser, getMessagesBetween, markMessagesAsRead } from "../../../core/services/messages.service";
import socket from "../../../lib/socket";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/sonner"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CalendarClock, Ellipsis, Link, MessageSquareText, Send, UserRoundSearch } from "lucide-react";
import { Inter } from "next/font/google";
const fira = Inter({ subsets: ["latin"], weight: ["300", "400", "700"] });


export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<any>(false);
  const [newMessage, setNewMessage] = useState("");
  const [loadingConvos, setLoadingConvos] = useState(false);
  const [authUserId, setAuthUserId] = useState<string>("");
  const { toast } = useToast();
  const [recipientId, setRecipientId] = useState<string>("");
  const [receipientUser, setReceipientUser] = useState<any>(null)
  const [isTyping, setIsTyping] = useState(false);
  const [userRole, setUserRole] = useState('')
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const [conversations, setConversations] = useState<
    (ConversationPreview & { userInfo: any })[]
  >([]);
  const typingIndicatorTimeout = useRef<NodeJS.Timeout | null>(null);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

  // 1) Grab recipientId from URL
  useEffect(() => {
    if (router.isReady && typeof router.query.id === "string") {
      setRecipientId(router.query.id);
    }
  }, [router.isReady, router.query]);

  function getTimeAgo(dateString: string): string {
    // Parse the ISO string directly
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 60) {
      return "just now";
    }

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) {
      return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
    }

    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) {
      return `${diffHrs} hour${diffHrs !== 1 ? "s" : ""} ago`;
    }

    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 14) {
      // Up to 13 days, show “X days ago”
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    }

    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) {
      return `${diffWeeks} week${diffWeeks !== 1 ? "s" : ""} ago`;
    }

    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) {
      return `${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`;
    }

    const diffYears = Math.floor(diffDays / 365);
    if (diffYears >= 1) {
      return `${diffYears} year${diffYears !== 1 ? "s" : ""} ago`;
    }

    // Fallback for anything older than a year:
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  // 1) Grab recipientId from URL
  useEffect(() => {
    if (router.isReady && typeof router.query.id === "string") {
      setRecipientId(router.query.id);
    }
  }, [router.isReady, router.query]);

  // 3) Fetch logged‐in user ID
  useEffect(() => {
    getProfile()
      .then((me: any) => {
        if (!me?.id) {
          router.push("/");
          toast({
            variant: "destructive",
            title: "Authentication issue",
            description: "You must be signed in to access DMs.",
          });
        } else {
          setAuthUserId(String(me.id));
        }
      })
      .catch(() => {
        router.push("/");
      });
  }, [router, toast]);

  // 4) Once authUserId is known, fetch conversation previews
  useEffect(() => {
    if (!authUserId) return;
    setLoadingConvos(true);

    getConversationsForUser(authUserId)
      .then(async (list) => {
        const enriched = await Promise.all(
          list.map(async (conv) => {
            try {
              const userInfo = await getUserById(conv.otherUserId);
              return { ...conv, userInfo };
            } catch {
              return { ...conv, userInfo: null };
            }
          })
        );
        setConversations(enriched);
      })
      .catch((err) => {
        console.error("Failed to load conversations:", err);
      })
      .finally(() => {
        setLoadingConvos(false);
      });
  }, [authUserId]);

  // 5) Whenever recipientId changes (i.e. you open a new chat), load messages and mark unread as read
  useEffect(() => {
    if (!authUserId || !recipientId) return;

    // (A) Fetch chat history
    getMessagesBetween(authUserId, recipientId)
      .then((msgs) => {
        setMessages(msgs);

        // (B) Now mark all messages FROM recipientId → authUserId as read
        //     (swap parameters: first = recipient (you), second = sender (other))
        return markMessagesAsRead(authUserId, recipientId);
      })
      .then((res) => {
        if (res.modifiedCount > 0) {
          // (C) Re‐fetch previews so unreadCount drops to zero
          getConversationsForUser(authUserId)
            .then(async (list) => {
              const enriched = await Promise.all(
                list.map(async (conv) => {
                  try {
                    const userInfo = await getUserById(conv.otherUserId);
                    return { ...conv, userInfo };
                  } catch {
                    return { ...conv, userInfo: null };
                  }
                })
              );
              setConversations(enriched);
            })
            .catch((err) => {
              console.error("Failed to reload conversations:", err);
            });
        }
      })
      .catch(console.error);
  }, [authUserId, recipientId]);


  // 6) Fetch recipient’s profile once we have recipientId
  useEffect(() => {
    if (!recipientId) return;
    getUserById(recipientId)
      .then((u) => setReceipientUser(u))
      .catch(() => console.error("Could not load recipient"));
  }, [recipientId]);

  // 7) WebSocket listeners for real‐time updates & typing
  useEffect(() => {
    if (!authUserId) return;
    socket.emit("join", { userId: authUserId });

    const handleNewMessage = (msg: Message) => {
      const from = String(msg.senderId);
      const to = String(msg.recipientId);
      if (
        (from === authUserId && to === recipientId) ||
        (from === recipientId && to === authUserId)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleTypingEvent = ({ from }: { from: string }) => {
      if (String(from) !== recipientId) return;
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 1500);
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("typing", handleTypingEvent);
    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("typing", handleTypingEvent);
    };
  }, [authUserId, recipientId]);

  // 8) Scroll down whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 9) Send a new message
  const handleSend = () => {
    if (!newMessage.trim()) return;

    // 1) Emit the socket message as before
    socket.emit("sendMessage", {
      senderId: authUserId,
      recipientId,
      content: newMessage.trim(),
    });

    // 2) Then immediately call your REST notification endpoint:
    const snippet =
      newMessage.trim().length > 100
        ? newMessage.trim().slice(0, 97) + "..."
        : newMessage.trim();

    axios
      .post("/notifications/message", {
        recipientId, // still a string, ParseIntPipe on the backend will coerce it
        senderId: authUserId,
        snippet,
      })
      .then((resp: any) => {
        console.log("[DM page] notification response:", resp.data);
      })
      .catch((err: any) => {
        console.error("[DM page] notification call failed:", err);
      });

    setNewMessage("");
  };

  useEffect(() => {
    getProfile()
      .then((me) => {
        if (!me) {
          return
        }
        setUserRole(me.role)
        console.log("Logged-in user:", me.role);
      })
      .catch((err) => {
        console.error("Could not load profile:", err);
      });
  }, []);

  // 10) Emit “typing” when user types
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const handleTyping = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (authUserId && recipientId) {
        socket.emit("typing", { from: authUserId, to: recipientId });
      }
    }, 300);
  };

  // 11) Fetch recipient user info (redundant with 6, but kept for your structure)
  useEffect(() => {
    if (!recipientId) return;

    async function getUser() {
      setLoading(true);
      try {
        const res = await getUserById(recipientId);
        setReceipientUser(res);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    getUser();
  }, [recipientId]);


  if (!receipientUser) {
    return (
      <div className="p-4 px-12 mx-auto pt-28">
        {/* ... you can show a spinner or placeholder here */}
        <p>Loading user…</p>
      </div>
    );
  }


  return (
    <div className="p-4 px-12 mx-auto pt-28">
      <ResizablePanelGroup
        direction="horizontal"
        className="rounded-lg border md:min-w-[450px]"
      >
        <ResizablePanel defaultSize={18} className=" bg-white">
          <div className="flex flex-col gap-5 h-[85vh] p-6">
            <h1 className=" text-xl font-semibold flex flex-row items-center gap-3"> <MessageSquareText /> Live Chat </h1>
            <div className="inline-flex items-center bg-green-100 px-3 py-1 rounded-full">
              <span className="font-semibold mr-2">My Status:</span>
              <span className="relative ml-2 flex-shrink-0">
                <span className="block w-3 h-3 bg-green-500 rounded-full" />
              </span>
              <span className="ml-2 text-green-900">Online</span>
            </div>
            <div className="flex flex-row gap-3 mt-10">
              <CalendarClock />
              <h2 className=" text-lg "> Recent Chats :</h2>
            </div>
            {loadingConvos && (
              <p className="text-sm text-gray-500">Loading…</p>
            )}

            {!loadingConvos &&
              conversations.map((conv) => {
                const isActive = conv.otherUserId === recipientId;
                const user = conv.userInfo;
                const rawAvatar =
                  user?.professionalProfile?.avatar ??
                  user?.clientProfile?.avatar ??
                  null;
                const avatarUrl = rawAvatar
                  ? `${API_BASE_URL}${rawAvatar}`
                  : '/default-avatar.png';
                const username =
                  user?.professionalProfile?.username ??
                  user?.clientProfile?.username ??
                  conv.otherUserId;

                return (
                  <div
                    key={conv.otherUserId}
                    onClick={() => router.push(`/messages/${conv.otherUserId}`)}
                    className={` group flex items-center gap-3 p-3 rounded-lg  transition-colors cursor-pointer ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                  >
                    <div className="relative">
                      <img
                        src={avatarUrl}
                        alt={username}
                        className="rounded-full w-12 h-12 object-cover border-2 border-white shadow-sm"
                      />
                      {conv.unreadCount > 0 && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline gap-2">
                        <p className="font-semibold text-gray-900 truncate">{username}</p>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {new Date(conv.lastTimestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 truncate flex items-center gap-1">
                        {conv.isTyping ? (
                          <>
                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                            <span className="text-blue-500">typing…</span>
                          </>
                        ) : (
                          conv.lastMessage
                        )}
                      </p>
                    </div>

                    {conv.unreadCount > 0 && (
                      <div className="ml-2 bg-blue-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={70}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={15} className="w-full">
              <div className="flex items-center justify-between w-full p-6">
                {/* ─── Left side: avatar + name + status ─── */}
                <div className="flex items-center gap-5 flex-1">
                  {/* Choose between professionalProfile.avatar or clientProfile.avatar */}
                  {receipientUser.professionalProfile?.avatar ? (
                    <img
                      src={`${API_BASE_URL}${receipientUser.professionalProfile.avatar}`}
                      alt="profile picture"
                      className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  ) : receipientUser.clientProfile?.avatar ? (
                    <img
                      src={`${API_BASE_URL}${receipientUser.clientProfile.avatar}`}
                      alt="profile picture"
                      className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  ) : (
                    // fallback if neither profile has an avatar
                    <div className="w-14 h-14 rounded-full bg-gray-200 border-2 border-white" />
                  )}

                  <div className="flex flex-col">
                    {/* Choose between professionalProfile.username or clientProfile.username */}
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {receipientUser.professionalProfile?.username
                        ? receipientUser.professionalProfile.username
                        : receipientUser.clientProfile?.username ?? "Unknown User"}{" "}
                      <span className="text-xs text-gray-500">
                        ({receipientUser.role})
                      </span>
                    </p>
                    <div className="flex items-center">
                      {receipientUser.isOnline && (
                        <span className="block w-3 h-3 bg-green-600 rounded-full" />
                      )}
                      <span
                        className={`text-sm ${receipientUser.isOnline ? "text-green-900" : "text-green-700"
                          }`}
                      >
                        last seen {getTimeAgo(receipientUser.lastLogin)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ─── Right side: dropdown trigger ─── */}
                <div className="flex-shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="px-2 py-1 rounded">
                      <Ellipsis />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className={`${fira.className}`}>
                      <DropdownMenuItem className="cursor-pointer" onClick={() => { router.push(receipientUser.role === "client" ? `/profile/${receipientUser.id}` : `/profile/professional/${receipientUser.id}` )}}>
                         <UserRoundSearch />  Visit Profile 
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle />
            <ResizablePanel defaultSize={90} className="flex flex-col h-full bg-violet-100 shadow-xl rounded-xl overflow-hidden border border-gray-100">
              {/* ─── Messages Area ─── */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gradient-to-b from-white to-gray-50">
                {messages.map((msg) => {
                  const isMine = String(msg.senderId) === authUserId;
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`relative inline-block max-w-[80%] px-4 pt-3 pb-6 ${isMine
                          ? "bg-blue-800 text-white rounded-t-2xl rounded-bl-2xl shadow-blue-100 shadow-md"
                          : "bg-gray-100 text-gray-800 rounded-t-2xl rounded-br-2xl shadow-sm"
                          }`}
                        style={{
                          boxShadow: isMine
                            ? "0 2px 8px -1px rgba(59, 130, 246, 0.2)"
                            : "0 1px 3px rgba(0, 0, 0, 0.05)",
                        }}
                      >
                        <p className="whitespace-pre-wrap text-sm/relaxed">{msg.content}</p>
                        <span
                          className={`absolute text-[10px] ${isMine ? "text-blue-100" : "text-gray-400"
                            } bottom-1 right-2`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex items-center pl-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="ml-2 mt-2 text-xs text-gray-500">Typing...</span>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* ─── Input Area ─── */}
              <div className="border-t border-gray-100 bg-white p-3 flex items-center space-x-2">
                <input
                  className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent placeholder-gray-400 text-sm transition-all duration-200 hover:border-gray-300"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button
                  className="bg-blue-800 hover:bg-blue-700 text-white rounded-full p-2 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
      <Toaster />
    </div>
  );
}
