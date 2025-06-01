import axios from '../../lib/axios';

const BASE = '/notifications';

export const getMyNotifications = async () => {
  const response = await axios.get(`${BASE}/me`);
  return response.data;
};

export const markNotificationAsRead = async (id: number) => {
  const response = await axios.patch(`${BASE}/${id}/read`);
  return response.data;
};

export const deleteNotification = async (id: number) => {
  const response = await axios.delete(`${BASE}/${id}`);
  return response.data;
};
