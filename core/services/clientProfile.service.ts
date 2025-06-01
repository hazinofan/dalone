const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

function getAuthHeaders() {
  const token = localStorage.getItem('dalone:token');
  if (!token) {
    throw new Error('No auth token found—please log in first');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Shape of a ClientProfile as returned from the backend.
 * Adjust or extend fields to match your NestJS entity.
 */
export interface ClientProfile {
  id: number;
  userId: number;
  name: string;
  avatar?: string;
  phoneNumber?: string;
  country?: string;
  city?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Payload used to create a new ClientProfile.
 * Matches CreateClientProfileDto on the backend.
 */
export interface CreateClientProfilePayload {
  name: string;
  avatar?: string;
  phoneNumber?: string;
  country?: string;
  city?: string;
  description?: string;
}

/**
 * Payload used to update an existing ClientProfile.
 * All fields are optional; matches UpdateClientProfileDto.
 */
export interface UpdateClientProfilePayload {
  name?: string;
  avatar?: string;
  phoneNumber?: string;
  country?: string;
  city?: string;
  description?: string;
}

/**
 * Fetch the authenticated user's client profile.
 * GET /client-profile
 */
export const getClientProfile = async (): Promise<ClientProfile> => {
  const res = await fetch(`${API_BASE}/client-profile`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch client profile: ${res.statusText}`);
  }
  return res.json();
};

/**
 * Create a new client profile for the authenticated user.
 * POST /client-profile
 */
export const createClientProfile = async (
  payload: CreateClientProfilePayload
): Promise<ClientProfile> => {
  const res = await fetch(`${API_BASE}/client-profile`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Failed to create client profile: ${res.statusText}`);
  }
  return res.json();
};

/**
 * Update the authenticated user's client profile.
 * PATCH /client-profile
 */
export const updateClientProfile = async (
  payload: UpdateClientProfilePayload
): Promise<ClientProfile> => {
  const res = await fetch(`${API_BASE}/client-profile`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Failed to update client profile: ${res.statusText}`);
  }
  return res.json();
};
