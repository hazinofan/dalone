// src/core/services/reviews.services.ts
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const REVIEWS_URL = `${BASE_URL}/reviews`;

export interface Review {
    id: number;
    rating: number;
    comment: string;
    client: { id: number; email: string; /* …other fields*/ };
    professional: { id: number; email: string; /* …other fields*/ };
    createdAt: string;
    updatedAt: string;
}

export interface CreateReviewDto {
    rating: number;
    comment: string;
    professionalId: number;
}

export interface UpdateReviewDto {
    rating?: number;
    comment?: string;
}

const authHeader = (token: string) => ({
    headers: { Authorization: `Bearer ${token}` }
});

export const getReviews = async (): Promise<Review[]> => {
    const { data } = await axios.get<Review[]>(REVIEWS_URL);
    return data;
};

export const getReviewById = async (id: number, token: string): Promise<Review> => {
    const { data } = await axios.get<Review>(`${REVIEWS_URL}/${id}`, authHeader(token));
    return data;
};

export const createReview = async (
    dto: CreateReviewDto,
    token: string
): Promise<Review> => {
    const { data } = await axios.post<Review>(REVIEWS_URL, dto, authHeader(token));
    return data;
};

export const updateReview = async (
    id: number,
    dto: UpdateReviewDto,
    token: string
): Promise<Review> => {
    const { data } = await axios.put<Review>(`${REVIEWS_URL}/${id}`, dto, authHeader(token));
    return data;
};

export const fetchReviewsForProfessional = async (professionalId: number) => {
    const { data } = await axios.get<Review[]>(
        `${BASE_URL}/reviews/professional/${professionalId}`
    );
    return data;
};

export const deleteReview = async (id: number, token: string): Promise<void> => {
    await axios.delete(`${REVIEWS_URL}/${id}`, authHeader(token));
};
