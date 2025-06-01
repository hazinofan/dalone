// services/gigs.services.ts

const API_BASE = process.env.NEXT_PUBLIC_API_URL ;

function getAuthHeaders() {
  const token = localStorage.getItem("dalone:token");
  if (!token) {
    throw new Error("No auth token found—please log in first");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export interface Availability {
  [day: string]: {
    from: string;
    to: string;
  };
}

export interface GigPayload {
  heroImage: string;
  about: string;
  whatsIncluded: string[];
  servicePeriod: string;
  priceBeforePromo: number;
  priceAfterPromo?: number | null;
  availability: Availability;
  enableCustomOffers: boolean;
  customOfferPriceBeforePromo?: number | null;
  customOfferPriceAfterPromo?: number | null;
  customOfferDescription?: string | null;
}

export const createGig = async (gig: GigPayload) => {
  const res = await fetch(`${API_BASE}/gigs`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(gig),
  });
  if (!res.ok) {
    throw new Error(`Failed to create gig: ${res.statusText}`);
  }
  return res.json();
};

export const getGigs = async () => {
  const res = await fetch(`${API_BASE}/gigs`);
  if (!res.ok) {
    throw new Error(`Failed to fetch gigs: ${res.statusText}`);
  }
  return res.json();
};

export const getGigById = async (id: number) => {
  const res = await fetch(`${API_BASE}/gigs/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch gig: ${res.statusText}`);
  }
  return res.json();
};

export const getGigByUser = async (userId: number) => {
  const res = await fetch(`${API_BASE}/gigs/user/${userId}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch user’s gigs: ${res.statusText}`);
  }
  return res.json();
};

export const updateGig = async (id: number, updatedData: Partial<GigPayload>) => {
  const res = await fetch(`${API_BASE}/gigs/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(updatedData),
  });
  if (!res.ok) {
    throw new Error(`Failed to update gig: ${res.statusText}`);
  }
  return res.json();
};

export const deleteGig = async (id: number) => {
  const res = await fetch(`${API_BASE}/gigs/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error(`Failed to delete gig: ${res.statusText}`);
  }
  return res.json();
};
