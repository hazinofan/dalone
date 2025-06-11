// src/core/services/users.service.ts

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Helper to read token & build auth headers
function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("dalone:token") : null;
  if (!token) {
    return { "Content-Type": "application/json" };
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// ——————————————————————————————
// 1) Create a new user (public)
// POST /users
// ——————————————————————————————
export interface CreateUserPayload {
  email: string;
  password: string;
  name?: string;
  // …any other fields your CreateUserDto expects…
}

export const createUser = async (payload: CreateUserPayload) => {
  const res = await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to create user: ${res.statusText}`);
  }
  return res.json();
};

// ——————————————————————————————
// 2) Fetch all users (public)
// GET /users
// ——————————————————————————————
export interface UserSummary {
  id: number;
  email: string;
  name?: string;
  role?: string;
  // …any other fields your findAll returns…
}

export const getAllUsers = async (): Promise<UserSummary[]> => {
  const res = await fetch(`${API_BASE}/users`);
  if (!res.ok) {
    throw new Error(`Failed to fetch users: ${res.statusText}`);
  }
  return res.json();
};

// ——————————————————————————————
// 3) Fetch “my profile” (protected)
// GET /users/me
// ——————————————————————————————
export interface UserProfile {
  lastLogin: string;
  id: number;
  email: string;
  name?: string;
  role: string;
  // …any other fields your findById (via /me) returns…
}

export const getProfile = async (): Promise<UserProfile | null> => {
  // Build headers: if a token exists, send it; otherwise omit Authorization
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = typeof window !== 'undefined' ? localStorage.getItem('dalone:token') : null;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/users/me`, {
    method: 'GET',
    headers,
  });

  // If invalid/expired token, return null instead of throwing
  if (res.status === 401 || res.status === 403) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch profile: ${res.statusText}`);
  }

  // This `data` will be either `null` (no user) or a full UserProfile object
  const data = await res.json();
  return data; 
};


// ——————————————————————————————
// 4) Fetch a single user by ID (public)
// GET /users/:id
// ——————————————————————————————
export const getUserById = async (userId: number): Promise<UserProfile> => {
  const res = await fetch(`${API_BASE}/users/${userId}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch user ${userId}: ${res.statusText}`);
  }
  return res.json();
};

export const findAll = async () => {
  const res = await fetch(`${API_BASE}/professional-profile`)
  if(!res.ok) {
    throw new Error(`Failed to fetch the users from the database ${res.statusText}` )
  }
  return res.json()
}


// ——————————————————————————————
// 5) Update a user (protected?)
// PATCH /users/:id
// ——————————————————————————————
export interface UpdateUserPayload {
  email?: string;
  name?: string;
  password?: string;
  // …any other fields your UpdateUserDto expects…
}

export const updateUser = async (
  userId: number,
  updatedData: Partial<UpdateUserPayload>
): Promise<UserProfile> => {
  const res = await fetch(`${API_BASE}/users/${userId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(updatedData),
  });

  if (!res.ok) {
    throw new Error(`Failed to update user ${userId}: ${res.statusText}`);
  }
  return res.json();
};

// ——————————————————————————————
// 6) Delete a user (protected?)
// DELETE /users/:id
// ——————————————————————————————
export const deleteUser = async (userId: number) => {
  const res = await fetch(`${API_BASE}/users/${userId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Failed to delete user ${userId}: ${res.statusText}`);
  }
  return res.json();
};

// ——————————————————————————————
// 7) Update a user’s role (protected)
// PATCH /users/:id/role
// ——————————————————————————————
export type UserRole = "client" | "professional";

export const updateUserRole = async (
  userId: number,
  newRole: UserRole
): Promise<UserProfile> => {
  const res = await fetch(`${API_BASE}/users/${userId}/role`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ role: newRole }),
  });

  if (!res.ok) {
    if (res.status === 400) {
      throw new Error(`Invalid role "${newRole}"`);
    }
    throw new Error(`Failed to update role for user ${userId}: ${res.statusText}`);
  }
  return res.json();
};
