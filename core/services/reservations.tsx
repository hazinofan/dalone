import axios from '../../lib/axios';

const BASE = '/reservations';

export interface ReservationRecord {
  id: number;
  clientId?: number;
  professionalId?: number;
  client?: any;
  professional?: any;
  date: string;         // e.g. "2025-06-10"
  timeSlot: string;     // e.g. "10:30"
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  message?: string;
  createdAt: string;
}

// ================================
// ➕ Create a new reservation
// POST /reservations
// ================================
export async function createReservation(payload: {
  professionalId: number;
  date: string;
  timeSlot: string;
  message?: string;
}): Promise<ReservationRecord> {
  const res = await axios.post<ReservationRecord>(`${BASE}`, payload);
  return res.data;
}

// ================================
// 📥 Get my client reservations
// GET /reservations/my
// ================================
export async function getMyReservations(): Promise<ReservationRecord[]> {
  const res = await axios.get<ReservationRecord[]>(`${BASE}/my`);
  return res.data;
}

// ================================
// 📥 Get reservations for a professional
// GET /reservations/professional
// ================================
export async function getProfessionalReservations(): Promise<ReservationRecord[]> {
  const res = await axios.get<ReservationRecord[]>(`${BASE}/professional`);
  return res.data;
}

// ================================
// 🟢 Get available time slots for a week
// GET /reservations/available
// e.g. /reservations/available?professionalId=43&weekStart=2025-06-10
// ================================
export async function getAvailableSlots(professionalId: number, weekStart: string): Promise<Record<string, string[]>> {
  const res = await axios.get(`${BASE}/available`, {
    params: {
      professionalId,
      weekStart,
    },
  });
  return res.data;
}

// ================================
// 🔄 Update reservation status
// PATCH /reservations/:id/status
// ================================
export async function updateReservationStatus(id: number, status: ReservationRecord['status']): Promise<ReservationRecord> {
  const res = await axios.patch<ReservationRecord>(`${BASE}/${id}/status`, { status });
  return res.data;
}

// ================================
// ❌ Delete reservation
// DELETE /reservations/:id
// ================================
export async function deleteReservation(id: number): Promise<void> {
  await axios.delete(`${BASE}/${id}`);
}
