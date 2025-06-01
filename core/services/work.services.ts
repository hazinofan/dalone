import axios from 'axios';

// Base URL for API calls (set in your .env.local file)
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Work {
  id: number;
  title: string;
  description: string;
  category: string;
  imageUrl: string[];
  userId: number;
  date: string;       // ISO date string
  createdAt: string;  // ISO datetime string
  updatedAt: string;  // ISO datetime string
}

export interface CreateWorkPayload {
  title: string;
  description: string;
  category: string;
  imageUrl: string[];
  userId: number;
  date: string;
}

export interface UpdateWorkPayload {
  title?: string;
  description?: string;
  category?: string;
  imageUrl?: string[];
  date?: string;
}

/**
 * A service module to handle all /works API interactions.
 * Centralizing endpoints here keeps your components clean
 * and avoids scattering URLs across your codebase.
 */
const worksService = {
  /** Fetch all work items */
  getAll: async (): Promise<Work[]> => {
    const response = await axios.get<Work[]>(`${API_URL}/works`);
    return response.data;
  },

  /** Fetch a single work by its ID */
  getById: async (id: number): Promise<Work> => {
    const response = await axios.get<Work>(`${API_URL}/works/${id}`);
    return response.data;
  },

  /** Fetch all works for a given user */
  getByUser: async (userId: number): Promise<Work[]> => {
    const response = await axios.get<Work[]>(`${API_URL}/works/user/${userId}`);
    return response.data;
  },

  /** Create a new work entry */
  create: async (payload: CreateWorkPayload): Promise<Work> => {
    const response = await axios.post<Work>(`${API_URL}/works`, payload);
    return response.data;
  },

  /** Update an existing work entry */
  update: async (id: number, payload: UpdateWorkPayload): Promise<void> => {
    await axios.patch(`${API_URL}/works/${id}`, payload);
  },

  /** Delete a work entry */
  remove: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/works/${id}`);
  }
};

export default worksService;
