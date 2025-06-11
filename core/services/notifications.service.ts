// core/services/notifications.service.ts
import axios from '../../lib/axios';

const BASE = '/notifications';

export interface NotificationRecord {
  id: number;
  userId: number;
  senderId: number | null;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  meta: any;
}

/**
 * Fetch all notifications for the currently authenticated user.
 * Calls GET /notifications/me (JwtAuthGuard protects it).
 */
export async function getMyNotifications(): Promise<NotificationRecord[]> {
  const res = await axios.get<NotificationRecord[]>(`${BASE}/me`);
  return res.data;
}

/**
 * Mark a single notification as “read”.
 * Calls PATCH /notifications/:id/read
 */
export async function markNotificationAsRead(id: number): Promise<void> {
  await axios.patch(`${BASE}/${id}/read`);
}

/**
 * Delete a notification.
 * Calls DELETE /notifications/:id
 */
export async function deleteNotification(id: number): Promise<void> {
  await axios.delete(`${BASE}/${id}`);
}
