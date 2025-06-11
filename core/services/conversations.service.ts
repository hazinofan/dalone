// core/services/conversations.service.ts
import axios from 'axios';
const API = process.env.NEXT_PUBLIC_API_URL;

export type Conversation = {
  _id: string;
  participants: string[];
  createdAt: string;
  updatedAt: string;
};

export function createConversation(
  userA: string,
  userB: string,
): Promise<Conversation> {
  return axios
    .post(`${API}/conversations`, { participants: [userA, userB] })
    .then(res => res.data);
}

export function getConversationsForUser(userId: string): Promise<Conversation[]> {
  return axios
    .get(`${API}/conversations/user/${userId}`)
    .then(res => res.data);
}

export function findConversationBetween(
  userA: string,
  userB: string,
): Promise<Conversation | null> {
  return axios
    .get(`${API}/conversations/between`, { params: { user1: userA, user2: userB } })
    .then(res => res.data);
}
