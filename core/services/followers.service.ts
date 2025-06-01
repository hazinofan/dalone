import axios from '../../lib/axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL
const BASE = '/followers';

export const followProfessional = async (proId: number) => {
    const response = await axios.post(`${BACKEND_URL}${BASE}/${proId}`);
    return response.data;
};

export const unfollowProfessional = async (proId: number) => {
    const response = await axios.delete(`${BASE}/${proId}`);
    return response.data;
};

export const getFollowersCount = async (proId: number) => {
    const response = await axios.get(`${BACKEND_URL}${BASE}/count/${proId}`);
    return response.data; // number or { count: number }
};

export const checkIfFollowing = async (proId: number) => {
    const response = await axios.get(`/followers/is-following/${proId}`);
    return response.data; // true or false
};
