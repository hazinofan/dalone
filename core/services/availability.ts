import axios from '../../lib/axios';

const BASE = '/reservations';

export interface ReservationRecord {
  id: number;
  clientId: number;
  professionalId: number;
  date: string;       // ISO string (e.g. "2025-06-06")
  timeSlot: string;   // e.g. "10:00"
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  message?: string;
  createdAt: string;
}

export async function createReservation(payload: {
  professionalId: any;
  date: string;
  startTime: any;
  endTime: any;
  message?: string;
}): Promise<ReservationRecord> {
  const res = await axios.post<ReservationRecord>(BASE, payload);
  return res.data;
}

export async function getMyReservations(): Promise<ReservationRecord[]> {
  const res = await axios.get<ReservationRecord[]>(`${BASE}/my`);
  return res.data;
}

export async function getProfessionalReservations(): Promise<ReservationRecord[]> {
  const res = await axios.get<ReservationRecord[]>(`${BASE}/professional`);
  return res.data;
}

export async function updateReservationStatus(id: number, status: ReservationRecord['status']): Promise<ReservationRecord> {
  const res = await axios.patch<ReservationRecord>(`${BASE}/${id}/status`, { status });
  return res.data;
}

export async function deleteReservation(id: number): Promise<void> {
  await axios.delete(`${BASE}/${id}`);
}
