import axios from '../../lib/axios'
import { Message } from '../types/messages.types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL

export async function sendMessage(data: {
    senderId: string;
    recipientId: string;
    content: string;
}) {
    // 1) Send the chat message exactly as before
    const res = await axios.post<Message>(
        `${API_BASE}/messages`,
        data
    );
    const savedMessage = res.data;

    // 2) Build a snippet (first 100 chars) for the notification
    const snippet =
        data.content.length > 100
            ? data.content.slice(0, 97) + '...'
            : data.content;

    // 3) Fire off the throttled‐notification call. We prefix with API_BASE,
    //    then log the result or any error for debugging.
    axios
        .post(
            `${API_BASE}/notifications/message`,
            {
                recipientId: data.recipientId,
                senderId: data.senderId,
                snippet,
            }
        )
        .then((notifRes) => {
            console.log(
                '[sendMessage] /notifications/message response:',
                notifRes.data
            );
        })
        .catch((err) => {
            console.error('[sendMessage] Notification call failed:', err);
        });

    return savedMessage;
}



export interface ConversationPreview {
    otherUserId: string
    isTyping: string
    lastMessage: string
    lastTimestamp: string
    unreadCount: number
}

export async function getMessagesBetween(user1: string, user2: string) {
    const res = await axios.get<Message[]>(
        `/messages/conversation/between`,
        { params: { user1, user2 } }
    );
    return res.data;
}

export async function getMessage(id: string) {
    const res = await axios.get<Message>(`/messages/${id}`);
    return res.data;
}

export async function updateMessage(id: string, update: Partial<Message>) {
    const res = await axios.patch<Message>(`/messages/${id}`, update);
    return res.data;
}

export async function deleteMessage(id: string) {
    await axios.delete(`/messages/${id}`);
}

export async function getConversationsForUser(userId: string) {
    const res = await axios.get<ConversationPreview[]>(
        `/messages/conversations/${userId}`
    )
    return res.data
}

export function markMessagesAsRead(
    recipientId: string,
    senderId: string
): Promise<{ modifiedCount: number }> {
    return axios
        .patch<{ modifiedCount: number }>(
            `${API_BASE}/messages/mark-read`,
            null,
            { params: { recipientId, senderId } }
        )
        .then((res) => res.data);
}