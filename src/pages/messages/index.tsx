// pages/messages/index.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getProfile, getUserById } from "../../../core/services/auth.service";
import { ConversationPreview, getConversationsForUser } from "../../../core/services/messages.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

type EnrichedConversation = ConversationPreview & {
  userInfo: any;
  lastMessageTime?: Date;
};

export default function ConversationsListPage() {
  const [authUserId, setAuthUserId] = useState<string>("");
  const [conversations, setConversations] = useState<EnrichedConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getProfile()
      .then((me) => {
        if (!me?.id) {
          router.push("/");
          return;
        }
        setAuthUserId(String(me.id));
      })
      .catch(() => {
        router.push("/");
      });
  }, [router]);

  useEffect(() => {
    if (!authUserId) return;

    getConversationsForUser(authUserId)
      .then(async (rawList) => {
        const list = rawList as ConversationPreview[];
        
        const enriched = await Promise.all(
          list.map(async (conv) => {
            let userInfo = null;
            try {   
              userInfo = await getUserById(Number(conv.otherUserId));
            } catch {
              // ignore fetch errors
            }
            
            return { 
              ...conv, 
              userInfo,
              lastMessageTime: conv.lastTimestamp ? new Date(conv.lastTimestamp) : undefined
            };
          })
        );
        
        // Sort conversations by most recent message
        enriched.sort((a, b) => {
          if (!a.lastMessageTime || !b.lastMessageTime) return 0;
          return b.lastMessageTime.getTime() - a.lastMessageTime.getTime();
        });
        
        setConversations(enriched);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [authUserId]);

  const getUserDisplayName = (user: any) => {
    return user?.professionalProfile?.username ??
      user?.clientProfile?.username ??
      user?.email ??
      "Unknown User";
  };

  const getUserAvatar = (user: any) => {
    return user?.professionalProfile?.avatar ?? 
      user?.clientProfile?.avatar;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto pt-32 px-4">
        <h1 className="text-2xl font-bold mb-6">Your Conversations</h1>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[160px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Your Conversations</h1>
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No conversations yet</h3>
          <p className="mt-1 text-sm text-gray-500">Start a new conversation to see it appear here.</p>
          <div className="mt-6">
            <Button onClick={() => router.push('/')}>
              Browse Professionals
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto pt-36 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Conversations</h1>
        <Button variant="outline" size="sm">
          New Message
        </Button>
      </div>
      
      <div className="space-y-2">
        {conversations.map((conv) => {
          const other = conv.userInfo;
          const displayName = getUserDisplayName(other);
          
          return (
            <div 
              key={conv.otherUserId}
              className="group hover:bg-gray-50 transition-colors rounded-lg"
            >
              <Button
                variant="ghost"
                className="w-full flex items-center gap-3 text-left p-3 h-auto"
                onClick={() => router.push(`/messages/${conv.otherUserId}`)}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage 
                    src={getUserAvatar(other) ? `${process.env.NEXT_PUBLIC_API_URL}${getUserAvatar(other)}` : undefined} 
                    alt={displayName}
                  />
                  <AvatarFallback className="bg-gray-200 text-gray-700">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className="font-semibold text-gray-900 truncate">
                      {displayName}
                    </p>
                    {conv.lastMessageTime && (
                      <span className="text-xs text-gray-500 shrink-0 ml-2">
                        {formatDistanceToNow(conv.lastMessageTime, { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600 truncate">
                      {conv.lastMessage ?? "No messages yet"}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-blue-600 text-white text-xs font-semibold">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}