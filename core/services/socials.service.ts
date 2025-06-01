// src/core/services/socials.service.ts
import axios, { AxiosInstance } from 'axios';

export interface SocialLink {
  id: number;
  platform: string;
  username?: string;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
}

class SocialsService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL ,
      headers: { 'Content-Type': 'application/json' },
    });

    // attach token if present
    this.api.interceptors.request.use((cfg) => {
      const token = localStorage.getItem('authToken');
      if (token) cfg.headers!['Authorization'] = `Bearer ${token}`;
      return cfg;
    });
  }

  /** GET /socials          — your own (protected) */
  getMine(): Promise<SocialLink[]> {
    return this.api.get<SocialLink[]>('/socials').then(res => res.data);
  }

  /** GET /socials/:userId — public */
  getByUser(userId: number): Promise<SocialLink[]> {
    return this.api.get<SocialLink[]>(`/socials/${userId}`).then(res => res.data);
  }

  /** PUT /socials         — bulk upsert (protected) */
  saveAll(links: Partial<SocialLink>[]): Promise<SocialLink[]> {
    return this.api.put<SocialLink[]>('/socials', { links }).then(res => res.data);
  }

  /** POST /socials         — create one (if you added it) */
  create(link: Partial<SocialLink>): Promise<SocialLink> {
    return this.api.post<SocialLink>('/socials', link).then(res => res.data);
  }

  /** PATCH /socials/:id    — update one (protected) */
  patch(id: number, dto: Partial<SocialLink>): Promise<SocialLink> {
    return this.api.patch<SocialLink>(`/socials/${id}`, dto).then(res => res.data);
  }

  /** DELETE /socials/:id   — remove one (protected) */
  deleteOne(id: number): Promise<void> {
    return this.api.delete(`/socials/${id}`).then(() => {});
  }

  /** DELETE /socials       — remove all (protected) */
  deleteAll(): Promise<void> {
    return this.api.delete('/socials').then(() => {});
  }
}

export default new SocialsService();
