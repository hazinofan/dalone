// core/types/message.type.ts

export type Message = {
  _id: string;
  senderId: string;
  recipientId: string;
  content: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
};
